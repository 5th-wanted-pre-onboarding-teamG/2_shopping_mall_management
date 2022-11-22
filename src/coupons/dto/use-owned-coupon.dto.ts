import { IsNotEmpty, IsNumber } from 'class-validator';

export class UseOwnedCouponDto {
  @IsNotEmpty()
  @IsNumber()
  ownedCouponId: number;

  @IsNotEmpty()
  @IsNumber()
  orderId: number;
}
