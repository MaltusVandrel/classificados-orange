# Axaki 🍊

## Visão Geral

O **Axaki** é uma plataforma integrada de **Classificados Digitais** e **Quadro de Avisos Digital**, concebida com um foco profundo em geolocalização e segmentação comunitária. O projeto visa fortalecer os laços locais, permitindo que ruas, bairros e cidades funcionem como comunidades vibrantes e autossuficientes.

## Propósito e Missão

- **Engajamento Local:** Conectar vizinhos e promover a sensação de união.
- **Qualidade de Vida:** Facilitar o acesso a serviços e informações próximas, reduzindo deslocamentos e fortalecendo a economia local.
- **Compartilhamento de Recursos:** Plataforma para troca de conhecimentos, habilidades e recursos materiais dentro da própria comunidade.
- **Segmentação Geográfica:** Organização granular por Rua > Bairro > Cidade, garantindo que a informação seja sempre relevante para quem a recebe.

## Pilares Técnicos

- **Frontend/Fullstack:** [Next.js](https://nextjs.org/) (App Router, TypeScript).
- **Estilização:** Tailwind CSS / Vanilla CSS.
- **Banco de Dados:** PostgreSQL (Hospedado no [Neon](https://neon.tech/)) com [Drizzle ORM](https://orm.drizzle.team/).
- **Autenticação:** JWT (JSON Web Token) com controle de acesso baseado em Roles.
- **Validação:** [Zod](https://zod.dev/) para integridade de dados de ponta a ponta.

## Estrutura de Localização

A plataforma é segmentada hierarquicamente:

1. **Rua:** O nível mais próximo, para avisos de vizinhança imediata.
2. **Bairro:** Notícias locais, pequenos comércios e eventos comunitários.
3. **Cidade:** Visão macro de classificados e utilidade pública.

## Começando

### Pré-requisitos

- Node.js (versão LTS recomendada)
- Instância PostgreSQL (Neon sugerido)

### Instalação

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o arquivo `.env` (veja `.env.example`).
4. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Contribuição

Consulte o arquivo `GEMINI.md` para diretrizes de desenvolvimento e padrões arquiteturais.
