# Arquitetura do Projeto — Axaki

> Documento de arquitetura e tecnologias do projeto. Atualizado em: 2026-05-14.

---

## 1. Visão Geral

O **Axaki** é uma aplicação web monolítica construída com **NestJS** puro (sem NX, sem Next.js, sem React). Utiliza **Server-Side Rendering (SSR)** com templates **Handlebars** (`.hbs`) para servir páginas HTML tradicionais. O frontend não possui framework JavaScript no cliente — toda interatividade ocorre via formulários HTML, links e redirects HTTP.

A aplicação gerencia um domínio simples de **Artefatos** (CRUD) com autenticação baseada em **cookies HttpOnly + JWT**.

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão | Função |
|--------|-----------|--------|--------|
| Runtime | Node.js | 20+ | Ambiente de execução |
| Framework | NestJS | ^11.1.21 | Framework backend (DI, modularização, guards) |
| Plataforma | @nestjs/platform-express | ^11.0.0 | Adaptador Express para NestJS |
| Linguagem | TypeScript | ~5.5.4 | Tipagem estática |
| SSR / Templates | Handlebars (`hbs`) | ^4.2.1 | Engine de templates para páginas HTML |
| CSS | Tailwind CSS | CDN | Framework CSS utilitário (carregado via CDN) |
| ORM | Drizzle ORM | ^0.45.2 | ORM type-safe para PostgreSQL |
| Driver DB | @neondatabase/serverless | ^1.1.0 | Driver serverless para Neon PostgreSQL |
| Auth JWT | `jose` | ^6.2.3 | Biblioteca para assinar/verificar JWT (HS256) |
| Hash de Senha | `bcryptjs` | ^3.0.3 | Hashing de senhas |
| Cookies | `cookie-parser` | ^1.4.7 | Parsing de cookies no Express |
| Validação | `zod` | ^4.4.3 | Validação de schemas em runtime |
| Env | `dotenv` | ^17.4.2 | Carregamento de variáveis de ambiente |
| Testes | Jest | ^30.0.2 | Framework de testes |
| Lint | ESLint | ^9 | Linting de código |
| Format | Prettier | ~3.6.2 | Formatação de código |

---

## 3. Estrutura de Diretórios

```
src/
├── main.ts                          # Ponto de entrada NestJS
├── bootstrap.ts                     # Carrega dotenv antes de tudo
├── app/
│   ├── app.module.ts                # Módulo raiz
│   ├── app.controller.ts            # Controller raiz (GET /)
│   ├── app.service.ts               # Service raiz
│   ├── guards/
│   │   └── auth.guard.ts            # Guard global de autenticação
│   ├── modules/
│   │   ├── artefatos/
│   │   │   ├── artefatos.module.ts
│   │   │   ├── artefatos.controller.ts    # API REST /api/artefatos
│   │   │   └── artefatos.service.ts       # Lógica de negócio + soft delete
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   └── auth.service.ts            # Login / geração de token
│   │   └── usuarios/
│   │       ├── usuarios.module.ts
│   │       └── usuarios.service.ts        # Consulta de usuários no DB
│   └── pages/
│       ├── pages.module.ts
│       ├── auth-page.controller.ts        # Páginas SSR: /auth/login, logout
│       └── artefatos-page.controller.ts   # Páginas SSR: /artefatos/*
├── shared/
│   ├── index.ts                     # Barrel export
│   ├── db/
│   │   ├── db-connection.ts         # Conexão Drizzle + Neon
│   │   ├── schema.ts                # DDL das tabelas PostgreSQL
│   │   └── index.ts
│   └── lib/
│       ├── auth.ts                  # encrypt / decrypt JWT
│       ├── exceptions.ts            # Exceções HTTP customizadas
│       ├── shared.ts                # Placeholder (não usado)
│       └── shared.spec.ts           # Teste unitário placeholder
├── views/                           # Templates Handlebars
│   ├── layout.hbs
│   ├── login.hbs
│   ├── artefatos.hbs
│   ├── novo-artefato.hbs
│   └── editar-artefato.hbs
└── assets/                          # Assets estáticos (vazia — .gitkeep)
```

---

## 4. Arquitetura da Aplicação

### 4.1. Módulos

