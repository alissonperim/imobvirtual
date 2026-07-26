# SPEC — Gestão de Locação (Rent Management)

> Documento de especificação funcional/técnica para evolução da API `imobvirtual`.
> Foco: entender e desenhar o domínio de negócio. UI já está desenhada em outro projeto (`imobvirtual-app`); este documento não trata de telas.

## 1. Contexto e fundação existente

A API já existe (NestJS + TypeORM + Postgres, Clean Architecture com use-cases/repositories, auth via OTP por SMS/WhatsApp). Módulos completos: `auth`, `accounts`, `owners`, `properties`. Módulos `renters` e `rental-contracts` são stubs (só o `.module.ts`, sem repository/use-cases/controller). **Não existe nenhum modelo de pagamento, fatura, manutenção ou assinatura de contrato** — este spec cobre principalmente esse território novo.

Entidades já implementadas: `Account`, `Owner`, `Renter` (parcial, sem repo), `Address`, `Property`, `PropertyCharge`, `Contract` (parcial, sem repo), `Session`, `OtpChallenge`, `Audit`/`Base` (id nanoid, soft-delete, createdBy/updatedBy/deletedBy).

## 2. Modelo de tenancy

Não é multi-tenant formal (sem conceito de organização/imobiliária). **Vários owners podem se cadastrar de forma independente**; cada um só enxerga e gerencia os próprios imóveis, contratos, inquilinos e faturas. Todo escopo de leitura/escrita nas APIs deve ser filtrado por `ownerId` resolvido a partir da conta autenticada — não existe papel de administrador global nem de imobiliária/agência intermediando.

## 3. Atores

- **Owner (proprietário)**: cadastra imóveis, cria contratos, aprova manutenções, decide repasse de custos, acompanha faturas e relatórios.
- **Renter (inquilino)**: consulta seu contrato ativo e o imóvel alugado, visualiza e paga faturas, atualiza o próprio cadastro, abre chamados de manutenção.
- **Guarantor (fiador)**: apenas registro de dados vinculado ao contrato. **Sem conta/login**, sem acesso à API.

Um contrato tem exatamente **um** renter (sem co-locatários/múltiplos inquilinos no mesmo contrato) e **opcionalmente** um guarantor.

## 4. Ciclo de vida do contrato

### 4.1 Status

Novo enum de status substituindo o atual `ERentalContractStatus` (`ACTIVE | FINISHED | CANCELLED`):

```
PENDING_SIGNATURE  -- criado, aguardando assinatura de todas as partes
ACTIVE             -- todas as assinaturas concluídas; gera faturas
FINISHED           -- chegou ao endDate (job automático)
CANCELLED          -- rescindido antes do prazo (por qualquer uma das partes)
```

Um contrato **nasce em `PENDING_SIGNATURE`** e só passa a `ACTIVE` (e começa a gerar faturas) quando **owner, renter e guarantor (se houver)** tiverem assinado.

### 4.2 Transições automáticas (jobs agendados)

- Ao atingir `endDate`: contrato → `FINISHED`; `Property.status` → `AVAILABLE`.
- Nenhuma transição automática existe para rescisão antecipada — sempre é uma ação explícita (owner ou renter solicitando).

### 4.3 Rescisão antecipada

- Requer **aviso prévio de 30 dias** para qualquer uma das partes (owner ou renter), conforme padrão da Lei do Inquilinato — registrar `terminationRequestedAt`, `terminationRequestedBy` (owner/renter), `terminationEffectiveDate` (>= hoje + 30 dias).
- Aplica **multa proporcional**: calculada sobre os meses restantes do contrato (regra usual de mercado: `3 × rentAmount × (meses restantes / meses totais do contrato)`); valor deve ser persistido no momento da rescisão para auditoria/recibo.
- Ao efetivar a rescisão (status → `CANCELLED`): **todas as faturas `PENDING` com vencimento posterior à data de encerramento são canceladas automaticamente**.

### 4.4 Assinatura eletrônica

- Integração abstraída via **port/adapter** (`ContractSignaturePort`), provedor concreto (Clicksign/DocuSign/etc.) a decidir depois — não travar o design nisso.
- Interface mínima: `sendForSignature(contract, signers[])` → retorna um envelope/ID externo; webhook recebe eventos de assinatura por parte concluída.
- Nova entidade `ContractSignature` (contractId, signerType: OWNER|RENTER|GUARANTOR, signerId, status: PENDING|SIGNED, signedAt, externalEnvelopeId).
- Quando todas as partes obrigatórias (owner + renter + guarantor, se presente) estiverem `SIGNED`: contrato → `ACTIVE`.
- Geração do **PDF do contrato** a partir dos dados estruturados é parte do escopo (é o documento enviado para assinatura).

### 4.5 Reajuste anual (IGPM/IPCA)

