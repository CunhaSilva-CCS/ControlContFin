# ControlContFin

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
- expo-secure-store + expo-crypto + expo-local-authentication (PIN e biometria)
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
  instalação e o hash (SHA-256 encadeado) fica em `expo-secure-store`, que usa o Keychain
  (iOS) / Keystore (Android) do sistema.
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
- **PIN esquecido**: a tela de bloqueio tem uma opção para remover a proteção e criar um novo
  PIN — isso nunca apaga os dados financeiros, só reseta o bloqueio.

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
