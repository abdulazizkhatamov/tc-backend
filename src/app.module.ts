import { Module } from '@nestjs/common';
import { CsrfModule } from './csrf/csrf.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { PrismaModule } from './prisma/prisma.module';
import { CoursesModule } from './courses/courses.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    PrismaModule,
    RedisModule,
    CsrfModule,
    SessionModule,
    CoursesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
