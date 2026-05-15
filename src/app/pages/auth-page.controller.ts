import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Render,
  Query,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../modules/auth/auth.service';

@Controller()
export class AuthPageController {
  constructor(private readonly authService: AuthService) {}

  @Get('auth/login')
  @Render('login')
  loginPage(@Query('error') error?: string) {
    return { error: error || null };
  }

  @Post('auth/login')
  async login(
    @Body() body: { login: string; password: string },
    @Res() res: Response,
  ) {
    if (!body.login || !body.password) {
      return res.redirect('/auth/login?error=Login+and+password+are+required');
    }

    try {
      const { access_token, expires } = await this.authService.signIn(
        body.login,
        body.password,
      );

      res.setHeader(
        'Set-Cookie',
        `session=${access_token}; HttpOnly; Path=/; SameSite=Lax; Expires=${expires.toUTCString()}`,
      );
      return res.redirect('/artefatos');
    } catch (e) {
      return res.redirect('/auth/login?error=Invalid+credentials');
    }
  }

  @Post('auth/logout')
  async logout(@Res() res: Response) {
    res.setHeader(
      'Set-Cookie',
      `session=; HttpOnly; Path=/; Expires=${new Date(0).toUTCString()}`,
    );
    return res.redirect('/auth/login');
  }
}
