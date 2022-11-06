import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { Orders } from '../entities/Orders';
import { Users } from '../entities/Users';
import { DataSource, Repository } from 'typeorm';
import { OwnedCoupons } from '../entities/OwnedCoupons';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { OrderNotFoundException } from '../exception/orders.exception';
import { PaymentsRepository } from './payments.repository';
import { ResultExistsOrderDto } from './dto/result-existsOrder.dto';
import { ResultExistsOwnedCouponDto } from './dto/result-existsOwnedCoupon.dto';

const mockDataSource = () => ({
  createQueryRunner: jest.fn(() => ({
    manager: {
      getRepository: jest.fn(() => ({
        createQueryBuilder: jest.fn(() => ({
          update: jest.fn(() => ({
            set: jest.fn(() => ({
              where: jest.fn(() => ({
                execute: jest.fn(),
              })),
            })),
          })),
        })),
        insert: jest.fn(),
      })),
    },

    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    release: jest.fn(),
    rollbackTransaction: jest.fn(),
  })),

  getRepository: jest.fn(() => ({
    target: jest.fn(),
    manager: jest.fn(),
    queryRunner: jest.fn(),
  })),
});
const mockOrdersRepository = () => ({});
const mockUsersRepository = () => ({});
const mockOwnedCouponsRepository = () => ({});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
type MockDataSource = Partial<Record<keyof DataSource, jest.Mock>>;

describe('PaymentsService', () => {
  let dataSource: MockDataSource;
  let paymentsService: PaymentsService;
  let paymentsRepository: PaymentsRepository;
  let ordersRepository: MockRepository<Orders>;
  let usersRepository: MockRepository<Users>;
  let ownedCouponsRepository: MockRepository<OwnedCoupons>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        PaymentsRepository,
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource(),
        },
        {
          provide: getRepositoryToken(Orders),
          useValue: mockOrdersRepository(),
        },
        {
          provide: getRepositoryToken(Users),
          useValue: mockUsersRepository(),
        },
        {
          provide: getRepositoryToken(OwnedCoupons),
          useValue: mockOwnedCouponsRepository(),
        },
      ],
    }).compile();

    dataSource = module.get<MockDataSource>(getDataSourceToken());
    paymentsService = module.get<PaymentsService>(PaymentsService);
    paymentsRepository = module.get<PaymentsRepository>(PaymentsRepository);
    ordersRepository = module.get<MockRepository<Orders>>(getRepositoryToken(Orders));
    usersRepository = module.get<MockRepository<Users>>(getRepositoryToken(Users));
    ownedCouponsRepository = module.get<MockRepository<OwnedCoupons>>(getRepositoryToken(OwnedCoupons));
  });

  describe('결제 내역 등록', () => {
    describe('결제 등록 실패', () => {
      test('결제할 주문 정보가 없을 경우 OrderNotFoundException 예외 처리', async () => {
        const createPayment = new CreatePaymentDto();
        const user = new Users();
        jest.spyOn(paymentsRepository, 'getOrderById').mockResolvedValue(Promise.resolve(null));

        return expect(paymentsService.createPayment(createPayment, user)).rejects.toThrowError(
          new OrderNotFoundException().message,
        );
      });
    });

    test('결제 성공', async () => {
      const createPayment = new CreatePaymentDto();
      const user = new Users();

      jest.spyOn(paymentsRepository, 'getOrderById').mockResolvedValue(new ResultExistsOrderDto());
      jest
        .spyOn(paymentsRepository, 'getOwnedCouponById')
        .mockResolvedValue(Promise.resolve(new ResultExistsOwnedCouponDto()));

      return expect(paymentsService.createPayment(createPayment, user));
    });
  });
});
