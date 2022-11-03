import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Countries } from 'src/entities/Countries';
import { DeliveryCosts } from 'src/entities/DeliveryCosts';
import { OrderState } from 'src/entities/enums/orderState';
import { Orders } from 'src/entities/Orders';
import { Products } from 'src/entities/Products';
import { Users } from 'src/entities/Users';
import { DataSource, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  private take = 30;
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Orders) private readonly ordersRepository: Repository<Orders>,
    @InjectRepository(Users) private readonly usersRepository: Repository<Users>,
  ) {}

  async createOrder(user: Users, createOrderDto: CreateOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    // 트랜잭션 시작
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // 서비스 구현
    try {
      // 국가명
      const [{ name }, { deliveryCostId }] = await Promise.all([
        queryRunner.manager.getRepository(Countries).findOne({
          where: { countryId: createOrderDto.countryId },
        }),
        queryRunner.manager.getRepository(DeliveryCosts).findOne({
          where: { CountryId: createOrderDto.countryId, quantity: createOrderDto.quantity },
        }),
      ]);

      // 주문 내역 작성
      const [result, _] = await Promise.all([
        await queryRunner.manager.getRepository(Orders).save({
          UserId: user.userId,
          ProductId: createOrderDto.productId,
          DeliveryCostId: deliveryCostId,
          orderState: OrderState.PAYMENT_WAITING,
          quantity: createOrderDto.quantity,
          address: { country: name, city: createOrderDto.city, zipcode: createOrderDto.zipCode },
          recipientName: createOrderDto.name || '',
          recipientPhone: createOrderDto.phone || '',
        }),
        await queryRunner.manager
          .createQueryBuilder()
          .update(Products)
          .set({ stock: () => 'stock - 1' })
          .where('productId = :productId', { productId: createOrderDto.productId })
          .execute(),
      ]);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('주문 과정에서 오류가 발생했습니다.');
    } finally {
      await queryRunner.release();
    }
  }

export class OrdersService {}
