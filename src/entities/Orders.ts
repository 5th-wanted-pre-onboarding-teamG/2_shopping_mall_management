import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DateColumns } from './embeddeds/dateColumns';
import { OrderState } from './enums/orderState';
import { Address } from './embeddeds/address';
import { UserCoupons } from './UserCoupons';
import { Payments } from './Payments';
import { Users } from './Users';
import { Products } from './Products';
import { DeliveryCosts } from './DeliveryCosts';

@Entity({ schema: 'product_shopping', name: 'orders' })
export class Orders {
  @PrimaryGeneratedColumn()
  orderId: number;

  @Column({ type: 'enum', name: 'orderState', enum: OrderState })
  orderState: OrderState;

  @Column()
  quantity: number;

  @Column()
  recipientName: string;

  @Column()
  recipientPhone: string;

  @Column(() => Address, { prefix: false })
  address: Address;

  @Column(() => DateColumns, { prefix: false })
  dateColumns: DateColumns;

  @ManyToOne(() => Users, (users) => users.orders)
  user: Users;

  @ManyToOne(() => DeliveryCosts, (deliveryCosts) => deliveryCosts.orders)
  deliveryCost: DeliveryCosts;

  @ManyToOne(() => Products, (products) => products.orders)
  product: Products;

  @OneToMany(() => UserCoupons, (userCoupons) => userCoupons.order)
  userCoupons: UserCoupons[];

  @OneToMany(() => Payments, (payments) => payments.order)
  payments: Payments[];
}
