import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import cookieParser from 'cookie-parser';
import session from 'express-session';
import { connectRedis } from './redis/redis-client';
import { RedisStore } from 'connect-redis';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // -----------------------------------------------------
  // Environment & external services
  // -----------------------------------------------------
  const isProduction = config.get<string>('NODE_ENV') === 'production';

  const redis = await connectRedis({
    url: config.getOrThrow<string>('REDIS_URL'),
    username: config.get<string>('REDIS_USERNAME'),
    password: config.get<string>('REDIS_PASSWORD'),
  });

  // -----------------------------------------------------
  // Global configuration
  // -----------------------------------------------------
  app.setGlobalPrefix('api');

  // -----------------------------------------------------
  // CORS (must run BEFORE sessions)
  // -----------------------------------------------------
  app.enableCors({
    origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Origin',
      'Accept',
      'Authorization',
      'x-csrf-token',
    ],
    exposedHeaders: ['Set-Cookie'],
  });

  // -----------------------------------------------------
  // Cookie parser
  // -----------------------------------------------------
  app.use(cookieParser());

  // -----------------------------------------------------
  // Session middleware
  // -----------------------------------------------------
  app.use(
    session({
      secret: config.getOrThrow<string>('SESSION_SECRET'),
      name: config.getOrThrow<string>('SESSION_NAME'),
      resave: false,
      saveUninitialized: false,
      store: new RedisStore({
        client: redis,
        prefix: config.get<string>('SESSION_FOLDER') ?? 'session:',
      }),
      cookie: {
        maxAge: Number(config.getOrThrow<string>('SESSION_MAX_AGE')),
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
      },
    }),
  );

  // -----------------------------------------------------
  // Global Pipes
  // -----------------------------------------------------
  app.useGlobalPipes(new ValidationPipe());

  // -----------------------------------------------------
  // Swagger documentation
  // -----------------------------------------------------
  const documentConfig = new DocumentBuilder()
    .setTitle('TC API')
    .setDescription('TC API Documentation')
    .setVersion('1.0')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, documentConfig);

  SwaggerModule.setup('api', app, documentFactory);

  // -----------------------------------------------------
  // Start server
  // -----------------------------------------------------
  await app.listen(config.get<string>('PORT') ?? 3000);
}

bootstrap();
