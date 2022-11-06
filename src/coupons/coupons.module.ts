import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';
import { Coupons } from '../entities/Coupons';
import { OwnedCoupons } from '../entities/OwnedCoupons';

@Module({
  imports: [TypeOrmModule.forFeature([Coupons, OwnedCoupons])],
  controllers: [CouponsController],
  providers: [CouponsService],
})
export class CouponsModule {}
