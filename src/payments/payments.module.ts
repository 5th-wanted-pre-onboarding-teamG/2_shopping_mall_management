import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import { Payments } from '../entities/Payments';
import { Orders } from '../entities/Orders';
import { OwnedCoupons } from '../entities/OwnedCoupons';

@Module({
  imports: [TypeOrmModule.forFeature([Payments, Orders, Users, OwnedCoupons])],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
