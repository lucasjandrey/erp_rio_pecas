# Arquitetura do Sistema

## Visão geral

1. `apps/api`
   API REST para autenticação, cadastros, dashboards, relatórios e importações.
2. `apps/web`
   Interface administrativa em Vue 3.
3. `apps/worker`
   Monitoramento de pasta e leitura de XLSX.
4. `services/python`
   ETL complementar, forecast e relatórios.

## Estratégia de dados

- MySQL como banco transacional.
- Prisma como ORM.
- Dimensões para empresas, clientes, vendedores, contas e formas de pagamento.
- Fatos para lançamentos, parcelas, movimentos e snapshots.
- Tabelas de importação, staging e auditoria para rollback.
