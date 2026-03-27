# Dicionário de Dados Inicial

## `companies`

- `code`: código da empresa na planilha
- `name`: nome da empresa
- `shortName`: sigla

## `clients`

- `code`: código do cliente
- `name`: nome curto
- `legalName`: razão social
- `document`: CPF/CNPJ

## `financial_launches`

- `launchDate`: data do negócio
- `companyId`: empresa
- `clientId`: cliente
- `accountId`: conta contábil
- `vendorId`: vendedor
- `paymentMethodId`: forma de pagamento
- `revenueAmount`: receita
- `expenseAmount`: despesa
- `dueDays`: vencimento em dias
- `dueDate`: vencimento em data
- `settlementDate`: data pago/recebido
- `financialStatus`: aberto, vencido, parcial, liquidado
- `isDuplicate`: indicador de duplicidade
- `isCriticalLate`: indicador de velhacos
