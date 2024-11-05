//-- 20241021 
import React, { useContext, useState, useEffect } from 'react';
import { View, Image, Alert } from 'react-native';
import { Button, Icon, Input, Layout, Spinner, Text } from '@ui-kitten/components';
import { TouchableWithoutFeedback } from '@ui-kitten/components/devsupport';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveTokens, userAuth, getDevTokens } from '../api/auth';
import { navigate } from '../RootNavigation';
import { GlobalState } from '../store/global/global.state';
import { UserContext } from '../store/user/UserProvider';
import { appVersion } from '../version';
import { LogoSVG } from '../img/logo';
import { styles } from '../styles';
import dayjs from 'dayjs';
import BackgroundGeolocation from 'react-native-background-geolocation';
import DeviceInfo from 'react-native-device-info';
import localStorage from '../store/localStorage';
import NetInfo from '@react-native-community/netinfo';

const LoginScreen = ({ navigation }) => {
  const context = useContext(GlobalState);
  const { currentUser, setUser } = useContext(UserContext);
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const backgroundImage = require('../img/pattern.png');

  // Инициализация данных пользователя из локального хранилища
  useEffect(() => {
    const init = async () => {
      const authInfo = await localStorage.getItem('tokens');
      setUserID(authInfo?.id || '');
      setPassword(authInfo?.password || '');
    };
    init();
  }, []);

  // Переключение видимости пароля
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  // Иконка для переключения видимости пароля
  const renderIcon = (props) => (
    <TouchableWithoutFeedback onPress={toggleSecureEntry}>
      <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  );

  // Обработка входа в систему
  const onLogin = async () => {
    setPending(true);

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      // Оффлайн режим: проверка сохраненного ключа входа
      const LoginKey = await localStorage.getItem('LoginKey');
      if (LoginKey && LoginKey.user?.code === userID && LoginKey.user?.password === password) {
        setUser(LoginKey.userUID);
        context.login();
      } else {
        Alert.alert(LoginKey?.error || 'Ошибка');
      }
    } else {
      // Онлайн режим: аутентификация через сервер
      try {
        const jwtToken = await getDevTokens({ isRefresh: true });
        await saveTokens({ id: userID, password, jwtToken });

        const deviceInfo = await BackgroundGeolocation.getDeviceInfo();
        const version = DeviceInfo.getVersion();
        const instanceId = await DeviceInfo.getInstanceId();

        const params = {
          user: { date: dayjs().format(), id: userID, password },
          device: { ID: instanceId, ...deviceInfo, version_gtdrive: version },
        };

        const userAnswer = await userAuth(params);
             
        if (userAnswer?.userUID !== '00000000-0000-0000-0000-000000000000') {
          setUser(userAnswer.userUID);
          await localStorage.setItem('LoginKey', userAnswer);
          context.login();
        } else {
          Alert.alert(userAnswer.error || 'Ошибка');
        }
      } catch (error) {
        console.error(error);
      }
    }
    setPending(false);
  };

  // Переход к настройкам
  const gotoSettings = () => {
    navigate('SettingsScreen');
  };

  // Обработка изменения текста в поле ID
  const handleTextChange = (text) => {
    setUserID(text.replace(/[^0-9]/g, ''));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Layout style={[styles.layout, {backgroundColor: "transparent"}]} >
        {pending && (
          <View style={styles.spinnerContainer}>
            <Spinner size="giant" status='basic' />
          </View>
        )}

        <View style={styles.backgroundContainer}>
          <Image source={backgroundImage} style={styles.background} />
        </View>

        <Layout style={[styles.centeredLayout, {backgroundColor: "transparent"}]}>
          <View style={styles.settingsButtonContainer}>
            <Button
              style={styles.settingsButton}
              onPress={gotoSettings}
              accessoryLeft={<Icon name="settings-2-outline" fill="#3E3346" />}
              appearance="ghost"
            />
          </View>

          <View style={styles.logoContainer}>
            <LogoSVG />
          </View>
        </Layout>

        <View style={{}}>
          <Input
            style={styles.loginInput}
            value={userID}
            size='medium'
            label="ID водителя"
            onChangeText={handleTextChange}
            keyboardType="numeric"
          />

          <Input
            style={styles.loginInput}
            value={password}
            label="Пароль"
            size='medium'
            accessoryRight={renderIcon}
            secureTextEntry={secureTextEntry}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            onPress={onLogin}
            appearance="filled"
            status='basic'
            accessoryLeft={<Icon name="log-in-outline" width={23} height={23} fill="#FFFFFF" />}
          >
            Войти
          </Button>

          <View style={[styles.versionContainer, {alignItems: 'center'}]}>
            <Text appearance="hint" style={styles.versionText}>
              ver. {appVersion}
            </Text>
          </View>
        </View>
      </Layout>
    </SafeAreaView>
  );
};

export default LoginScreen;