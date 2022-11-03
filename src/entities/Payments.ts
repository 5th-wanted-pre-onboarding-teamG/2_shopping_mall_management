import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentState } from './enums/paymentState';
import { DateColumns } from './embeddeds/dateColumns';
import { Orders } from './Orders';

@Entity({ schema: 'product_shopping', name: 'payments' })
export class Payments {
  @PrimaryGeneratedColumn({ type: 'int', name: 'paymentId' })
  paymentId: number;

  @Column({ type: 'enum', name: 'paymentState', enum: PaymentState })
  paymentState: PaymentState;

  @Column()
  orderPrice: number;

  @Column()
  discountedPrice: number;

  @Column()
  paymentPrice: number;

  @Column(() => DateColumns, { prefix: false })
  dateColumns: DateColumns;

  @Column('int', { nullable: true, name: 'OrderId' })
  OrderId: number;

  @ManyToOne(() => Orders, (orders) => orders.Payments, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'OrderId', referencedColumnName: 'orderId' }])
  Order: Orders;
}
