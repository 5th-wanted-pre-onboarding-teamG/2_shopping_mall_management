import { IsNotEmpty, IsNumber } from 'class-validator';

export class RestoreOwnedCouponDto {
  @IsNotEmpty()
  @IsNumber()
  ownedCouponId: number;

  @IsNotEmpty()
  @IsNumber()
  orderId: number;
}
