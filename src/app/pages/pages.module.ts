import { Module } from "@nestjs/common";
import { AuthPageController } from "./auth-page.controller";
import { ArtefatosPageController } from "./artefatos-page.controller";
import { AuthModule } from "../modules/auth/auth.module";
import { ArtefatosModule } from "../modules/artefatos/artefatos.module";

@Module({
  imports: [AuthModule, ArtefatosModule],
  controllers: [AuthPageController, ArtefatosPageController],
})
export class PagesModule {}
