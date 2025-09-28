import { User } from '../models/user.entity';

export const IUserRepository = Symbol('IUserRepository');

export interface IUserRepository {
  create(user: Partial<User>): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}
