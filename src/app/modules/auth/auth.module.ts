import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsuariosModule } from "../usuarios/usuarios.module";

@Module({
  imports: [UsuariosModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
