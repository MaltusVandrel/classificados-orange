import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { ArtefatosService } from "./artefatos.service";
import { z } from "zod";

const createSchema = z.object({
  nome: z.string().min(1).describe("Nome do Artefato"),
});

const updateSchema = z.object({
  nome: z.string().min(1).optional().describe("Nome do Artefato"),
  active: z.boolean().optional().describe("Status de Atividade"),
});

@Controller("api/artefatos")
export class ArtefatosController {
  constructor(private readonly artefatosService: ArtefatosService) {}

  @Get()
  async findAll() {
    return this.artefatosService.findAll();
  }

  @Post()
  async create(@Body() body: any) {
    const validated = createSchema.parse(body);
    return this.artefatosService.create(validated);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() body: any) {
    const validated = updateSchema.parse(body);
    return this.artefatosService.update(parseInt(id, 10), validated);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    await this.artefatosService.remove(parseInt(id, 10));
    return { success: true };
  }
}
