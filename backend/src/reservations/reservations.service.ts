import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { Product } from '../entities/product.entity';
import { ProductsService } from '../products/products.service';
import { CreateReservationDto } from '../dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  private readonly RESERVATION_DURATION_MS = 2 * 60 * 1000; // 2 minutes

  constructor(
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,
    private productsService: ProductsService,
    private dataSource: DataSource,
    @InjectQueue('reservations') private reservationsQueue: Queue,
  ) {}

  async create(createReservationDto: CreateReservationDto): Promise<Reservation> {
    const { productId, quantity } = createReservationDto;

    // Check if product exists first
    const product = await this.productsService.findOne(productId);
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Check stock availability
    if (product.availableStock < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${product.availableStock}, Requested: ${quantity}`,
      );
    }

    // Attempt to decrement stock atomically (outside transaction for atomicity)
    const stockDecremented = await this.productsService.decrementStock(
      productId,
      quantity,
    );

    if (!stockDecremented) {
      throw new BadRequestException(
        `Insufficient stock. The item may have been reserved by someone else.`,
      );
    }

    // Create reservation - stock already decremented
    try {
      const expiresAt = new Date(Date.now() + this.RESERVATION_DURATION_MS);
      const reservation = this.reservationsRepository.create({
        productId,
        quantity,
        status: ReservationStatus.ACTIVE,
        expiresAt,
      });

      const savedReservation = await this.reservationsRepository.save(reservation);

      // Schedule expiration job
      await this.reservationsQueue.add(
        'expire-reservation',
        { reservationId: savedReservation.id },
        { delay: this.RESERVATION_DURATION_MS },
      );

      // Return with product relation for frontend display
      const result = await this.reservationsRepository.findOne({
        where: { id: savedReservation.id },
        relations: ['product'],
      });
      return result!;
    } catch (error) {
      // If reservation creation fails, restore stock
      await this.productsService.incrementStock(productId, quantity);
      throw error;
    }
  }

  async complete(id: number): Promise<Reservation> {
    // Atomically update status from ACTIVE to COMPLETED
    const result = await this.reservationsRepository.update(
      { id, status: ReservationStatus.ACTIVE },
      { status: ReservationStatus.COMPLETED },
    );

    if ((result.affected ?? 0) === 0) {
      const reservation = await this.reservationsRepository.findOne({
        where: { id },
        relations: ['product'],
      });

      if (!reservation) {
        throw new NotFoundException(`Reservation with ID ${id} not found`);
      }

      if (reservation.status === ReservationStatus.EXPIRED) {
        throw new ConflictException('Reservation has expired');
      }

      if (reservation.status === ReservationStatus.COMPLETED) {
        return reservation; // Already completed
      }
    }

    // Return with product relation
    const updated = await this.reservationsRepository.findOne({ 
      where: { id },
      relations: ['product'],
    });
    if (!updated) {
       throw new NotFoundException(`Reservation with ID ${id} not found`);
    }
    return updated;
  }

  async expire(id: number): Promise<void> {
    const reservation = await this.reservationsRepository.findOne({
      where: { id },
    });

    if (!reservation || reservation.status !== ReservationStatus.ACTIVE) {
      return;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Atomically mark as expired only if still ACTIVE
      const result = await queryRunner.manager
        .createQueryBuilder()
        .update(Reservation)
        .set({ status: ReservationStatus.EXPIRED })
        .where('id = :id', { id })
        .andWhere('status = :status', { status: ReservationStatus.ACTIVE })
        .execute();

      if ((result.affected ?? 0) > 0) {
        // Only restore stock if WE were the ones who expired it
        await queryRunner.manager
          .createQueryBuilder()
          .update(Product)
          .set({
            availableStock: () => `availableStock + ${reservation.quantity}`,
          })
          .where('id = :id', { id: reservation.productId })
          .execute();
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Reservation[]> {
    return await this.reservationsRepository.find({
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Reservation | null> {
    return await this.reservationsRepository.findOne({
      where: { id },
      relations: ['product'],
    });
  }
}
