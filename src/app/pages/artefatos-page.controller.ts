import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Render,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { ArtefatosService } from "../modules/artefatos/artefatos.service";

@Controller()
export class ArtefatosPageController {
  constructor(private readonly artefatosService: ArtefatosService) {}

  @Get("artefatos")
  @Render("artefatos")
  async artefatosPage() {
    const artefatos = await this.artefatosService.findAll();
    return {
      artefatos: artefatos.map((a) => ({
        ...a,
        createdAt: new Date(a.createdAt).toLocaleDateString("pt-BR"),
      })),
    };
  }

  @Get("artefatos/novo")
  @Render("novo-artefato")
  novoPage() {
    return {};
  }

  @Post("artefatos")
  async create(@Body() body: { nome: string }, @Res() res: Response) {
    if (!body.nome) {
      return res.redirect("/artefatos/novo");
    }
    await this.artefatosService.create({ nome: body.nome });
    return res.redirect("/artefatos");
  }

  @Get("artefatos/editar/:id")
  @Render("editar-artefato")
  async editarPage(@Param("id") id: string) {
    try {
      const artefato = await this.artefatosService.findOne(parseInt(id, 10));
      return { id: artefato.id, nome: artefato.nome };
    } catch {
      return { id, nome: "", error: "Artefato não encontrado" };
    }
  }

  @Post("artefatos/editar/:id")
  async update(
    @Param("id") id: string,
    @Body() body: { nome: string },
    @Res() res: Response,
  ) {
    if (!body.nome) {
      return res.redirect(`/artefatos/editar/${id}`);
    }
    await this.artefatosService.update(parseInt(id, 10), { nome: body.nome });
    return res.redirect("/artefatos");
  }

  @Post("artefatos/:id/delete")
  async remove(@Param("id") id: string, @Res() res: Response) {
    await this.artefatosService.remove(parseInt(id, 10));
    return res.redirect("/artefatos");
  }
}
