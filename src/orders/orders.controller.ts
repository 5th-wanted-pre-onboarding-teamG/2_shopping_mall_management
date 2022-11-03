import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Users } from 'src/entities/Users';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@User() user: Users, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(user, createOrderDto);
  }

}
