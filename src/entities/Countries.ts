import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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

  @OneToMany(() => DeliveryCosts, (deliveryCosts) => deliveryCosts.country)
  deliveryCosts: DeliveryCosts[];
}
