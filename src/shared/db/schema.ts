import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';

const genericSchema = {
  id: serial('id').primaryKey(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: integer('created_by'), // Weak ref
  updatedBy: integer('updated_by'), // Weak ref
};

export const usuarios = pgTable('usuarios', {
  ...genericSchema,
  login: text('login').notNull().unique(),
  senha: text('senha').notNull(),
  role: text('role').default('user').notNull(),
});

export const artefatos = pgTable('artefatos', {
  ...genericSchema,
  nome: text('nome').notNull(),
});
