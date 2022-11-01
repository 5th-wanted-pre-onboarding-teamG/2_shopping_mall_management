import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Orders } from './Orders';
import { DeliveryCosts } from './DeliveryCosts';

@Entity({ schema: 'product_shopping', name: 'countries' })
export class Countries {
  @PrimaryGeneratedColumn()
  countryId: number;

  @Column()
  countryCode: string;

  @Column()
  dCode: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => Orders, (orders) => orders.country)
  orders: Orders[];

  @OneToMany(() => DeliveryCosts, (deliveryCosts) => deliveryCosts.country)
  deliveryCosts: DeliveryCosts[];
}
