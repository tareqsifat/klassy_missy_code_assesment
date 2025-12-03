import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ReservationsService } from './reservations.service';
import { Logger } from '@nestjs/common';

@Processor('reservations')
export class ReservationsProcessor {
  private readonly logger = new Logger(ReservationsProcessor.name);

  constructor(private readonly reservationsService: ReservationsService) {}

  @Process('expire-reservation')
  async handleReservationExpiration(job: Job<{ reservationId: number }>) {
    const { reservationId } = job.data;
    this.logger.log(`Processing expiration for reservation ${reservationId}`);

    try {
      await this.reservationsService.expire(reservationId);
      this.logger.log(`Reservation ${reservationId} expired successfully`);
    } catch (error) {
      this.logger.error(
        `Failed to expire reservation ${reservationId}`,
        error.stack,
      );
      throw error;
    }
  }
}
