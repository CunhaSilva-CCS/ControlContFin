import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { spacing } from '@/constants/theme';
import { db } from '@/db/client';
import {
  buildBackupSnapshot,
  listAutomaticBackups,
  restoreBackupSnapshot,
  type BackupSnapshot,
} from '@/services/backupService';
import { writeAndShareFile } from '@/services/fileShare';
import { formatDatePtBR } from '@/utils/date';

export function BackupScreen() {
  const [backups, setBackups] = useState<{ name: string; createdAt: string }[]>([]);

  useEffect(() => {
    setBackups(listAutomaticBackups());
  }, []);

  async function handleManualBackup() {
    const snapshot = await buildBackupSnapshot(db);
    await writeAndShareFile('controlcontfin-backup.json', JSON.stringify(snapshot, null, 2), 'application/json');
  }

  async function handleRestore() {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];
    let snapshot: BackupSnapshot;
    try {
      const content = await new File(asset.uri).text();
      snapshot = JSON.parse(content);
    } catch {
      Alert.alert('Arquivo inválido', 'Não foi possível ler este arquivo de backup.');
      return;
    }

    Alert.alert(
      'Restaurar backup',
      'Isso substituirá todos os dados atuais do app pelos dados do backup. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: async () => {
            await restoreBackupSnapshot(db, snapshot);
            Alert.alert('Backup restaurado', 'Seus dados foram restaurados com sucesso.');
          },
        },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="bodyMedium">
        O app faz um backup automático local todos os dias. Você também pode exportar ou
        restaurar um backup manualmente a qualquer momento.
      </Text>

      <Button mode="contained" onPress={handleManualBackup}>
        Fazer backup agora e compartilhar
      </Button>
      <Button mode="outlined" onPress={handleRestore}>
        Restaurar backup de um arquivo
      </Button>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Backups automáticos recentes
      </Text>
      {backups.length === 0 ? (
        <Text variant="bodyMedium">Nenhum backup automático ainda.</Text>
      ) : (
        <FlatList
          data={backups}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <Text variant="bodyMedium">{formatDatePtBR(item.createdAt.slice(0, 10))}</Text>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  sectionTitle: {
    marginTop: spacing.md,
  },
});
