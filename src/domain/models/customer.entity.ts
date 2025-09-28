import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @OneToOne(() => User, (user) => user.customer)
  user: User;
}
