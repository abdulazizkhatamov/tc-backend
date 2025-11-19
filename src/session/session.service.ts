import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import argon2 from 'argon2';
import type { Request } from 'express';

import { LoginSessionDto } from './dto/login-session.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  getSession(request: Request) {
    try {
      return { session: request.session.session };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async login(request: Request, loginSessionDto: LoginSessionDto) {
    try {
      const { email, password } = loginSessionDto;

      const dbUser = await this.prisma.user.findUnique({ where: { email } });
      if (!dbUser) throw new NotFoundException('User is not found');

      const isValid = await argon2.verify(dbUser.password, password);
      if (!isValid) throw new UnauthorizedException('Invalid credentials');

      request.session.session = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        roles: dbUser.roles,
      };

      return { session: dbUser, message: 'Successfully logged in!' };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
