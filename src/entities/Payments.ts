import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentState } from './enums/paymentState';
import { DateColumns } from './embeddeds/dateColumns';
import { Orders } from './Orders';

@Entity({ schema: 'product_shopping', name: 'payments' })
export class Payments {
  @PrimaryGeneratedColumn()
  paymentId: number;

  @Column({ type: 'enum', name: 'paymentState', enum: PaymentState })
  paymentState: PaymentState;

  @Column()
  orderPrice: number;

  @Column()
  salePrice: number;

  @Column()
  paymentPrice: number;

  @Column(() => DateColumns, { prefix: false })
  dateColumns: DateColumns;

  @ManyToOne(() => Orders, (orders) => orders.payments)
  order: Orders;
}
