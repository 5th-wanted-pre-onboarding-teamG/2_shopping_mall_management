import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Orders } from './Orders';

@Entity({ schema: 'product_shopping', name: 'countries' })
export class Countries {
  @PrimaryGeneratedColumn()
  countryId: number;

  @Column()
  countryCode: string;

  @Column()
  dCode: string;

  @Column()
  name: string;

  @OneToMany(() => Orders, (orders) => orders.country)
  orders: Orders[];
}
