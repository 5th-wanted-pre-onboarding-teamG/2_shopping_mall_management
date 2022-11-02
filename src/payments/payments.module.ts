import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import { Payments } from '../entities/Payments';
import { Orders } from '../entities/Orders';
import { UserCoupons } from '../entities/UserCoupons';

@Module({
  imports: [TypeOrmModule.forFeature([Payments, Orders, Users, UserCoupons])],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
