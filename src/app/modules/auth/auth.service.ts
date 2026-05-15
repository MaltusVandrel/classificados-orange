import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { encrypt } from '../../../shared';
import bcrypt from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class AuthService {
  constructor(private readonly usuariosService: UsuariosService) {}

  async signIn(login: string, pass: string) {
    const user = await this.usuariosService.findOne(login);

    if (!user) {
      throw new UnauthorizedException();
    }

    const passwordMatch = await bcrypt.compare(pass, user.senha);
    if (!passwordMatch) {
      throw new UnauthorizedException();
    }

    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    const payload = {
      sub: user.id,
      login: user.login,
      role: user.role,
      expires,
    };

    return {
      access_token: await encrypt(payload),
      expires,
    };
  }
}
