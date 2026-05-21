import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { type User, users } from './schemas/users';
import { Database } from '../../../database/schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DATABASE') private readonly db: Database,
  ) {}

  async findOrCreate(dto: CreateUserDto): Promise<User> {
    const [existingUser] = await this.db.select().from(users).where(eq(users.tgId, dto.tgId));
    
    if (existingUser) {
      return existingUser;
    }

    await this.db.insert(users).values(dto);
    const [newUser] = await this.db.select().from(users).where(eq(users.tgId, dto.tgId));
    return newUser!;
  }

  async findByTgId(tgId: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.tgId, tgId));
    return user || null;
  }
}
