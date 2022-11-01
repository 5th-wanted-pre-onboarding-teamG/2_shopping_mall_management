import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Countries } from './Countries';

@Entity({ schema: 'product_shopping', name: 'deliveryCosts' })
export class DeliveryCosts {
  @PrimaryGeneratedColumn()
  deliveryCostId: number;

  @Column()
  quantity: number;

  @Column()
  price: number;

  @JoinColumn({ name: 'countryName' })
  @ManyToOne(() => Countries, (countries) => countries.deliveryCosts)
  country: Countries;
}