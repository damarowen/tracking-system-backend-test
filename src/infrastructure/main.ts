// src/infrastructure/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './adapters/http/app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Aktifkan validasi global
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(3000);
}
bootstrap();
