import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, Text, TextInput } from 'react-native-paper';

import { colors, spacing } from '@/constants/theme';
import { db } from '@/db/client';
import {
  buildBackupSnapshot,
  listAutomaticBackups,
  restoreBackupSnapshot,
  type BackupSnapshot,
} from '@/services/backupService';
import {
  decryptBackupWithPassword,
  encryptBackupWithPassword,
  isEncryptedBackupEnvelope,
  type EncryptedBackupEnvelope,
} from '@/services/backupEncryption';
import { validateBackupPassword } from '@/services/backupPasswordPolicy';
import { writeAndShareFile } from '@/services/fileShare';
import { formatDatePtBR } from '@/utils/date';

export function BackupScreen() {
  const [backups, setBackups] = useState<{ name: string; createdAt: string }[]>([]);

  const [exportDialogVisible, setExportDialogVisible] = useState(false);
  const [exportPassword, setExportPassword] = useState('');
  const [exportPasswordConfirm, setExportPasswordConfirm] = useState('');
  const [exportError, setExportError] = useState<string | null>(null);

  const [importDialogVisible, setImportDialogVisible] = useState(false);
  const [importPassword, setImportPassword] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingEnvelope, setPendingEnvelope] = useState<EncryptedBackupEnvelope | null>(null);

  useEffect(() => {
    setBackups(listAutomaticBackups());
  }, []);

  function handleManualBackup() {
    setExportPassword('');
    setExportPasswordConfirm('');
    setExportError(null);
    setExportDialogVisible(true);
  }

  function closeExportDialog() {
    setExportDialogVisible(false);
  }

  async function confirmExport() {
    const validation = validateBackupPassword(exportPassword);
    if (!validation.valid) {
      setExportError(validation.reason);
      return;
    }
    if (exportPassword !== exportPasswordConfirm) {
      setExportError('As senhas não coincidem.');
      return;
    }

    const snapshot = await buildBackupSnapshot(db);
    const envelope = await encryptBackupWithPassword(JSON.stringify(snapshot), exportPassword);
    await writeAndShareFile('controlcontfin-backup.json', envelope, 'application/json');
    closeExportDialog();
  }

  function confirmAndRestore(snapshot: BackupSnapshot) {
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

  async function handleRestore() {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];
    let parsed: unknown;
    try {
      const content = await new File(asset.uri).text();
      parsed = JSON.parse(content);
    } catch {
      Alert.alert('Arquivo inválido', 'Não foi possível ler este arquivo de backup.');
      return;
    }

    if (isEncryptedBackupEnvelope(parsed)) {
      setPendingEnvelope(parsed);
      setImportPassword('');
      setImportError(null);
      setImportDialogVisible(true);
      return;
    }

    // Backup exportado antes da senha existir: JSON puro do snapshot, sem o
    // campo "format" do envelope — continua funcionando sem pedir senha.
    confirmAndRestore(parsed as BackupSnapshot);
  }

  function closeImportDialog() {
    setImportDialogVisible(false);
    setPendingEnvelope(null);
  }

  async function confirmImportPassword() {
    if (!pendingEnvelope) {
      return;
    }
    try {
      const decrypted = await decryptBackupWithPassword(pendingEnvelope, importPassword);
      const snapshot: BackupSnapshot = JSON.parse(decrypted);
      closeImportDialog();
      confirmAndRestore(snapshot);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Senha incorreta ou arquivo corrompido.');
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="bodyMedium">
        O app faz um backup automático local todos os dias, criptografado com a mesma chave que
        protege o banco de dados. Você também pode exportar ou restaurar um backup manualmente a
        qualquer momento — o arquivo exportado para compartilhamento é protegido por uma senha
        escolhida na hora da exportação, então guarde essa senha em um lugar seguro.
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

      <Portal>
        <Dialog visible={exportDialogVisible} onDismiss={closeExportDialog}>
          <Dialog.Title>Proteger backup com senha</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <Text variant="bodyMedium">
              Essa senha será necessária para restaurar este backup depois. Guarde-a em um lugar
              seguro — se você perdê-la, não será possível recuperar os dados deste arquivo.
            </Text>
            <TextInput
              label="Senha"
              mode="outlined"
              secureTextEntry
              value={exportPassword}
              onChangeText={setExportPassword}
            />
            <TextInput
              label="Confirmar senha"
              mode="outlined"
              secureTextEntry
              value={exportPasswordConfirm}
              onChangeText={setExportPasswordConfirm}
            />
            {exportError && (
              <Text variant="bodyMedium" style={styles.error}>
                {exportError}
              </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeExportDialog}>Cancelar</Button>
            <Button onPress={confirmExport}>Continuar</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={importDialogVisible} onDismiss={closeImportDialog}>
          <Dialog.Title>Digite a senha do backup</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <Text variant="bodyMedium">Este arquivo está protegido por senha.</Text>
            <TextInput
              label="Senha"
              mode="outlined"
              secureTextEntry
              value={importPassword}
              onChangeText={setImportPassword}
            />
            {importError && (
              <Text variant="bodyMedium" style={styles.error}>
                {importError}
              </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeImportDialog}>Cancelar</Button>
            <Button onPress={confirmImportPassword}>Restaurar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  dialogContent: {
    gap: spacing.sm,
  },
  error: {
    color: colors.expense,
  },
});
