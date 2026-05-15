import { Module } from "@nestjs/common";
import { ArtefatosController } from "./artefatos.controller";
import { ArtefatosService } from "./artefatos.service";

@Module({
  controllers: [ArtefatosController],
  providers: [ArtefatosService],
  exports: [ArtefatosService],
})
export class ArtefatosModule {}
