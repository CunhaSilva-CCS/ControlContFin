import { Component, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { colors, spacing } from '@/constants/theme';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

/**
 * Catches render-time exceptions anywhere in the tree below it so a single
 * bad screen doesn't take down the whole app to a blank white screen with no
 * way back. React error boundaries only work as class components.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('Erro não tratado capturado pelo ErrorBoundary', error);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text variant="headlineSmall" style={styles.title}>
            Algo deu errado
          </Text>
          <Text variant="bodyMedium" style={styles.message}>
            Ocorreu um erro inesperado nesta tela. Seus dados financeiros não foram afetados.
          </Text>
          <Button mode="contained" onPress={this.handleRetry}>
            Tentar novamente
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
});
