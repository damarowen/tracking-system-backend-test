// src/infrastructure/config/typeorm.config.ts
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => ({
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    database: configService.get<string>('DB_NAME', 'postgres'),
    entities: [__dirname + '/../../domain/models/*.entity{.ts,.js}'],
    synchronize: true,
    autoLoadEntities: true,
  }),
};
