import { Injectable } from '@nestjs/common';
import { db, usuarios, NotFoundException } from '../../../shared';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsuariosService {
  async findAll() {
    return await db.select().from(usuarios);
  }

  async findOne(login: string) {
    const [user] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.login, login))
      .limit(1);

    return user || null;
  }

  async findById(id: number) {
    const [user] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.id, id))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
