import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Customer } from './customer.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @OneToOne(() => Customer, { cascade: true, eager: true })
  @JoinColumn()
  customer: Customer;

  @Column()
  customerId: string;

  @BeforeInsert()
  async hashPassword() {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return bcrypt.compare(attempt, this.passwordHash);
  }
}
