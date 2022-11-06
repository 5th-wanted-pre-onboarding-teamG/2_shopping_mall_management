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
import { PaymentState } from '../entities/enums/paymentState';

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
  let manager;
  let country;
  let deliveryCost;
  let product;
  let order;
  let coupon;
  let ownedCoupon;

  const userInit = async () => {
    const password = await bcrypt.hash('1234qwer', 12);
    return usersRepository.save({
      email: 'ruby@gmail.com',
      password: password,
      name: 'ruby',
      phone: '010-1111-2222',
      rank: UserRank.NORMAL,
    });
  };

  const managerInit = async () => {
    const password = await bcrypt.hash('1234qwer', 12);
    return usersRepository.save({
      email: 'rubykim@gmail.com',
      password: password,
      name: 'rubykim',
      phone: '010-1111-2222',
      rank: UserRank.MANAGER,
    });
  };

  const countryInit = async () => {
    return countriesRepository.save({
      countryCode: 'AF',
      dCode: '+93',
      name: 'Afghanistan',
    });
  };

  const deliveryCostInit = async (country) => {
    return deliveryCostsRepository.save({
      quantity: 2,
      price: 20000,
      CountryId: country.CountryId,
      Country: country,
    });
  };

  const productInit = async () => {
    return productsRepository.save({
      name: '맥북',
      price: 3600000,
      stock: 10,
    });
  };
  const orderInit = async (user, deliveryCost, product) => {
    return ordersRepository.save({
      orderState: OrderState.PAYMENT_WAITING,
      quantity: 2,
      recipientName: '김루비',
      recipientPhone: '010-1111-2222',
      address: {
        country: 'Afghanistan',
        city: 'asda',
        zipcode: '22222',
      },
      User: user,
      DeliveryCostId: deliveryCost.DeliveryCostId,
      Product: product,
    });
  };
  const couponInit = async () => {
    return couponsRepository.save({
      name: '할인 쿠폰',
      couponType: CouponType.PERCENT,
      discount: 50,
      validPeriod: 10,
    });
  };
  const ownedCouponInit = async (user, coupon) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDay();
    return ownedCouponsRepository.save({
      issuedDate: new Date(),
      expirationDate: new Date(year, month, day),
      User: user,
      Coupon: coupon,
    });
  };

  const testInit = async () => {
    await ownedCouponsRepository.delete({});
    await couponsRepository.delete({});
    await paymentsRepository.delete({});
    await ordersRepository.delete({});
    await productsRepository.delete({});
    await usersRepository.delete({});
    await deliveryCostsRepository.delete({});
    await countriesRepository.delete({});

    user = await userInit();
    manager = await managerInit();
    country = await countryInit();
    deliveryCost = await deliveryCostInit(country);
    product = await productInit();
    order = await orderInit(user, deliveryCost, product);
    coupon = await couponInit();
    ownedCoupon = await ownedCouponInit(user, coupon);
  };

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
  });

  describe('POST /api/payments - 결제 내역 등록', () => {
    test('로그인 하지 않은 사용자의 결제 요청시 403 응답', async () => {
      await testInit();
      await request(app.getHttpServer())
        .post('/api/payments')
        .send({
          orderId: order.orderId,
        })
        .expect(403);
    });

    describe('로그인 인증 된 사용자의 요청', () => {
      describe('결제 내역 실패', () => {
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
        let agent;
        beforeEach(async () => {
          await testInit();
          agent = request.agent(app.getHttpServer());
          await agent
            .post('/api/auth/login')
            .send({
              email: 'ruby@gmail.com',
              password: '1234qwer',
            })
            .expect(201);
        });

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

  describe('GET /api/payments/users - 유저의 개인 결제 내역 조회', () => {
    let payment;
    beforeAll(async () => {
      await testInit();
      payment = await paymentsRepository.save({
        paymentState: PaymentState.COMPLETE,
        orderPrice: 1000000,
        discountedPrice: 100000,
        paymentPrice: 900000,
        Order: order,
        User: user,
      });
    });

    test('로그인 하지 않은 사용자의 결제 요청시 403 응답', async () => {
      await request(app.getHttpServer()).get('/api/payments/users').expect(403);
    });

    describe('로그인 인증 된 사용자의 요청', () => {
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

      test('사용자 개인의 결재 내역 조회', async () => {
        const res = await agent.get('/api/payments/users').expect(200);

        expect(res.body.payments[0].orderPrice).toEqual(payment.orderPrice);
        expect(res.body.payments[0].discountedPrice).toEqual(payment.discountedPrice);
        expect(res.body.payments[0].paymentPrice).toEqual(payment.paymentPrice);
        expect(res.body.payments[0].paymentState).toEqual(payment.paymentState);
        expect(res.body.payments[0].productName).toEqual(product.name);
        expect(res.body.payments[0].quantity).toEqual(order.quantity);
      });
    });
  });

  describe('GET /api/payments - 결제 내역 검색 조회', () => {
    let payment;
    beforeAll(async () => {
      await testInit();
      payment = await paymentsRepository.save({
        paymentState: PaymentState.COMPLETE,
        orderPrice: 1000000,
        discountedPrice: 100000,
        paymentPrice: 900000,
        Order: order,
        User: user,
      });
    });

    test('로그인 하지 않은 사용자의 결제 요청시 403 응답', async () => {
      await request(app.getHttpServer()).get('/api/payments').expect(403);
    });

    describe('일반 사용자 로그인', () => {
      let agent;
      beforeAll(async () => {
        agent = request.agent(app.getHttpServer());
        await agent
          .post('/api/auth/login')
          .send({
            email: user.email,
            password: '1234qwer',
          })
          .expect(201);
      });

      test('일반 사용자 권한으로 결제 내역 검색 조회 요청시 403 응답', async () => {
        await request(app.getHttpServer()).get('/api/payments').expect(403);
      });
    });

    describe('관리자 사용자 로그인', () => {
      let agent;
      beforeAll(async () => {
        agent = request.agent(app.getHttpServer());
        await agent
          .post('/api/auth/login')
          .send({
            email: manager.email,
            password: '1234qwer',
          })
          .expect(201);
      });

      test('사용자 이름으로 결제 내역 검색', async () => {
        const res = await agent.get('/api/payments').query({
          keyword: 'ru',
        });

        expect(res.body.payments.length).toEqual(1);
      });

      test('존재하지 않는 사용자 이름으로 결제 내역 검색', async () => {
        const res = await agent.get('/api/payments').query({
          keyword: 'dia',
        });

        expect(res.body.payments.length).toEqual(0);
      });

      test('검색 기간 내에 결제 내역이 없는 경우', async () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDay();
        const res = await agent.get('/api/payments').query({
          startDate: new Date(year, month, day),
        });

        expect(res.body.payments.length).toEqual(0);
      });

      test('검색 기간 내에 결제 내역이 있는 경우', async () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const day = now.getDay();
        const res = await agent.get('/api/payments').query({
          startDate: new Date(year, month - 1, day),
          endDate: new Date(year, month, day + 10),
        });

        expect(res.body.payments.length).toEqual(1);
      });
    });
  });
});
