# ControlContFin

App de controle financeiro pessoal completo para iOS e Android, feito com Expo (React Native + TypeScript). Todos os dados ficam armazenados localmente no dispositivo — sem login, sem backend.

## Funcionalidades

- Contas, categorias e transações (receitas, despesas e transferências)
- Orçamentos mensais por categoria com alerta de estouro
- Metas de economia com acompanhamento de progresso
- Transações recorrentes (contas fixas/assinaturas) com lembretes automáticos
- Relatórios com gráficos (gastos por categoria, receita x despesa por mês, evolução do saldo)
- Exportação de dados em CSV/JSON
- Backup automático diário local, além de exportação/restauração manual de backup

## Stack

- Expo (managed workflow) + React Native + TypeScript
- React Navigation (bottom tabs + native-stack)
- react-native-paper (Material Design 3)
- Zustand (estado de UI e sincronização entre telas)
- expo-sqlite + drizzle-orm (banco local, com migrations versionadas em `src/db/migrations`)
- expo-notifications + expo-task-manager + expo-background-task (lembretes e geração de recorrências)
- react-native-gifted-charts (gráficos)
- expo-file-system + expo-sharing + expo-document-picker (exportação e backup)

## Rodando o projeto

```bash
npm install
npm start
```

Abra no Expo Go (iOS/Android) escaneando o QR code exibido pelo comando acima.

> A partir das funcionalidades de notificações e tarefas em segundo plano, o Expo Go tem suporte
> limitado — para testar essas partes é necessário criar um Dev Client
> (`npx expo install expo-dev-client` já está no projeto; rode `npx expo run:ios` ou
> `npx expo run:android`, ou gere um build de desenvolvimento com `eas build --profile development`).

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
