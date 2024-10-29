import { Button, Icon, Input, Layout, TopNavigation } from '@ui-kitten/components';
import React, { useContext, useEffect } from 'react';
import { StyleSheet, View, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDevTokens } from '../api/auth';
import { pingServer } from '../api/request';
import { navigate } from '../RootNavigation';
import localStorage from '../store/localStorage';
import { GlobalState } from '../store/global/global.state';
import { PermissionsAndroid } from 'react-native';
import { Linking, Platform } from 'react-native';
import requestPermissions  from '../utils/PermissionHandler';


const SettingsScreen = ({ navigation }: Props) => {
  const [server, setServer] = React.useState('');
  const [port, setPort] = React.useState('');
  const [database, setDatabase] = React.useState('');
  const [serverStatus, setServerStatus] = React.useState(false);
  const [isCheckStatus, setCheckStatus] = React.useState(false);
  const [isSubmit, setSubmit] = React.useState(false);
  const [token, setToken] = React.useState('');
  const backgroundImage = require('../img/pattern.png');

  const { showInstaller, updateData, downloadAndInstallAPK } = useContext(GlobalState);

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
    <Icon {...props} fill="#3E3346" name="checkmark-circle-outline" />
  );

  const SaveIcon = (props): IconElement => (
    <Icon {...props} fill="#FFFFFF" name="save-outline" />
  );

  const QuestionIcon = (props): IconElement => (
    <Icon {...props} fill="#3E3346" name="question-mark-circle-outline" />
  )

  const onCancel = () => {
    let canGoBack = navigation.canGoBack();

    if (canGoBack) {
      navigation.goBack();
    } else {
      navigate('Login');
    }
  };

  const onSave = async (returnLoginScreen) => {
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

      if (returnLoginScreen) {
        onCancel();
      }
    }
  };

  const onCheckServer = async () => {
    onSave(false);
    setCheckStatus(false); // Сброс статуса перед проверкой

    try {
      const result = await pingServer();
      if (result?.status === 200) {
        setServerStatus(true);
      } else {
        Alert.alert("Сервер отдал статус: " + result?.status);
      }
    } catch (error) {
      Alert.alert("Сервер недоступен");

      setServerStatus(false); // Установите статус 0 или другой, чтобы обозначить ошибку
    } finally {
      setCheckStatus(false); // Устанавливаем статус проверки в true в любом случае
    }
  };

  const refreshToken = async () => {
    onSave(false);

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

  useEffect(() => {
    //requestAllPermissions();
  }, []);

  useEffect(() => {
    // Запрашиваем разрешения при монтировании компонента
    requestPermissions();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Layout style={styles.layout}>
        <View style={styles.backgroundContainer}>
          <Image source={backgroundImage} style={styles.background} />
        </View>

        <View style={styles.formContainer}>
          <View style={styles.rowContainer}>
            <Input
              label="Сервер"
              style={[styles.input, { flex: 0.7 }]}
              value={server}
              size='medium'
              onChangeText={(text) => setServer(text.replace(/\s+/g, ''))}
            />

            <Input
              label="Порт"
              size='medium'
              style={[styles.input, { flex: 0.25 }]}
              value={port}
              onChangeText={(text) => setPort(text.replace(/\s+/g, ''))}
            />
          </View>

          <View style={styles.rowContainer}>
            <Input
              label="База данных"
              size='medium'
              style={styles.input}
              value={database}
              onChangeText={(text) => setDatabase(text.replace(/\s+/g, ''))}
            />

            <Button
              style={{}}
              onPress={onCheckServer}
              accessoryLeft={serverStatus ? QuestionIcon : SuccessIcon}
              appearance='ghost'
              size='medium'
            >
            </Button>
          </View>
        </View>

        {/*downloadAndInstallAPK*/}
        {/*requestAllPermissions*/}

        <Button
          style={{ margin: 5, marginTop: 10 }}
          onPress={requestPermissions}>
          Установить версию {updateData?.version}
        </Button>

        {/*server && port && database && (
            <Button
              style={{ margin: 5, marginTop: 10 }}
              onPress={refreshToken}
              status={token ? 'success' : 'primary'}
              accessoryLeft={token ? SuccessIcon : null}>
              Обновить токен
            </Button>
            {!showInstaller && (
              <Button
                style={{ margin: 5, marginTop: 10 }}
                onPress={downloadAndInstallAPK}>
                Установить версию {updateData?.version}
              </Button>
            )}
          )*/}

        <View>
          <Button
            style={{ marginBottom: 20 }}
            onPress={onCancel}
            accessoryLeft={SettingIcon}
            appearance="outline">
            Отмена
          </Button>
          <Button
            appearance="filled"
            status='basic'
            accessoryLeft={SaveIcon}
            onPress={onSave}>
            Сохранить
          </Button>
        </View>
      </Layout>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'stretch',
    position: 'relative',
    padding: 20,
  },
  container: {
    flex: 1,
  },
  input: {
    flex: 1,
    //margin: 5,
    marginBottom: 10,
    borderRadius: 0
  },
  background: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.3
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  rowContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row', // Расположение элементов в ряд
    justifyContent: 'space-between', // Распределение пространства между элементами
    alignItems: 'center', // Выравнивание по центру по вертикали
  },
});

export default SettingsScreen;