- **Automático**, aplicado no mês de aniversário do contrato (mês de `startDate`).
- Fonte do índice: **integração com a API do Banco Central (SGS/BCB)** — busca o valor do índice do período de referência sem intervenção manual.
- Contrato precisa de um campo `adjustmentIndex: EAdjustmentIndex` (`IGPM | IPCA`), escolhido na criação.
- Nova entidade `RentAdjustmentHistory` (contractId, appliedAt, indexType, indexValue, previousRentAmount, newRentAmount) — necessária para auditoria e para os relatórios/recibos refletirem o valor vigente em cada período.
- Faturas geradas após o reajuste usam o novo `rentAmount` do contrato; faturas já geradas antes do reajuste **não são retroativamente alteradas**.

### 4.6 Fora de escopo (por decisão explícita, não esquecimento)

- Caução/depósito de garantia.
- Múltiplos inquilinos por contrato.
- Estorno/reembolso de pagamentos confirmados via gateway.
- Split de pagamento / taxa de administração de imobiliária (não há esse ator no modelo).

## 5. Faturas (Invoices) — núcleo novo do domínio

### 5.1 Geração

- **Totalmente automática**: job agendado cria a fatura do mês no `dueDay` do contrato, somando `rentAmount` (vigente) + todos os `PropertyCharge` do imóvel (sempre recorrentes mensais enquanto o contrato estiver `ACTIVE` — **sem** necessidade de flag de recorrência no modelo atual, já que a decisão foi "sempre recorrente").
- `dueDay` é restrito a **1–28** no cadastro do contrato — evita completamente o problema de meses com menos de 31 dias (fevereiro, meses de 30 dias). Validar isso no schema yup do contrato.
- Faturas só são geradas enquanto o contrato está `ACTIVE`. Nenhuma fatura é gerada durante `PENDING_SIGNATURE`.

### 5.2 Status da fatura

```
PENDING    -- gerada, aguardando pagamento, dentro do prazo
OVERDUE    -- venceu sem pagamento; passa a acumular multa/juros
PAID       -- paga integralmente
CANCELLED  -- cancelada (ex: por rescisão antecipada do contrato)
```

**Sem pagamento parcial** — uma fatura só é considerada `PAID` quando o valor total (incluindo multa/juros acumulados, se atrasada) é quitado de uma vez.

### 5.3 Multa e juros por atraso

Padrão de mercado/Lei do Inquilinato:
- **Multa fixa de 2%** sobre o valor da fatura, aplicada assim que vence.
- **Juros de 1% ao mês**, calculado **pro-rata die** sobre os dias de atraso.
- Esse cálculo deve ser feito dinamicamente (a valor "hoje" de uma fatura `OVERDUE` muda diariamente) — recalcular no momento da consulta/cobrança, não como job que reescreve o valor da fatura a cada dia. Persistir apenas o valor final assim que a fatura for efetivamente paga (snapshot em `paidAmount`/`paidAt`).

### 5.4 Inadimplência

- Após um número de **dias configurável por contrato** (campo `delinquencyThresholdDays` ou similar) sem pagamento de uma fatura `OVERDUE`, o contrato recebe um flag de inadimplência visível ao owner.
- Isso **habilita** (não força) a opção de o owner iniciar rescisão por inadimplência — mesmo fluxo de rescisão do item 4.3, mas com motivo `DELINQUENCY` em vez de `NOTICE`.
- Nenhuma ação automática além de notificar + flagar + habilitar rescisão. Sem bloqueio de conta, sem ação jurídica automatizada.

### 5.5 Pagamento via gateway

- Integração abstraída via **port/adapter** (`PaymentGatewayPort`), provedor (Asaas/Pagar.me/etc.) a decidir depois.
- Interface mínima: `createCharge(invoice)` → retorna id externo + dados de cobrança (Pix QR code / linha digitável de boleto); webhook recebe confirmação de pagamento.
- Webhook deve ser **idempotente** (armazenar id de transação externa e ignorar eventos duplicados).
- Suporta **Pix e boleto** como formas de pagamento.

### 5.6 Recibo (PDF)

- Ao marcar uma fatura como `PAID`, deve ser possível gerar um **recibo de aluguel em PDF** com os dados da fatura (valor, período de referência, partes, imóvel).

## 6. Manutenção (Maintenance Requests) — novo módulo

Fluxo:
1. Renter abre chamado: descrição + anexo de fotos, vinculado ao seu contrato/imóvel ativo.
2. Owner **aprova ou recusa** o chamado.
3. Após aprovado, chamado tem status simples: `OPEN → APPROVED → IN_PROGRESS → RESOLVED` (ou `REJECTED` se recusado direto).
4. Ao resolver, o owner pode opcionalmente vincular um **custo** ao chamado. **Owner decide caso a caso** se esse custo é debitado na próxima fatura do inquilino ou absorvido pelo proprietário — não há regra automática de quem paga.

