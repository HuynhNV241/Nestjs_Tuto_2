import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { JwtAuthGuard } from './passport/jwt-auth.guard';
import { Public } from 'src/decorator/public.decorator';
import { MailerService } from '@nestjs-modules/mailer';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post("/login")
  async handleLogin(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Public()
  @Post('/register')
  async handleRegister(@Body() registerDto: CreateAuthDto) {
    return this.authService.handleRegister(registerDto);
  }

  @Public()
  @Get('/mail')
  async sendWelcomeEmail() {
    await this.mailerService.sendMail({
      to: 'huynhnv947@gmail.com',
      subject: 'Test Email',
      template: 'register',
      context: { 
        name: 'Huynh Nguyen',
        activationCode: 123456789
       },
    });
    return "ok";
  }
}
