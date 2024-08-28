import {
  Button,
  Icon,
  Input,
  Layout,
  TopNavigation,
} from '@ui-kitten/components';
import React, { useContext, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDevTokens } from '../api/auth';
import { pingServer } from '../api/request';
import { navigate } from '../RootNavigation';
import localStorage from '../store/localStorage';
import { GlobalState } from '../store/global/global.state';

const SettingsScreen = ({ navigation }: Props) => {
  const [server, setServer] = React.useState('');
  const [port, setPort] = React.useState('');
  const [database, setDatabase] = React.useState('');
  const [serverStatus, setServerStatus] = React.useState(false);
  const [isCheckStatus, setCheckStatus] = React.useState(false);
  const [isSubmit, setSubmit] = React.useState(false);
  const [token, setToken] = React.useState('');

  const { showInstaller, updateData, downloadAndInstallAPK } =
    useContext(GlobalState);

  React.useEffect(() => {
    const init = async () => {
      const serverInfo = await localStorage.getItem('serverInfo');
      if (serverInfo?.server) {
        setServer(serverInfo.server);
      }
      if (serverInfo?.port) {
        setPort(serverInfo.port);
      }
      if (serverInfo?.database) {
        setDatabase(serverInfo.database);
      }
    };

    init();
  }, []);

  const SettingIcon = (props): IconElement => (
    <Icon {...props} name="arrow-back-outline" />
  );

  const SuccessIcon = (props): IconElement => (
    <Icon {...props} name="checkmark-circle-outline" />
  );

  const AlertIcon = (props): IconElement => (
    <Icon {...props} name="alert-circle-outline" />
  );

  const onCancel = () => {
    let canGoBack = navigation.canGoBack();

    if (canGoBack) {
      navigation.goBack();
    } else {
      navigate('Login');
    }
  };

  const onSave = async () => {
    setSubmit(true);

    if (server && port && database) {
      let serverFormatted = server;

      if (!server.includes('://')) {
        serverFormatted = `http://${server}`;
      }

      await localStorage.setItem('serverInfo', {
        server: serverFormatted,
        port,
        database,
      });

      onCancel();
    }
  };

  const onCheckServer = async () => {
    const result = await pingServer();
    if (result?.status === 200) {
      setServerStatus(result.status);
    }

    setCheckStatus(true);
  };

  const refreshToken = async () => {
    const token = await getDevTokens({ isRefresh: true });
    if (token) {
      setToken(token);
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    }
    const timer = setTimeout(() => {
      setToken('');
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [token]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
              label="Сервер"
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
            {Boolean(server && port && database) && (
              <>
                <Button
                  style={{ margin: 5, marginTop: 10 }}
                  onPress={onCheckServer}
                  status={
                    serverStatus === 200
                      ? 'success'
                      : isCheckStatus
                        ? 'danger'
                        : 'primary'
                  }
                  accessoryLeft={
                    serverStatus === 200
                      ? SuccessIcon
                      : isCheckStatus
                        ? AlertIcon
                        : null
                  }
                  appearance="outline">
                  Проверить сервер
                </Button>
                <Button
                  style={{ margin: 5, marginTop: 10 }}
                  onPress={refreshToken}
                  status={token ? 'success' : 'primary'}
                  accessoryLeft={!!token ? SuccessIcon : null}>
                  Обновить токен
                </Button>
                {!!showInstaller && (
                  <Button
                    style={{ margin: 5, marginTop: 10 }}
                    onPress={downloadAndInstallAPK}>
                    Установить версию {updateData?.version}
                  </Button>
                )}
              </>
            )}
          </>
        </View>
        <View>
          <Button
            style={{ marginBottom: 20 }}
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
