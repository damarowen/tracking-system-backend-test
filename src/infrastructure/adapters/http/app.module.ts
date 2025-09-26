// src/infrastructure/adapters/http/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmAsyncConfig } from '../../config/typeorm.config'; // Kita akan buat ini
import { CustomerModule } from './customer/customer.module'; // Contoh modul domain

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    CustomerModule,
    // Tambahkan AuthModule, VehicleModule, TrackingModule di sini nanti
  ],
})
export class AppModule {}
