import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DateColumns } from './embeddeds/dateColumns';
import { UserCoupons } from './UserCoupons';
import { Orders } from './Orders';

@Entity({ schema: 'product_shopping', name: 'users' })
export class Users {
  @PrimaryGeneratedColumn({ type: 'int', name: 'userId' })
  userId: number;

  @Column({ type: 'varchar', name: 'email', length: 30 })
  email: string;

  @Column({ type: 'text', name: 'password' })
  password: string;

  @Column({ type: 'varchar', name: 'name', length: 12 })
  name: string;

  @Column({ type: 'varchar', name: 'phone', length: 13 })
  phone: string;

  @Column(() => DateColumns, { prefix: false })
  dateColumns: DateColumns;

  @OneToMany(() => UserCoupons, (userCoupons) => userCoupons.user)
  userCoupons: UserCoupons[];

  @OneToMany(() => Orders, (orders) => orders.user)
  orders: Orders[];
}
