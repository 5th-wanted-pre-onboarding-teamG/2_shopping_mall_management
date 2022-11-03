import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DateColumns } from './embeddeds/dateColumns';
import { OwnedCoupons } from './OwnedCoupons';
import { Orders } from './Orders';
import { UserRank } from './enums/userRank';
import { Payments } from './Payments';
import { Products } from './Products';

@Entity({ schema: 'product_shopping', name: 'users' })
export class Users {
  @PrimaryGeneratedColumn({ type: 'int', name: 'userId' })
  userId: number;

  @Column({ type: 'varchar', name: 'email', length: 50 })
  email: string;

  @Column({ type: 'text', name: 'password' })
  password: string;

  @Column({ type: 'varchar', name: 'name', length: 20 })
  name: string;

  @Column({ type: 'varchar', name: 'phone', length: 20 })
  phone: string;

  @Column({
    type: 'enum',
    name: 'rank',
    enum: UserRank,
    default: UserRank.NORMAL,
  })
  rank: UserRank;

  @Column(() => DateColumns, { prefix: false })
  dateColumns: DateColumns;

  @OneToMany(() => OwnedCoupons, (ownedCoupons) => ownedCoupons.User)
  OwnedCoupons: OwnedCoupons[];

  @OneToMany(() => Orders, (orders) => orders.User)
  Orders: Orders[];
  
  @OneToMany(() => Payments, (payments) => payments.User)
  Payments: Payments[];
  
  @OneToMany(() => Products, (products) => products.Author)
  products: Products[];
}
