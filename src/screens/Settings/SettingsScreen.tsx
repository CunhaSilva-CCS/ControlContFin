import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { List } from 'react-native-paper';

import type { SettingsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<SettingsStackParamList, 'SettingsHome'>;

export function SettingsScreen({ navigation }: Props) {
  return (
    <List.Section style={styles.section}>
      <List.Item
        title="Contas"
        description="Gerencie suas contas bancárias, carteiras e cartões"
        left={(props) => <List.Icon {...props} icon="bank" />}
        onPress={() => navigation.navigate('AccountsList')}
      />
      <List.Item
        title="Transações recorrentes"
        description="Contas fixas e assinaturas com lembretes automáticos"
        left={(props) => <List.Icon {...props} icon="sync" />}
        onPress={() => navigation.navigate('RecurringRulesList')}
      />
      <List.Item
        title="Backup"
        description="Backup automático diário, exportação e restauração"
        left={(props) => <List.Icon {...props} icon="cloud-upload" />}
        onPress={() => navigation.navigate('Backup')}
      />
      <List.Item
        title="Segurança"
        description="PIN, biometria e bloqueio automático"
        left={(props) => <List.Icon {...props} icon="shield-lock" />}
        onPress={() => navigation.navigate('SecuritySettings')}
      />
    </List.Section>
  );
}

const styles = StyleSheet.create({
  section: {
    flex: 1,
  },
});
