# Finanças Fácil

App de controle financeiro pessoal completo para iOS e Android, feito com Expo (React Native + TypeScript). Todos os dados ficam armazenados localmente no dispositivo — sem contas remotas, sem backend.

## Funcionalidades

- Contas, categorias e transações (receitas, despesas e transferências)
- Orçamentos mensais por categoria com alerta de estouro
- Metas de economia com acompanhamento de progresso
- Transações recorrentes (contas fixas/assinaturas) com lembretes automáticos
- Relatórios com gráficos (gastos por categoria, receita x despesa por mês, evolução do saldo)
- Exportação de dados em CSV/JSON
- Backup automático diário local, além de exportação/restauração manual de backup
- Bloqueio do app por PIN com segundo fator opcional (biometria), bloqueio automático por
  inatividade e limitação progressiva de tentativas (ver [Segurança](#segurança))

## Stack

- Expo (managed workflow) + React Native + TypeScript
- React Navigation (bottom tabs + native-stack)
- react-native-paper (Material Design 3)
- Zustand (estado de UI e sincronização entre telas)
- expo-sqlite + drizzle-orm (banco local, com migrations versionadas em `src/db/migrations`)
- expo-notifications + expo-task-manager + expo-background-task (lembretes e geração de recorrências)
- react-native-gifted-charts (gráficos)
- expo-file-system + expo-sharing + expo-document-picker (exportação e backup)
- expo-secure-store + expo-crypto + expo-local-authentication + @noble/hashes (PIN e biometria)
- SQLCipher (via plugin nativo do expo-sqlite) + aes-js (criptografia em repouso)

## Segurança

### Criptografia dos dados em repouso

O banco de dados SQLite inteiro é criptografado com **SQLCipher** (AES-256), não apenas
protegido por senha na tela — ou seja, o arquivo `.db` no armazenamento do aparelho fica
ilegível mesmo se for extraído diretamente (backup de terceiros, aparelho com root/jailbreak,
etc.), sem passar pelo app.

- **Chave**: gerada aleatoriamente (256 bits) na primeira execução e guardada no
  `expo-secure-store` (Keychain/Keystore do sistema), marcada como vinculada a este aparelho
  (`WHEN_UNLOCKED_THIS_DEVICE_ONLY`) — não é incluída em backups na nuvem do iCloud/Google, e não
  depende do PIN do app (perder/resetar o PIN não afeta a chave nem os dados).
- **Onde é aplicada**: `src/db/encryptionKey.ts` gera/recupera a chave; `src/db/client.ts` aplica
  `PRAGMA key` na conexão antes de qualquer outra operação no banco.
- **Backups automáticos**: os arquivos de backup diário local (`src/services/backupService.ts`)
  também são criptografados (AES-256-CTR, `src/services/backupEncryption.ts`) com a mesma chave.
- **Backup manual exportado**: o arquivo gerado por "Fazer backup agora e compartilhar" **não é
  criptografado** — ele foi pensado para ser portável/restaurável em qualquer aparelho, então
  criptografá-lo exigiria uma senha própria de exportação (fora do escopo atual). Trate esse
  arquivo como um documento sensível.

> ⚠️ **Requer rebuild nativo**: `useSQLCipher` é uma flag de build (compilada no binário nativo),
> não algo que funciona no Expo Go — a partir desta mudança, **o app inteiro** (não só
> notificações/biometria) só roda em um Dev Client ou build gerado via `npx expo run:ios` /
> `npx expo run:android` / EAS Build. Não foi possível validar em um dispositivo real neste
> ambiente (sem simulador/aparelho) — depois de gerar um build, é possível confirmar que a
> criptografia está realmente ativa extraindo o arquivo `.db` do aparelho (ex.: `adb pull` no
> Android) e verificando que ele **não** começa com o cabeçalho padrão `SQLite format 3` em texto
> puro — se aparecer esse cabeçalho, o build não compilou com SQLCipher.

### Bloqueio do app

O app é protegido por um PIN numérico de 6 dígitos, obrigatório desde o primeiro uso:

- **Armazenamento**: o PIN nunca é salvo em texto puro. É gerado um salt aleatório por
  instalação e o hash — **PBKDF2-HMAC-SHA256 com 100.000 iterações** (`@noble/hashes`, roda
  inteiramente em JS puro, sem depender de round-trips pela ponte nativa) — fica em
  `expo-secure-store`, que usa o Keychain (iOS) / Keystore (Android) do sistema. O contador de
  tentativas incorretas fica **na mesma entrada** do salt/hash (não em uma chave separada), para
  que não seja possível zerar o bloqueio sem também apagar a credencial.
- **Política de PIN**: exige exatamente 6 dígitos numéricos e rejeita PINs óbvios (todos os
  dígitos iguais ou sequências como `123456`/`987654`) — ver `src/services/auth/pinPolicy.ts`.
- **Segundo fator (MFA)**: quando o aparelho tem biometria disponível, o usuário pode exigir
  também Face ID/digital além do PIN para desbloquear — os dois fatores são checados de forma
  independente (`src/services/auth/biometricAuth.ts`).
- **Bloqueio por tentativas**: após tentativas incorretas o app aplica um lockout progressivo
  (30s → 5min → 30min → 24h) antes de aceitar uma nova tentativa — ver
  `src/services/auth/lockoutPolicy.ts`.
- **Bloqueio automático**: o app volta a pedir PIN/biometria depois de ficar em segundo plano
  por um tempo configurável (imediato, 1, 5 ou 15 min) em Ajustes → Segurança.
- **Privacidade no app-switcher**: assim que o app sai de primeiro plano, um overlay cobre a
  tela imediatamente (antes do sistema tirar a miniatura de apps recentes) — independente do
  timer de bloqueio automático, que é mais lento (`src/hooks/useAppSwitcherPrivacy.ts`).
- **PIN esquecido**: a tela de bloqueio tem uma opção para remover a proteção e criar um novo
  PIN — isso nunca apaga os dados financeiros, só reseta o bloqueio.

> Uma auditoria de segurança rodada nesta branch encontrou e corrigiu os dois pontos acima
> (hash fraco e lockout isolado) e mais alguns itens médios (limpeza de arquivos de
> export/backup manual, atualização do `drizzle-orm`, build de produção sem `expo-dev-client`
> via `app.config.js`/`eas.json`). O fallback de biometria para a senha do aparelho e a falta
> de autenticação (MAC) no backup automático ficaram documentados como possível trabalho
> futuro, não corrigidos nesta rodada.

## Rodando o projeto

```bash
npm install
npm start
```

> ⚠️ **O Expo Go não funciona mais para este projeto.** Como o banco de dados agora usa SQLCipher
> (uma flag de build nativa, ver [Segurança](#segurança)), é obrigatório usar um Dev Client:
> ```bash
> npx expo run:android   # precisa do Android Studio
> npx expo run:ios       # precisa de macOS + Xcode
> ```
> Sem Android Studio/Xcode instalados, gere um build de desenvolvimento pela nuvem:
> ```bash
> npm install -g eas-cli
> eas login
> eas build --profile development --platform android   # ou ios
> ```
> Depois de instalar esse build no aparelho, `npm start` conecta nele normalmente.

Quando for gerar uma build de verdade para a loja, use o perfil `production`
(`eas build --profile production --platform android`), que já vem configurado em `eas.json`
para **não** incluir o `expo-dev-client` (menu de desenvolvedor/carregamento remoto de bundle)
— ver [Segurança](#segurança).

## Checklist de publicação nas lojas

O que já está pronto em código, e o que ainda depende de ação externa (contas, arte, textos)
antes de submeter de verdade à App Store / Play Store.

### ✅ Já resolvido em código

- Tratamento de erro em todas as leituras assíncronas do banco (hooks em `src/hooks/*.ts` e
  telas de formulário/detalhe) — uma falha mostra uma mensagem em vez de deixar a tela presa
  num spinner infinito.
- `ErrorBoundary` global (`src/components/common/ErrorBoundary.tsx`) — uma exceção de render em
  qualquer tela não derruba mais o app inteiro para uma tela branca.
- Recuperação de falha ao abrir o banco criptografado (`src/db/client.ts`): se a chave do
  SQLCipher não bater com o arquivo `.db` (ex.: aparelho restaurado de um backup do sistema),
  o app mostra uma tela de recuperação com a opção "Recomeçar do zero" em vez de travar no
  carregamento.
- Chamadas "fire-and-forget" (seed inicial, notificações, tarefa em segundo plano, geração de
  recorrências, backup automático) agora tratam erro e registram no console em vez de falhar
  silenciosamente sem deixar rastro.
- `ios.bundleIdentifier` / `android.package` configurados em `app.json` (necessário para
  qualquer build de loja) — **valor inicial `com.cunhasilva.controlcontfin`, veja o aviso
  abaixo**.
- Splash screen configurada via plugin `expo-splash-screen`, usando o asset
  `assets/splash-icon.png` que já existia no projeto.
- `eas.json` com perfis `development`/`preview`/`production`, e `production` já excluindo o
  `expo-dev-client` do binário final (ver [Segurança](#segurança)).
- CI (`.github/workflows/ci.yml`) rodando typecheck, lint e testes em todo push/PR.
- **Textos de política de privacidade e termos de uso** já redigidos, em
  `docs/legal/politica-de-privacidade.html` e `docs/legal/termos-de-uso.html` — páginas HTML
  autocontidas, prontas para hospedar em qualquer host estático (GitHub Pages, Netlify, etc.).
  São um rascunho gerado como ponto de partida; **recomenda-se revisão por um advogado** antes de
  publicar, e é preciso preencher os campos marcados como pendentes nos próprios arquivos (e-mail
  de suporte, razão social, comarca).
- **Textos de ficha de loja** já redigidos, em `docs/loja/textos-ficha-de-loja.md` — descrições,
  palavras-chave e o preenchimento recomendado das seções de privacidade do Play Console e da App
  Store Connect, prontos para colar direto nas fichas.

> ⚠️ **Sobre o `bundleIdentifier`/`package`**: o valor usado (`com.cunhasilva.controlcontfin`) é
> um placeholder razoável, mas **confirme ou troque antes da primeira submissão** — depois que um
> app é publicado numa loja com um identificador, trocá-lo depois exige efetivamente publicar
> como um app novo (perdendo avaliações, histórico de instalação, etc.).

### ⏳ Depende de ação externa (fora do escopo de código)

- **Conta de desenvolvedor**: Apple Developer Program (assinatura anual) para iOS, e Google Play
  Console (taxa única) para Android — necessárias para gerar as credenciais que preenchem
  `eas.json`'s `submit.production` e para efetivamente enviar o build às lojas.
- **Arte final do ícone e splash**: `assets/icon.png` hoje é o ícone genérico padrão do template
  do Expo (não é uma marca própria) — precisa ser substituído por artwork real antes de submeter.
  O mesmo vale para revisar se `assets/splash-icon.png` reflete a identidade visual desejada.
- **Hospedar a política de privacidade**: o texto já está pronto (veja acima), mas ainda precisa
  ser publicado em algum host público — ambas as lojas exigem esse link na ficha do app, mesmo
  sendo um app 100% local, por causa do uso de biometria e notificações.
- **Teste em dispositivo/simulador real**: nada neste projeto foi validado num aparelho de
  verdade neste ambiente de desenvolvimento (sem simulador/dispositivo físico disponível aqui) —
  veja as instruções em [Rodando o projeto](#rodando-o-projeto) para gerar um Dev Client e testar
  antes de submeter.

## Scripts

- `npm run lint` — ESLint
- `npm run typecheck` — checagem de tipos TypeScript
- `npm test` — testes com Jest
- `npm run format` — formata o código com Prettier

## Estrutura

```
src/
├── navigation/   # Navegação (abas + stacks)
├── screens/      # Telas por área do app
├── components/   # Componentes reutilizáveis
├── db/           # Schema, migrations e repositórios (Drizzle + expo-sqlite)
├── store/        # Estado global (Zustand)
├── services/     # Regras de negócio (recorrência, orçamentos, metas, relatórios, backup)
├── hooks/        # Hooks de dados ligados ao banco local
├── constants/    # Tema, categorias padrão, presets
└── utils/        # Funções utilitárias (moeda, datas)
```
