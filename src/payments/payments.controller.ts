import { Body, Controller, Get, HttpStatus, Post, Query, Res, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AuthenticatedGuard, OperateGuard } from '../auth/auth.guard';
import { SearchPayments } from './dto/search-payments';
import { User } from '../auth/auth.decorator';
import { Users } from '../entities/Users';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly usersService: PaymentsService) {}

  /**
   * @Url POST /api/payments
   * 결제 내역 등록
   * @param user 세션에 저장된 유저 정보
   * @param createPaymentDto 결제 등록에 필요한 정보
   * @param res 요청 결과
   */
  @UseGuards(AuthenticatedGuard)
  @Post()
  async createPayment(@User() user: Users, @Body() createPaymentDto: CreatePaymentDto, @Res() res) {
    await this.usersService.createPayment(createPaymentDto, user);
    res.status(HttpStatus.CREATED).send();
  }

  /**
   * @Url GET /api/payments/users
   * 유저의 개인 결제 내역
   * @param user 세션에 저장된 유저 정보
   */
  @UseGuards(AuthenticatedGuard)
  @Get('users')
  async getPaymentsByUser(@User() user: Users) {
    return this.usersService.getPaymentsByUser(user);
  }

  /**
   * @Url GET /api/payments
   * 결제 내역 검색 조회
   * @param searchPayment 검색어, 페이지 등 검색 조건
   */
  @UseGuards(OperateGuard)
  @Get()
  async getPaymentsBySearch(@Query() searchPayment: SearchPayments) {
    return this.usersService.getPaymentsBySearch(searchPayment);
  }
}
