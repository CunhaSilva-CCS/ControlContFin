# ControlContFin

App de controle financeiro pessoal para iOS e Android, feito com Expo (React Native + TypeScript). Todos os dados ficam armazenados localmente no dispositivo — sem login, sem backend.

## Stack

- Expo (managed workflow) + React Native + TypeScript
- React Navigation (bottom tabs + native-stack)
- react-native-paper (Material Design 3)
- Zustand (estado de UI)
- expo-sqlite + drizzle-orm (banco local, adicionado nas próximas fases)

## Rodando o projeto

```bash
npm install
npm start
```

Abra no Expo Go (iOS/Android) ou em um simulador/emulador escaneando o QR code exibido pelo comando acima.

## Scripts

- `npm run lint` — ESLint
- `npm run typecheck` — checagem de tipos TypeScript
- `npm test` — testes com Jest
- `npm run format` — formata o código com Prettier
