import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { PaymentsRepository } from './payments.repository';
import { MySqlConfigModule } from '../config/database/config.module';
import { MySqlConfigService } from '../config/database/config.service';
import { AuthModule } from '../auth/auth.module';
import { PaymentsModule } from './payments.module';
import { ValidationPipe } from '@nestjs/common';
import { sessionConfig } from '../auth/auth.session.config';
import { DataSource, Repository } from 'typeorm';
import { Orders } from '../entities/Orders';
import * as request from 'supertest';
import { Users } from '../entities/Users';
import * as bcrypt from 'bcrypt';
import { UserRank } from '../entities/enums/userRank';
import { Payments } from '../entities/Payments';
import { OwnedCoupons } from '../entities/OwnedCoupons';
import { OrderState } from '../entities/enums/orderState';
import { Countries } from '../entities/Countries';
import { DeliveryCosts } from '../entities/DeliveryCosts';
import { Products } from '../entities/Products';
import { Coupons } from '../entities/Coupons';
import { CouponType } from '../entities/enums/couponType';
import { OrderNotFoundException } from '../exception/orders.exception';

describe('PaymentsController', () => {
  let app: NestFastifyApplication;
  let paymentsRepository: PaymentsRepository;
  let usersRepository: Repository<Users>;
  let countriesRepository: Repository<Countries>;
  let deliveryCostsRepository: Repository<DeliveryCosts>;
  let productsRepository: Repository<Products>;
  let ordersRepository: Repository<Orders>;
  let ownedCouponsRepository: Repository<OwnedCoupons>;
  let couponsRepository: Repository<Coupons>;
  let user;
  let country;
  let deliveryCost;
  let product;
  let order;
  let coupon;
  let ownedCoupon;

  const userInit = async () => {
    const password = await bcrypt.hash('1234qwer', 12);
    user = await usersRepository.save({
      email: 'ruby@gmail.com',
      password: password,
      name: 'ruby',
      phone: '010-1111-2222',
      rank: UserRank.NORMAL,
    });
  };

  const countryInit = async () => {
    country = await countriesRepository.save({
      countryCode: 'AF',
      dCode: '+93',
      name: 'Afghanistan',
    });
  };

  const deliveryCostInit = async () => {
    deliveryCost = await deliveryCostsRepository.save({
      quantity: 2,
      price: 20000,
      CountryId: country.CountryId,
      Country: country,
    });
  };

  const productInit = async () => {
    product = await productsRepository.save({
      name: '맥북',
      price: 3600000,
      stock: 10,
    });
  };
  const orderInit = async () => {
    order = await ordersRepository.save({
      orderState: OrderState.PAYMENT_WAITING,
      quantity: 2,
      recipientName: '김루비',
      recipientPhone: '010-1111-2222',
      address: {
        country: 'Afghanistan',
        city: 'asda',
        zipcode: '22222',
      },
      UserId: user.userId,
      DeliveryCostId: deliveryCost.DeliveryCostId,
      ProductId: product.ProductId,
    });
  };
  const couponInit = async () => {
    coupon = await couponsRepository.save({
      name: '할인 쿠폰',
      couponType: CouponType.PERCENT,
      discount: 50,
      validPeriod: 10,
    });
  };
  const ownedCouponInit = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDay();
    ownedCoupon = await ownedCouponsRepository.save({
      issuedDate: new Date(),
      expirationDate: new Date(year, month, day),
      User: user,
      Coupon: coupon,
    });
  };

  // 쿠폰, 보유쿠폰 생성 후 테스트 진행!

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
          imports: [TypeOrmModule.forFeature([Payments, Orders, Users, OwnedCoupons]), MySqlConfigModule],
          useClass: MySqlConfigService,
        }),
        TypeOrmModule.forFeature([Payments, Orders, Users, OwnedCoupons]),
        AuthModule,
        PaymentsModule,
        Repository,
      ],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('/api');
    app.useGlobalPipes(new ValidationPipe());
    sessionConfig(app);
    await app.init();

    const baseRepository = module.get<DataSource>(DataSource);
    paymentsRepository = module.get<PaymentsRepository>(PaymentsRepository);
    usersRepository = baseRepository.getRepository(Users);
    countriesRepository = baseRepository.getRepository(Countries);
    deliveryCostsRepository = baseRepository.getRepository(DeliveryCosts);
    productsRepository = baseRepository.getRepository(Products);
    ordersRepository = baseRepository.getRepository(Orders);
    ownedCouponsRepository = baseRepository.getRepository(OwnedCoupons);
    couponsRepository = baseRepository.getRepository(Coupons);

    await ownedCouponsRepository.delete({});
    await couponsRepository.delete({});
    await paymentsRepository.delete({});
    await ordersRepository.delete({});
    await productsRepository.delete({});
    await usersRepository.delete({});
    await deliveryCostsRepository.delete({});
    await countriesRepository.delete({});

    await userInit();
    await countryInit();
    await deliveryCostInit();
    await productInit();
    await orderInit();
    await couponInit();
    await ownedCouponInit();
  });

  test('로그인 하지 않은 사용자의 결제 요청시 403 응답', async () => {
    await request(app.getHttpServer())
      .post('/api/payments')
      .send({
        orderId: order.orderId,
      })
      .expect(403);
  });

  describe('POST /api/payments - 결제 내역 등록', () => {
    let agent;
    beforeEach(async () => {
      agent = request.agent(app.getHttpServer());
      await agent
        .post('/api/auth/login')
        .send({
          email: 'ruby@gmail.com',
          password: '1234qwer',
        })
        .expect(201);
    });

    describe('결제 내역 실패', () => {
      test('결제할 주문이 존재하지 않을 경우 404 응답', async () => {
        const res = await agent
          .post('/api/payments')
          .send({
            orderId: order.orderId + 999,
          })
          .expect(404);

        expect(res.body.message).toEqual(new OrderNotFoundException().message);
      });
    });

    describe('결제 내역 등록 성공', () => {
      test('할인 쿠폰이 없을 경우 등록 성공', async () => {
        await agent
          .post('/api/payments')
          .send({
            orderId: order.orderId,
          })
          .expect(201);

        const payments = await paymentsRepository.find();
        console.log(payments);
      });

      test('결제 내역 등록 성공', async () => {
        await agent
          .post('/api/payments')
          .send({
            orderId: order.orderId,
            ownedCouponId: ownedCoupon.ownedCouponId,
          })
          .expect(201);
      });
    });
  });
});
