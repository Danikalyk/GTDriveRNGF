import { Button, Icon, Input, Layout, TopNavigation, Tooltip, Card, Text, Spinner } from '@ui-kitten/components';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDevTokens } from '../api/auth';
import { pingServer } from '../api/request';
import { navigate } from '../RootNavigation';
import localStorage from '../store/localStorage';
import { GlobalState } from '../store/global/global.state';
import requestPermissions from '../utils/PermissionHandler';
import { styles } from '../styles';

const SettingsScreen = ({ navigation }: Props) => {
  const [server, setServer] = React.useState('');
  const [port, setPort] = React.useState('');
  const [database, setDatabase] = React.useState('');
  const [serverStatus, setServerStatus] = React.useState(false);
  const [isCheckStatus, setCheckStatus] = React.useState(false);
  const [isSubmit, setSubmit] = React.useState(false);
  const [token, setToken] = React.useState('');
  const backgroundImage = require('../img/pattern.png');
  const [pending, setPending] = useState(false);

  const { showInstaller, updateData, downloadAndInstallAPK, loadingApp } = useContext(GlobalState);

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
    <Icon {...props} fill="#BC4055" name="question-mark-circle-outline" />
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
    setPending(true);

    try {
      const result = await pingServer();
      if (result?.status === 200) {
        setServerStatus(true);
        
        Alert.alert("Сервер доступен");
      } else {
        Alert.alert("Сервер отдал статус: " + result?.status);
      }

      setPending(false);
    } catch (error) {
      Alert.alert("Сервер недоступен");

      setServerStatus(false); // Установите статус 0 или другой, чтобы обозначить ошибку
      setPending(false);
    } finally {
      setCheckStatus(false); // Устанавливаем статус проверки в true в любом случае
      setPending(false);
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

  const renderCardUpdate = () => {

    const renderCardUpdateHeader = () => {
      return (
        <View style={{ padding: 10, alignItems: 'center' }}>
          <Text category="label" style={{ fontSize: 14 }}>Доступна новая версия {updateData?.version}</Text>
        </View>
      );
    }

    return (
      <Card
        status="basic"
        style={{marginTop: 40}}
        header={() => renderCardUpdateHeader()}
      >
        <Button
          style={{ margin: 5, marginTop: 5 }}
          status="basic"
          onPress={downloadAndInstallAPK}
          accessoryLeft={<Icon name="download-outline" />}
          >
          Скачать
        </Button>
      </Card>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Layout style={[styles.layout, {padding: 10}]}>
        <View style={styles.backgroundContainer}>
          <Image source={backgroundImage} style={styles.background} />
        </View>

        {loadingApp && (
          <View style={styles.spinnerContainer}>
            <Spinner size="giant" status='basic' />
          </View>
        )}

        {pending && (
          <View style={styles.spinnerContainer}>
            <Spinner size="giant" status='basic' />
          </View>
        )}
        
        <View style={styles.formContainer}>
          <View style={styles.rowContainer}>
            <Input
              label="Сервер"
              style={[styles.loginInput, { flex: 0.7 }]}
              value={server}
              size='medium'
              onChangeText={(text) => setServer(text.replace(/\s+/g, ''))}
            />

            <Input
              label="Порт"
              size='medium'
              style={[styles.loginInput, { flex: 0.25 }]}
              value={port}
              onChangeText={(text) => setPort(text.replace(/\s+/g, ''))}
            />
          </View>

          <View style={styles.rowContainer}>
            <Input
              label="База данных"
              size='medium'
              style={[styles.loginInput, {flex: 0.99}]}
              value={database}
              onChangeText={(text) => setDatabase(text.replace(/\s+/g, ''))}
            />

            <Button
              style={{ marginTop: 10 }}
              onPress={onCheckServer}
              accessoryLeft={serverStatus ? SuccessIcon : QuestionIcon}
              appearance='ghost'
              size='medium'
            >
            </Button>
          </View>

          {!showInstaller && renderCardUpdate()}
        </View>

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

const styles1 = StyleSheet.create({
  input: {
    flex: 1,
    //margin: 5,
    marginBottom: 10,
    borderRadius: 0
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