O NestJS organiza a aplicação em módulos. O `AppModule` é o módulo raiz que agrega todos os demais.

```
AppModule (root)
├── imports: [ArtefatosModule, AuthModule, PagesModule]
├── controllers: [AppController]
└── providers: [AppService, APP_GUARD → AuthGuard]

ArtefatosModule
├── controllers: [ArtefatosController]   # Rotas /api/artefatos
├── providers: [ArtefatosService]
└── exports: [ArtefatosService]          # Consumido por PagesModule

AuthModule
├── imports: [UsuariosModule]            # Depende de UsuariosService
├── providers: [AuthService]
└── exports: [AuthService]               # Consumido por PagesModule

UsuariosModule
├── providers: [UsuariosService]
└── exports: [UsuariosService]

PagesModule
├── imports: [AuthModule, ArtefatosModule]
└── controllers: [AuthPageController, ArtefatosPageController]
```

### 4.2. Separação de Responsabilidades

A aplicação possui **duas camadas de controllers** para cada domínio:

| Camada | Prefixo | Tipo de Resposta | Uso |
|--------|---------|-----------------|-----|
| **API REST** | `/api/*` | JSON | Consumo programático (ainda disponível para artefatos) |
| **Páginas SSR** | `/*` | HTML (Handlebars) | Interface web tradicional (forms + redirects) |

> **Nota:** O domínio de autenticação opera **somente via SSR** (`/auth/login`, `/auth/logout`). Não há endpoints REST públicos de auth.

### 4.3. Fluxo de uma Requisição

1. Requisição HTTP chega ao servidor Express (via `@nestjs/platform-express`).
2. `cookie-parser` extrai o cookie `session`.
3. `AuthGuard` (global) verifica:
   - Se a rota é pública (`/assets/*`, `/favicon.ico`, `/auth/login`) → permite.
   - Se há cookie `session` válido e não expirado → anexa `req.user` e permite.
   - Se não há cookie válido e rota é protegida → redireciona para `/auth/login`.
   - Se usuário logado tenta acessar `GET /auth/login` → redireciona para `/artefatos`.
4. O controller da rota é invocado.
5. Controller chama Service → Service usa Drizzle ORM para consultar/inserir no banco.
6. Controller retorna:
   - Objeto plain JS → Handlebars renderiza HTML no servidor (`@Render()`).
   - Ou `res.redirect('/artefatos')` para fluxos POST.

---

## 5. Banco de Dados

### 5.1. Tecnologia

- **Banco:** PostgreSQL (hospedado na **Neon**).
- **Driver:** `@neondatabase/serverless` (HTTP/serverless).
- **ORM:** Drizzle ORM (`drizzle-orm/neon-http`).

### 5.2. Schema

**Arquivo:** `src/shared/db/schema.ts`

#### Campos Genéricos (todas as tabelas)

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| `active` | `boolean` | `true` | Flag de soft-delete |
| `created_at` | `timestamp` | `now()` | Data de criação |
| `updated_at` | `timestamp` | `now()` | Data de última atualização |
| `created_by` | `integer` | `null` | Referência fraca ao autor |
| `updated_by` | `integer` | `null` | Referência fraca ao editor |

#### Tabela: `usuarios`

| Coluna | Tipo | Constraints |
|--------|------|-------------|
| `id` | `serial` | `PRIMARY KEY` |
| `login` | `text` | `NOT NULL`, `UNIQUE` |
| `senha` | `text` | `NOT NULL` (hash bcrypt) |
| `role` | `text` | `DEFAULT 'user'`, `NOT NULL` |
| + genericSchema | | |

#### Tabela: `artefatos`

| Coluna | Tipo | Constraints |
|--------|------|-------------|
| `id` | `serial` | `PRIMARY KEY` |
| `nome` | `text` | `NOT NULL` |
| + genericSchema | | |

> **Observações:**
> - Não há Foreign Keys explícitas. `created_by` / `updated_by` são *weak references*.
> - Não há índices customizados além de PK e `UNIQUE` em `usuarios.login`.
> - Não há migrations automatizadas (drizzle-kit está instalado mas não configurado).
> - Não há scripts de seed.

### 5.3. Conexão

**Arquivo:** `src/shared/db/db-connection.ts`

