import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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

  @Column('int', { primary: true, name: 'UserId' })
  UserId: number;

  @Column('int', { primary: true, name: 'DeliveryCostId' })
  DeliveryCostId: number;

  @ManyToOne(() => Users, (users) => users.Orders, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'UserId', referencedColumnName: 'userId' }])
  User: Users;

  @ManyToOne(() => DeliveryCosts, (deliveryCosts) => deliveryCosts.Orders, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'DeliveryCostId', referencedColumnName: 'deliveryCostId' }])
  DeliveryCost: DeliveryCosts;

  @ManyToOne(() => Products, (products) => products.orders)
  product: Products;

  @OneToMany(() => UserCoupons, (userCoupons) => userCoupons.order)
  userCoupons: UserCoupons[];

  @OneToMany(() => Payments, (payments) => payments.order)
  payments: Payments[];
}
