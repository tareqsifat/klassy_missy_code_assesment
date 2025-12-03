import { IsNumber, IsPositive, Min } from 'class-validator';

export class CreateReservationDto {
  @IsNumber()
  @IsPositive()
  productId: number;

  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;
}
