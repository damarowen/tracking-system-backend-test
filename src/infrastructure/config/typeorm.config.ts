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
  ): Promise<TypeOrmModuleOptions> => {
    // 1. Define the base configuration
    const config: TypeOrmModuleOptions = {
      type: 'postgres',
      host: configService.get<string>('DB_HOST', 'localhost'),
      port: configService.get<number>('DB_PORT', 5432),
      database: configService.get<string>('DB_NAME', 'live-tracking'),
      entities: [__dirname + '/../../domain/models/*.entity{.ts,.js}'],
      synchronize: true,
      autoLoadEntities: true,
    };

    // 2. Get credentials from environment variables
    const username = configService.get<string>('DB_USERNAME');
    const password = configService.get<string>('DB_PASSWORD');

    // 3. Conditionally add credentials to the config object
    if (username) {
      // @ts-ignore
      config.username = username;
    }
    if (password) {
      // @ts-ignore
      config.password = password;
    }

    // 4. Return the final configuration
    return config;
  },
};
