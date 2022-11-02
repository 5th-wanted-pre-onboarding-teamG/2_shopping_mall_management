import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DeliveryCosts } from './DeliveryCosts';

@Entity({ schema: 'product_shopping', name: 'countries' })
export class Countries {
  @PrimaryGeneratedColumn({ type: 'int', name: 'countryId' })
  countryId: number;

  @Column()
  countryCode: string;

  @Column()
  dCode: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => DeliveryCosts, (deliveryCosts) => deliveryCosts.Country)
  DeliveryCosts: DeliveryCosts[];
}
