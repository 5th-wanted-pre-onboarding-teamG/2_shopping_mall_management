import { CouponType } from '../../entities/enums/couponType';
import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateCouponDto {
  @IsNotEmpty()
  @IsString()
  name: string; // 쿠폰이름

  @IsNotEmpty()
  couponType: CouponType; // 쿠폰타입

  @IsInt()
  validPeriod: number; // 유효기간

  @IsInt()
  salePrice?: number; // 쿠폰 할인가격
}
