# Rio Pecas ERP Financeiro

Monorepo para transformar a planilha `29.01.2026 CONTROLE FINANCEIRO.xlsx` em um sistema web full stack com visao consolidada de Rio Pecas e MC Maquinas.

## Stack

- Backend: Node.js + Express + Prisma
- Banco: MySQL
- Frontend: Vue 3 + Composition API + Pinia + Vue Router
- Worker: Node.js com monitoramento de pasta e importacao XLSX
- Python: pandas + openpyxl + matplotlib para ETL e relatorios

## Estrutura

- `apps/api`: API REST, autenticacao, Swagger, Prisma e regras financeiras
- `apps/web`: painel administrativo Vue com dashboards e telas por dominio
- `apps/worker`: bot de importacao automatica de planilhas XLSX
- `services/python`: scripts de relatorios, forecast e analises
- `docs`: arquitetura, mapeamento da planilha, dicionario de dados e backlog
- `infra`: infraestrutura local com Docker Compose

## Configuracao local

Crie os arquivos locais a partir dos exemplos antes de rodar o projeto:

```bash
copy apps\api\.env.example apps\api\.env
copy apps\web\.env.example apps\web\.env.local
copy apps\worker\.env.example apps\worker\.env
copy infra\.env.example infra\.env
```

Ajuste os valores locais no seu ambiente. Os arquivos reais `.env` e `.env.local` nao devem ir para o Git.

## Como rodar

1. Instale as dependencias:

```bash
npm install
```

2. Suba o banco:

```bash
docker compose -f infra/docker-compose.yml up -d
```

3. Gere Prisma e seed:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

4. Rode os servicos:

```bash
npm run dev:api
npm run dev:web
npm run dev:worker
```

## Importacao persistente da planilha

Para gravar a planilha real no MySQL:

```bash
npm --workspace apps/api run import:excel -- --file "%IMPORT_DEFAULT_WORKBOOK_PATH%" --replace
```

Tambem e possivel disparar pela API autenticada em `POST /api/imports/run-local`.
