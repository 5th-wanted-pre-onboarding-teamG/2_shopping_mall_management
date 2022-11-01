import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Countries } from './Countries';
import { Orders } from './Orders';

@Entity({ schema: 'product_shopping', name: 'deliveryCosts' })
export class DeliveryCosts {
  @PrimaryGeneratedColumn()
  deliveryCostId: number;

  @Column()
  quantity: number;

  @Column()
  price: number;

  @ManyToOne(() => Countries, (countries) => countries.deliveryCosts)
  country: Countries;

  @OneToMany(() => Orders, (orders) => orders.deliveryCost)
  orders: Orders[];
}
