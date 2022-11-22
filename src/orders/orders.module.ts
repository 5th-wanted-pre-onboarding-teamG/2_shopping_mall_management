import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from 'src/entities/Orders';
import { Users } from 'src/entities/Users';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Orders])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
