# Textos de ficha de loja — ControlContFin

Textos prontos para colar diretamente no Google Play Console e na App Store Connect. Revise os
campos entre `[colchetes]` antes de publicar.

Categoria sugerida (ambas as lojas): **Finanças**.

---

## Google Play (Android)

### Descrição curta (máx. 80 caracteres)

```
Controle financeiro pessoal 100% offline, seguro e sem anúncios.
```
*(66 caracteres)*

### Descrição completa (máx. 4000 caracteres)

```
ControlContFin é o seu controle financeiro pessoal — simples, elegante e 100% no seu aparelho.

Nenhum dado sai do seu celular. Sem servidores, sem contas, sem anúncios, sem coleta de dados.
Tudo fica salvo localmente, protegido por criptografia.

PRINCIPAIS RECURSOS

• Contas e transações — registre receitas, despesas e transferências entre suas contas.
• Categorias personalizáveis — organize seus gastos do seu jeito, com ícones e cores.
• Orçamentos — defina limites mensais por categoria e acompanhe o quanto já gastou.
• Metas de economia — crie metas e registre contribuições até alcançá-las.
• Transações recorrentes — lançamentos automáticos para contas fixas, com lembretes.
• Relatórios visuais — gráficos de receitas, despesas e evolução do saldo ao longo do tempo.
• Múltiplas contas — corrente, poupança, carteira, cartão de crédito e mais.
• Exportação — exporte seus dados em CSV, JSON ou backup completo, quando quiser.

PRIVACIDADE EM PRIMEIRO LUGAR

• Banco de dados criptografado no próprio aparelho (SQLCipher).
• Bloqueio por PIN e biometria (Face ID / impressão digital).
• Nenhuma informação financeira é enviada para servidores — porque não existe nenhum servidor.
• Sem rastreamento, sem analytics, sem anúncios de terceiros.

Ideal para quem quer organizar as finanças pessoais sem abrir mão da privacidade.

[Adicione aqui um link de suporte/contato antes de publicar, se desejar.]
```
*(≈ 1550 caracteres — bem dentro do limite de 4000)*

### Seção "Segurança dos dados" (Data Safety) do Play Console

O formulário do Play Console pergunta, categoria por categoria (localização, informações
financeiras, mensagens, etc.), se o app **coleta** e/ou **compartilha** aquele tipo de dado. Como
o ControlContFin não transmite nenhum dado para fora do aparelho, a resposta recomendada é a
mesma em todas as categorias:

- **"Este app coleta ou compartilha algum dos tipos de dados do usuário?"** → **Não**.
- Ainda que o app trabalhe com dados financeiros, essa marcação se refere a dados **coletados
  pelo desenvolvedor** (enviados para fora do aparelho) — o que não ocorre aqui, já que tudo fica
  local. Se o formulário pedir para detalhar mesmo assim, declare o tipo "Informações financeiras"
  com a opção **"Os dados não saem do aparelho"** (processamento 100% local), se essa opção
  estiver disponível na versão do formulário no momento da submissão.
- Marque também **"Este app segue a Política de Segurança de Dados do Google Play e usa
  criptografia em trânsito e em repouso"** para o armazenamento local (SQLCipher já cobre o "em
  repouso"; não há "em trânsito" porque não há transmissão).

---

## App Store (iOS)

### Subtítulo (máx. 30 caracteres)

```
Finanças pessoais offline
```
*(26 caracteres)*

### Texto promocional (máx. 170 caracteres — pode ser atualizado sem nova submissão)

```
Controle total das suas finanças, 100% no seu aparelho. Sem contas, sem anúncios, sem coleta de dados.
```
*(104 caracteres)*

### Descrição completa (máx. 4000 caracteres)

```
ControlContFin é o seu controle financeiro pessoal — simples, elegante e totalmente privado.

Todos os seus dados ficam apenas no seu iPhone, protegidos por criptografia. Não existe servidor,
conta de usuário ou coleta de dados de nenhum tipo.

PRINCIPAIS RECURSOS

• Contas e transações, incluindo transferências entre contas
• Categorias personalizáveis com ícones e cores
• Orçamentos mensais por categoria, com acompanhamento visual
• Metas de economia com contribuições registradas
• Transações recorrentes com lembretes automáticos
• Relatórios e gráficos de receitas, despesas e evolução do saldo
• Suporte a múltiplas contas (corrente, poupança, carteira, cartão de crédito)
• Exportação de dados em CSV, JSON ou backup completo

PRIVACIDADE COMO PADRÃO

• Banco de dados criptografado (SQLCipher), guardado só no seu aparelho
• Desbloqueio por Face ID, Touch ID ou PIN
• Nenhum dado financeiro é transmitido — porque não há para onde transmitir
• Sem rastreamento, sem anúncios, sem SDKs de terceiros

Para quem quer organizar a vida financeira sem abrir mão de privacidade.
```
*(≈ 1150 caracteres)*

### Palavras-chave (máx. 100 caracteres, separadas por vírgula, sem espaços após a vírgula)

```
finanças,orçamento,gastos,economia,dinheiro,controle financeiro,metas,privacidade,offline
```
*(90 caracteres)*

### Seção de privacidade (App Privacy / "Nutrition Label") da App Store Connect

No formulário "App Privacy" da App Store Connect, para cada categoria de dado (Informações
Financeiras, Identificadores, Uso, etc.), a resposta recomendada é:

- **"Data Not Collected"** (Dados não coletados) para todas as categorias — o app não envia
  nenhum dado para o desenvolvedor ou para terceiros; tudo é processado e armazenado localmente
  no aparelho do usuário.
