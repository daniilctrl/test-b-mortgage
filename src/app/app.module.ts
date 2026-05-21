import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { UsersModule } from './modules/user/users.module';
import { MortgageProfileModule } from './modules/mortgage-profile/mortgage-profile.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        redis: {
          host: cfg.get<string>('REDIS_HOST'),
          port: parseInt(cfg.get<string>('REDIS_PORT') || '6379'),
          password: cfg.get<string>('REDIS_PASSWORD') || undefined
        }
      }),
      inject: [ConfigService]
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => {
        const host = cfg.get<string>('REDIS_HOST');
        const port = cfg.get<string>('REDIS_PORT') || '6379';
        const password = cfg.get<string>('REDIS_PASSWORD');
        const auth = password ? `:${password}@` : '';
        return {
          stores: [createKeyv(`redis://${auth}${host}:${port}`)],
          ttl: 7 * 24 * 60 * 60 * 1000
        };
      },
      inject: [ConfigService]
    }),
    DatabaseModule,
    UsersModule,
    MortgageProfileModule
  ]
})
export class AppModule { }
