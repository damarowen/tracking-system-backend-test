import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../../domain/models/user.entity';
import { IUserRepository } from '../../../../domain/repositories/user.repository';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly typeormRepo: Repository<User>,
  ) {}

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.typeormRepo.create(user);
    return this.typeormRepo.save(newUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.typeormRepo.findOne({
      where: { email },
      relations: ['customer'],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.typeormRepo.findOne({ where: { id } });
  }
}
