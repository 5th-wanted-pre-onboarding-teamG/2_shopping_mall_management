import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CouponType } from 'src/entities/enums/couponType';

export class GetUserOwnedCouponsRes {
  @IsNotEmpty()
  @IsNumber()
  ownedCouponId: number;

  @IsNotEmpty()
  issuedDate: Date;

  @IsBoolean()
  isExtendDate: boolean;

  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  couponId: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(CouponType)
  couponType: string;

  @IsNotEmpty()
  @IsNumber()
  discount: number;

  @IsNotEmpty()
  @IsNumber()
  validPeriod: number;

  usedDate?: Date;
  expirationDate?: Date;
  orderId?: number;
}
