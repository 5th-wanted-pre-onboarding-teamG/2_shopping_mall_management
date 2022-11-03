import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { User } from 'src/auth/auth.decorator';
import { AuthenticatedGuard, OperateGuard } from 'src/auth/auth.guard';
import { OrderState } from 'src/entities/enums/orderState';
import { Users } from 'src/entities/Users';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@UseGuards(AuthenticatedGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@User() user: Users, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(user, createOrderDto);
  }

  @Get()
  getMyOrders(@User() user: Users) {
    return this.ordersService.getMyOrders(user.userId);
  }

  @Get('search')
  searchSpecificOrders(@User() user: Users, @Query() query: { startDate: Date; endDate: Date; state?: OrderState }) {
    return this.ordersService.searchSpecificOrders(user.userId, query.startDate, query.endDate, query.state);
  }

  @UseGuards(OperateGuard)
  @Get(':name/users')
  getOrdersByName(@Param('name') name: string) {
    return this.ordersService.getOrdersByName(name);
  }

  @UseGuards(OperateGuard)
  @Patch(':orderId')
  updateOrderState(@Param('orderId', ParseIntPipe) orderId: number, @Body('state') state: OrderState) {
    return this.ordersService.updateOrderState(orderId, state);
  }
  @Delete(':orderId/cancel')
  cancelOrder(@User() user: Users, @Param('orderId', ParseIntPipe) orderId: number) {
    return this.ordersService.cancelOrder(user.userId, orderId);
  }
}
