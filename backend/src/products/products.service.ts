import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return await this.productsRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Product | null> {
    return await this.productsRepository.findOne({ where: { id } });
  }

  async updateStock(id: number, quantity: number): Promise<void> {
    await this.productsRepository.update(id, {
      availableStock: quantity,
    });
  }

  async decrementStock(id: number, quantity: number): Promise<boolean> {
    const result = await this.productsRepository
      .createQueryBuilder()
      .update(Product)
      .set({
        availableStock: () => `availableStock - ${quantity}`,
      })
      .where('id = :id', { id })
      .andWhere('availableStock >= :quantity', { quantity })
      .execute();

    return (result.affected ?? 0) > 0;
  }

  async incrementStock(id: number, quantity: number): Promise<void> {
    await this.productsRepository
      .createQueryBuilder()
      .update(Product)
      .set({
        availableStock: () => `availableStock + ${quantity}`,
      })
      .where('id = :id', { id })
      .execute();
  }
}
