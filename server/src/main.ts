import 'dotenv/config';

import { ValidationPipe } from '@nestjs/common';

import { NestFactory } from '@nestjs/core';

import helmet from 'helmet';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module.js';

import { RedisIoAdapter } from './redis/redis-io.adapter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sudoku Battle API')
    .setDescription('Sudoku Battle backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, document);

  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error('REDIS_URL is not configured');
  }

  const redisIoAdapter = new RedisIoAdapter(app, redisUrl);

  await redisIoAdapter.connectToRedis();

  app.useWebSocketAdapter(redisIoAdapter);

  const port = Number(process.env.PORT) || 3000;

  await app.listen(port);

  console.log(`Sudoku Battle API running on port ${port}`);
}

void bootstrap();
