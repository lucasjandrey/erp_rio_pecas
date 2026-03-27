# Mapeamento da Planilha para o Sistema

## Abas confirmadas no arquivo real

- Base Dados
- lançamentos
- Receber X Pagar
- Receber e a Pagar
- Vendas e Comissões
- A receber Geral
- A pagar Geral
- Recebido Geral
- Pago Geral
- DRE Financeiro
- Relatório Conta Contábil
- Faturado Geral
- FATURAMENTO x GASTOS
- SALDO CONTAS
- Previsão Caixa
- pago e a pagar
- Receber X Pagar Gráfico
- RELATÓRIO

## Entidades de domínio

- Empresa
- Cliente
- Conta contábil
- Categoria contábil
- Forma de pagamento
- Vendedor
- Lançamento financeiro
- Parcela
- Importação
- Log de importação
- Auditoria
- Snapshot de dashboard
- Previsão de caixa

## Regras de negócio extraídas

- Empresa e sigla são preenchidas por lookup a partir de `CE`.
- Cliente é preenchido por lookup usando `CC`.
- `Nova ou Usada` deriva de `N ou U`.
- `Venc (data)` deriva de `Data + Venc (dias)` com tratamento para `A vista`.
- `Dias Em Atraso` depende de status liquidado e vencimento.
- `Ano/Mês Negócio` derivam da data do lançamento.
- `Ano/Mês Vencimento` derivam do vencimento com fallback para a data base.
- `Velhacos` representa inadimplência crítica.
- Duplicidade deve considerar combinação de empresa, cliente, conta, data, valor e vencimento.

## Estrutura inicial do projeto

- `apps/api`
- `apps/web`
- `apps/worker`
- `services/python`
- `docs`
- `infra`
