import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DateColumns } from './embeddeds/dateColumns';
import { Orders } from './Orders';

@Entity({ schema: 'product_shopping', name: 'products' })
export class Products {
  @PrimaryGeneratedColumn({ type: 'int', name: 'productId' })
  productId: number;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  stock: number;

  @Column(() => DateColumns, { prefix: false })
  dateColumns: DateColumns;

  @OneToMany(() => Orders, (orders) => orders.Product)
  Orders: Orders[];
}
