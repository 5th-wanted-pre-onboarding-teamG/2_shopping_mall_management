import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CountryCode } from './enums/countryCode';
import { Orders } from './Orders';

@Entity({ schema: 'product_shopping', name: 'countries' })
export class Countries {
  @PrimaryGeneratedColumn()
  countryId: number;

  @Column({ type: 'enum', name: 'countryCode', enum: CountryCode })
  countryCode: CountryCode;

  @Column()
  dCode: string;

  @Column()
  name: string;

  @OneToMany(() => Orders, (orders) => orders.country)
  orders: Orders[];
}
