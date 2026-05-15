import { Injectable } from "@nestjs/common";
import { db, artefatos, NotFoundException } from "../../../shared";
import { eq, and } from "drizzle-orm";

@Injectable()
export class ArtefatosService {
  async findAll() {
    return await db
      .select()
      .from(artefatos)
      .where(eq(artefatos.active, true))
      .orderBy(artefatos.id);
  }

  async findOne(id: number) {
    const [artefato] = await db
      .select()
      .from(artefatos)
      .where(and(eq(artefatos.id, id), eq(artefatos.active, true)))
      .limit(1);

    if (!artefato) {
      throw new NotFoundException("Artefato not found");
    }

    return artefato;
  }

  async create(data: { nome: string; userId?: number }) {
    const [newArtefato] = await db
      .insert(artefatos)
      .values({
        nome: data.nome,
        createdBy: data.userId,
        updatedBy: data.userId,
      })
      .returning();
    return newArtefato;
  }

  async update(
    id: number,
    data: { nome?: string; active?: boolean; userId?: number },
  ) {
    const [updatedArtefato] = await db
      .update(artefatos)
      .set({
        ...data,
        updatedAt: new Date(),
        updatedBy: data.userId,
      })
      .where(eq(artefatos.id, id))
      .returning();

    if (!updatedArtefato) {
      throw new NotFoundException("Artefato not found");
    }

    return updatedArtefato;
  }

  async remove(id: number, userId?: number) {
    const [deletedArtefato] = await db
      .update(artefatos)
      .set({
        active: false,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(artefatos.id, id))
      .returning();

    if (!deletedArtefato) {
      throw new NotFoundException("Artefato not found");
    }

    return { success: true };
  }
}