Sem atribuição a prestador de serviço/vendor nesta versão — está fora do escopo atual.

## 7. Fiador (Guarantor) — nova entidade

Mesma profundidade de dados que `Owner`/`Renter`: nome, documento (CPF), telefone, e-mail, endereço completo, estado civil. **Sem** `Account`/login — é puramente um registro vinculado ao contrato (`ManyToOne` de `Contract` → `Guarantor`, ou `OneToOne` se um fiador só puder garantir um contrato por vez; a decidir na implementação, mas o dado em si é opcional por contrato).

## 8. Permissões (o que cada ator pode fazer via API)

**Renter:**
- Ler seu contrato ativo e os dados do imóvel alugado.
- Listar/ler suas faturas (pendentes, pagas, atrasadas) e iniciar pagamento via gateway.
- Atualizar seu próprio cadastro (dados pessoais, endereço, contato).
- Criar chamados de manutenção para o imóvel do seu contrato ativo.

**Owner:**
- CRUD completo de seus próprios imóveis, contratos, renters vinculados, charges.
- Aprovar/recusar/gerenciar chamados de manutenção dos seus imóveis.
- Ver relatórios/dashboards dos seus dados (seção 10).
- Iniciar/acompanhar rescisão de contratos.

Todo acesso é escopado por `ownerId` (para owner) ou pelo `contract`/`renterId` vinculado à própria conta (para renter) — nunca acesso cruzado entre owners diferentes, nem renter vendo dados de outro contrato.

## 9. Notificações

Canais: **SMS/WhatsApp**, reaproveitando a infraestrutura já usada para OTP.

Gatilhos:
- **Lembrete antes do vencimento** (ex: 3 dias antes do `dueDay`).
- **Alerta de atraso ao proprietário** quando um inquilino fica inadimplente (fatura vira `OVERDUE`, e novamente ao cruzar o threshold de inadimplência formal).

E-mail não está no escopo desta fase — apenas os canais já usados no fluxo de OTP.

## 10. Relatórios (dados que a API precisa expor)

- **Resumo financeiro mensal**: total recebido, total em aberto, total atrasado, por mês, escopado ao owner autenticado.
- **Ocupação dos imóveis**: contagem de imóveis `AVAILABLE` / `RENTED` / `MAINTENANCE` do owner.
- **Recibo de aluguel em PDF** por fatura paga (ver 5.6).

## 11. Novas entidades necessárias (resumo)

| Entidade | Propósito |
|---|---|
| `Invoice` | Fatura mensal: valor, status, vencimento, multa/juros, período de referência, contractId |
| `Guarantor` | Dados do fiador, opcional por contrato |
| `ContractSignature` | Status de assinatura por parte (owner/renter/guarantor) |
| `RentAdjustmentHistory` | Histórico de reajustes aplicados (índice, valor anterior/novo) |
| `MaintenanceRequest` | Chamado de manutenção + anexos + custo opcional vinculado a invoice |
| `PaymentTransaction` (ou similar) | Registro da cobrança externa no gateway (id externo, status, invoiceId) — garante idempotência de webhook |

Campos novos em `Contract` existente: `adjustmentIndex`, `delinquencyThresholdDays`, `terminationRequestedAt`, `terminationRequestedBy`, `terminationEffectiveDate`, `terminationPenaltyAmount`, `guarantorId?`.

`dueDay` no schema de criação de contrato deve validar range **1–28**.

## 12. Integrações externas (todas abstraídas via port/adapter — provedor concreto a decidir depois)

1. **Gateway de pagamento** (Pix/boleto) — Asaas/Pagar.me/outro.
2. **Provedor de assinatura eletrônica** — Clicksign/DocuSign/outro.
3. **API do Banco Central (SGS)** — consulta de índice IGPM/IPCA para reajuste automático. Esta é a única das três com fonte já definida (BCB), não precisa de decisão de provedor.

## 13. Jobs agendados necessários

- Geração mensal de faturas (rent + charges) para contratos `ACTIVE`, no `dueDay` de cada um.
- Transição `PENDING → OVERDUE` de faturas vencidas sem pagamento.
- Verificação diária de contratos que atingiram `endDate` → `FINISHED` + `Property.status → AVAILABLE`.
- Aplicação do reajuste anual no mês de aniversário do contrato (busca índice BCB, atualiza `rentAmount`, grava `RentAdjustmentHistory`).
- Verificação de threshold de inadimplência para flagar contratos.
- Disparo de lembretes de vencimento e alertas de atraso.

## 14. Decisões explicitamente fora de escopo nesta fase

- Multi-tenant formal / conceito de imobiliária-organização.
- Múltiplos inquilinos por contrato.
- Caução/depósito de garantia.
- Pagamento parcial de fatura.
- Estorno/reembolso de pagamento confirmado.
- Atribuição de prestador de serviço em chamados de manutenção.
- Notificação por e-mail.
- Conta/login para o fiador.
