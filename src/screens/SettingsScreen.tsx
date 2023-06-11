import {View, StyleSheet} from 'react-native';
import React from 'react';
import {
  Button,
  Divider,
  Icon,
  Input,
  Layout,
  Text,
  TopNavigation,
} from '@ui-kitten/components';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TouchableWithoutFeedback} from '@ui-kitten/components/devsupport';
import {navigate} from '../RootNavigation';
import localStorage from '../store/localStorage';

const SettingsScreen = ({navigation}: Props) => {
  const [server, setServer] = React.useState('');
  const [port, setPort] = React.useState('');
  const [database, setDatabase] = React.useState('');

  const [isSubmit, setSubmit] = React.useState(false);

  const SettingIcon = (props): IconElement => (
    <Icon {...props} name="arrow-back-outline" />
  );

  const onCancel = () => {
    navigation.goBack();
  };

  const onSave = async () => {
    setSubmit(true);

    if (server && port && database) {
      await localStorage.setItem('serverInfo', {
        server,
        port,
        database,
      });
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <TopNavigation title="Настройки" alignment="center" />
      <Layout
        style={{
          flex: 1,
          justifyContent: 'space-between',
          alignItems: 'stretch',
          padding: 20,
        }}>
        <View></View>
        <View>
          <>
            <Input
              label="Серевер"
              style={{
                ...styles.input,
                flex: 0,
                marginBottom: 10,
              }}
              value={server}
              placeholder="Сервер"
              onChangeText={nextValue => setServer(nextValue)}
              status={!!(isSubmit && !server) ? 'danger' : 'primary'}
            />
            <Layout style={styles.container} level="1">
              <Input
                label="Порт"
                style={styles.input}
                value={port}
                placeholder="Порт"
                onChangeText={nextValue => setPort(nextValue)}
                status={!!(isSubmit && !port) ? 'danger' : 'primary'}
              />

              <Input
                label="База данных"
                style={styles.input}
                value={database}
                placeholder="База данных"
                onChangeText={nextValue => setDatabase(nextValue)}
                status={!!(isSubmit && !database) ? 'danger' : 'primary'}
              />
            </Layout>
          </>
        </View>
        <View>
          <Button
            style={{marginBottom: 20}}
            onPress={onCancel}
            accessoryLeft={SettingIcon}
            appearance="outline">
            Отмена
          </Button>
          <Button onPress={onSave}>Сохранить</Button>
        </View>
      </Layout>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    margin: 5,
  },
});

export default SettingsScreen;
