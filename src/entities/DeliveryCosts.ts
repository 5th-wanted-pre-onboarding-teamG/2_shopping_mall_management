import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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

  @Column('int', { primary: true, name: 'CountryId' })
  CountryId: number;

  @ManyToOne(() => Countries, (countries) => countries.DeliveryCosts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'CountryId', referencedColumnName: 'countryId' }])
  Country: Countries;

  @OneToMany(() => Orders, (orders) => orders.DeliveryCost)
  Orders: Orders[];
}