```ts
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

- O `import "dotenv/config"` garante que `.env` seja carregado **antes** da criação do cliente.
- Se `DATABASE_URL` não estiver definido, a aplicação lança erro na inicialização.

---

## 6. Autenticação e Autorização

### 6.1. Estratégia

- **Mecanismo:** Cookie HttpOnly + JWT assinado (HS256).
- **Biblioteca:** `jose` (não usa `@nestjs/jwt` — implementação customizada).
- **Duração do token:** 2 horas.
- **Nome do cookie:** `session`.

### 6.2. Fluxo de Login

1. Usuário submete formulário HTML para `POST /auth/login`.
2. `AuthPageController` chama `AuthService.signIn(login, password)`.
3. `AuthService` busca usuário por login (`UsuariosService.findOne`).
4. Compara senha com `bcrypt.compare()`.
5. Gera payload JWT: `{ sub, login, role, expires }`.
6. Assina token com `jose` (HS256) usando `JWT_SECRET`.
7. Controller define cookie `session` com atributos:
   - `HttpOnly; Path=/; SameSite=Lax`
   - `Expires` = data de expiração (2h).
8. Redireciona para `/artefatos`.

### 6.3. Fluxo de Logout

1. `POST /auth/logout`.
2. Controller define cookie `session` vazio com `Expires=Thu, 01 Jan 1970 00:00:00 GMT`.
3. Redireciona para `/auth/login`.

### 6.4. Proteção de Rotas

O `AuthGuard` é registrado como `APP_GUARD` no `AppModule`, aplicando-se **globalmente** a todas as rotas.

**Rotas públicas (sem autenticação):**
- `/assets/*`
- `/favicon.ico`
- `/auth/login` (GET e POST)

**Comportamentos:**
- Não autenticado + rota protegida → `302` redirect para `/auth/login`.
- Autenticado + `GET /auth/login` → `302` redirect para `/artefatos`.
- Autenticado + rota protegida → `200` (acesso permitido).

---

## 7. Frontend / SSR

### 7.1. Engine de Templates

- **Engine:** Handlebars (`hbs`).
- **Layout base:** `src/views/layout.hbs` envolve todas as páginas via `{{{body}}}`.
- **Tailwind CSS:** Carregado via CDN no `<head>` do layout.
- **Não há:** partials customizados, helpers registrados, CSS/JS próprios, frameworks JS no cliente.

### 7.2. Templates e Rotas

| Template | Rota (GET) | Controller | Descrição |
|----------|-----------|------------|-----------|
| `login.hbs` | `/auth/login` | `AuthPageController` | Formulário de login |
| `artefatos.hbs` | `/artefatos` | `ArtefatosPageController` | Lista de artefatos (dashboard) |
| `novo-artefato.hbs` | `/artefatos/novo` | `ArtefatosPageController` | Formulário de criação |
| `editar-artefato.hbs` | `/artefatos/editar/:id` | `ArtefatosPageController` | Formulário de edição |

### 7.3. Padrão de Interação

Toda interação no frontend segue o padrão **POST → Redirect → GET** (PRG pattern):

- **Criar:** `POST /artefatos` → `302` redirect para `/artefatos`.
- **Editar:** `POST /artefatos/editar/:id` → `302` redirect para `/artefatos`.
- **Excluir:** `POST /artefatos/:id/delete` → `302` redirect para `/artefatos`.
- **Login:** `POST /auth/login` → `302` redirect para `/artefatos`.
- **Logout:** `POST /auth/logout` → `302` redirect para `/auth/login`.

> A única interatividade JavaScript no cliente é um `window.confirm()` inline no botão de exclusão de artefato.

---

## 8. Variáveis de Ambiente

**Arquivo:** `.env` (não versionado) / `.env.example` (template)

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | Sim | URL de conexão PostgreSQL (Neon) |
| `JWT_SECRET` | Sim | Chave secreta para assinatura JWT |
| `PORT` | Não | Porta do servidor (padrão: `3000`) |

---

## 9. Scripts e Build

| Script | Comando | Descrição |
|--------|---------|-----------|
| `build` | `nest build` | Compila TypeScript para `dist/` |
| `start` | `nest start` | Inicia aplicação em produção |
| `dev` | `nest start --watch` | Inicia com hot-reload (desenvolvimento) |
| `start:debug` | `nest start --debug --watch` | Inicia com debugger attachado |
| `start:prod` | `node dist/main` | Executa build compilado |
| `test` | `jest` | Executa testes unitários |
| `test:watch` | `jest --watch` | Testes em modo watch |
| `test:cov` | `jest --coverage` | Testes com cobertura |
| `lint` | `eslint src/**/*.ts` | Lint do código |

### 9.1. Configuração de Build (nest-cli.json)

- `deleteOutDir: true` — limpa `dist/` antes de cada build.
- Assets (`views/` e `assets/`) são copiados para `dist/src/` durante o build.
- `watchAssets: true` — templates e assets são recarregados em dev.

---

## 10. Decisões Arquiteturais

### 10.1. SSR Puro com Formulários HTML

A aplicação foi projetada como uma **interface web tradicional** (não SPA). Não há React, Vue, Angular ou qualquer framework JS no cliente. Isso simplifica drasticamente a arquitetura:
- Sem bundler de frontend (Webpack, Vite, etc.).
- Sem estado compartilhado no cliente.
- Sem API REST consumida por fetch/AJAX (exceto o CRUD de artefatos via `/api/artefatos`, que ainda existe mas não é consumido pelo frontend atual).

### 10.2. Auth Customizada (sem Passport)

A autenticação foi implementada manualmente com `jose` + `cookie-parser` + `bcryptjs`, sem usar `@nestjs/passport`. Motivos:
- O fluxo é simples (apenas login/logout).
- O controle total sobre cookies e JWT é necessário para o padrão SSR.
- Evita dependências desnecessárias.

### 10.3. Soft Delete

A tabela `artefatos` implementa **soft delete** via coluna `active`:
- `DELETE /api/artefatos/:id` e `POST /artefatos/:id/delete` apenas setam `active = false`.
- `findAll()` e `findOne()` filtram implicitamente `where(active, true)`.
- Não há exclusão física de registros.

### 10.4. Weak References

`created_by` e `updated_by` são inteiros sem Foreign Key. Isso permite:
- Auditoria básica de quem criou/alterou um registro.
- Flexibilidade para desvincular usuários sem quebra de integridade referencial.

### 10.5. Sem Migrations Automatizadas

O schema é definido em código TypeScript (Drizzle ORM), mas não há `drizzle.config.ts` nem pasta de migrations. O banco foi provisionado manualmente (ou via outro mecanismo externo). O `drizzle-kit` está instalado mas não configurado.

---

## 11. Diagrama de Dependências

```
┌─────────────────────────────────────────────────────────────┐
│                         Cliente                             │
│              (Navegador — HTML + Tailwind CDN)              │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     NestJS + Express                        │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ cookie-parser│  │ AuthGuard    │  │ Controllers         │ │
│  │ (global)     │  │ (APP_GUARD)  │  │ - AppController     │ │
│  └─────────────┘  └──────────────┘  │ - ArtefatosController│ │
│                                     │ - AuthPageController │ │
│                                     │ - ArtefatosPageCtrl  │ │
│                                     └─────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Services                                               │ │
│  │  - AppService      - ArtefatosService (soft delete)    │ │
│  │  - AuthService     - UsuariosService                   │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Shared Lib                                             │ │
│  │  - auth.ts (JWT encrypt/decrypt)                       │ │
│  │  - exceptions.ts (HTTP custom)                         │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Drizzle ORM + Neon Driver                              │ │
│  │  - db-connection.ts                                    │ │
│  │  - schema.ts (usuarios, artefatos)                     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Neon PostgreSQL │
              └─────────────────┘
```

---

## 12. Evolução e Contexto Histórico

Este projeto passou por uma migração significativa:
- **Anteriormente:** Híbrido Next.js + NestJS + NX (monorepo com múltiplas ferramentas).
- **Atualmente:** NestJS puro, sem NX, sem Next.js, sem React, sem Vite, sem Webpack.
- **Motivo da migração:** Simplificação da arquitetura para uma aplicação web tradicional (SSR com formulários), eliminando complexidade de bundlers e frameworks frontend desnecessários.
