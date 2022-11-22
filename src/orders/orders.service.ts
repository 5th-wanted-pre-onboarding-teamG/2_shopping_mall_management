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

  async getMyOrders(userId: number) {
    return await this.ordersRepository.find({
      where: { UserId: userId },
    });
  }

  async getOrdersByName(name: string) {
    const [{ Orders: orders }] = await this.usersRepository.find({
      where: { name },
      join: {
        alias: 'users',
        innerJoinAndSelect: {
          orders: 'users.Orders',
        },
      },
    });
    return orders;
  }

  async searchSpecificOrders(userId: number, startDate: Date, endDate = new Date(), state?: OrderState, page = 1) {
    const queryBuilder = this.dataSource
      .getRepository(Orders)
      .createQueryBuilder('orders')
      .where('orders.UserId = :userId', { userId })
      .andWhere('orders.createAt >= :startDate', { startDate })
      .andWhere('orders.deleteAt <= :endDate', { endDate })
      .take(this.take)
      .skip(this.take * (page - 1))
      .orderBy('orders.createAt', 'DESC');

    if (state) {
      queryBuilder.andWhere('orders.orderState = :state', { state });
    }

    return await queryBuilder.getManyAndCount();
  }

  async updateOrderState(orderId: number, orderState: OrderState) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await queryRunner.manager.update<Orders>(Orders, { orderId }, { orderState });
      await queryRunner.commitTransaction();
      return result.affected;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error || '수정 과정에서 오류가 발생했습니다.');
    } finally {
      await queryRunner.release();
    }
  }

  async cancelOrder(userId: number, orderId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    if (!this.isValidOrderRequest(userId, orderId)) {
      throw new BadRequestException('해당 유저의 주문내역이 아닙니다.');
    }

    const { quantity, ProductId: productId } = await queryRunner.manager
      .getRepository(Orders)
      .findOne({ where: { orderId }, select: ['quantity', 'ProductId'] });

    try {
      await Promise.all([
        queryRunner.manager.update<Orders>(Orders, { orderId }, { orderState: OrderState.CANCLE_ORDER }),
        queryRunner.manager
          .createQueryBuilder()
          .update(Products)
          .set({ stock: () => `stock + ${quantity}` })
          .where('productId = :productId', { productId })
          .execute(),
      ]);
      await queryRunner.commitTransaction();
      return;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
      throw new BadRequestException('취소 과정에서 오류가 발생했습니다');
    } finally {
      await queryRunner.release();
    }
  }

  async deleteOrderHistory(userId: number, orderId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    if (!this.isValidOrderRequest(userId, orderId)) {
      throw new BadRequestException('해당 유저의 주문내역이 아닙니다.');
    }

    try {
      await queryRunner.manager.getRepository(Orders).softDelete({ orderId });
      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('주문내역 삭제 과정에서 오류가 발생했습니다.');
    } finally {
      await queryRunner.release();
    }
  }

  async isValidOrderRequest(userId: number, orderId: number) {
    const { UserId } = await this.ordersRepository.findOne({ where: { orderId } });
    if (UserId === userId) {
      return true;
    } else {
      return false;
    }
  }
}
