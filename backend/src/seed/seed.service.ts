import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async seed() {
    const count = await this.productsRepository.count();
    
    if (count > 0) {
      this.logger.log('Database already seeded, skipping...');
      return;
    }

    const products = [
      {
        name: 'iPhone 15 Pro',
        price: 999.99,
        availableStock: 50,
      },
      {
        name: 'Samsung Galaxy S24',
        price: 899.99,
        availableStock: 45,
      },
      {
        name: 'MacBook Pro M3',
        price: 2499.99,
        availableStock: 30,
      },
      {
        name: 'Sony WH-1000XM5',
        price: 399.99,
        availableStock: 100,
      },
      {
        name: 'iPad Air',
        price: 599.99,
        availableStock: 75,
      },
      {
        name: 'Apple Watch Series 9',
        price: 429.99,
        availableStock: 60,
      },
      {
        name: 'Sony PlayStation 5',
        price: 499.99,
        availableStock: 25,
      },
      {
        name: 'Nintendo Switch OLED',
        price: 349.99,
        availableStock: 80,
      },
      {
        name: 'Dell XPS 15',
        price: 1799.99,
        availableStock: 40,
      },
      {
        name: 'LG OLED TV 55"',
        price: 1299.99,
        availableStock: 20,
      },
    ];

    await this.productsRepository.save(products);
    this.logger.log(`Seeded ${products.length} products successfully`);
  }
}
