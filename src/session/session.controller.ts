import { Controller, Post, Body, Req, Get, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { LoginSessionDto } from './dto/login-session.dto';
import type { Request } from 'express';
import { SessionGuard } from './guards/session.guard';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  @UseGuards(SessionGuard)
  getSession(@Req() request: Request) {
    return this.sessionService.getSession(request);
  }

  @Post('login')
  login(@Req() request: Request, @Body() loginSessionDto: LoginSessionDto) {
    return this.sessionService.login(request, loginSessionDto);
  }
}
