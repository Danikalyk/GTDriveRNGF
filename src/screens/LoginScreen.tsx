import React, { useContext, useState, useEffect } from 'react';
import { View, Image, StyleSheet, Alert, Dimensions } from 'react-native';
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
import Loader from '../components/Icons/Loader';
import NetInfo from '@react-native-community/netinfo';
import * as eva from '@eva-design/eva';
import { ApplicationProvider } from '@ui-kitten/components';
import { default as mapping } from '../styles/mapping';

const LoginScreen = ({ navigation }: Props) => {
  const context = useContext(GlobalState);
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [isSubmit, setSubmit] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const { currentUser, setUser } = useContext(UserContext);
  const backgroundImage = require('../img/pattern.png');

  useEffect(() => {
    const init = async () => {
      const authInfo = await localStorage.getItem('tokens');

      setUserID(authInfo?.id || '');
      setPassword(authInfo?.password || '');
    };

    init();
  }, []);

  const toggleSecureEntry = (): void => {
    setSecureTextEntry(!secureTextEntry);
  };

  const renderIcon = (props): React.ReactElement => (
    <TouchableWithoutFeedback onPress={toggleSecureEntry}>
      <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  );

  const onLogin = async () => {
    setSubmit(true);
    setPending(true);

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const LoginKey = await localStorage.getItem('LoginKey');

      if (LoginKey) {
        const { user, error } = LoginKey;
        if (!error && user && LoginKey.userUID) {
          console.log('LoginKey', LoginKey);
          if (user?.code === userID && user?.password === password) {
            setUser(LoginKey.userUID);
            context.login();
            setPending(false);
          }
        } else {
          Alert.alert(LoginKey?.error || LoginKey.message || 'Error');
          setPending(false);
          return;
        }
      }
    } else {
      const jwtToken = await getDevTokens({ isRefresh: true });
      await saveTokens({ id: userID, password, jwtToken });

      let deviceInfo = await BackgroundGeolocation.getDeviceInfo();
      let version = DeviceInfo.getVersion();
      let instanceId = await DeviceInfo.getInstanceId();

      const params = {
        user: {
          date: dayjs().format(),
          id: userID,
          password: password,
        },
        device: {
          ID: instanceId,
          ...deviceInfo,
          version_gtdrive: version,
        },
      };

      try {
        const userAnswer = await userAuth(params);

        if (!userAnswer.error && userAnswer?.userUID) {
          setUser(userAnswer.userUID);

          await localStorage.setItem('LoginKey', userAnswer || '');

          context.login();
          //context.enableGeo();
          setPending(false);
        } else {
          Alert.alert(userAnswer.error || userAnswer.message || 'Error');

          setPending(false);
          return;
        }
      } catch (error) {
        console.error(error);
        setPending(false);
      }
    }
  };

  const gotoSettings = () => {
    navigate('SettingsScreen');
  };

  const handleTextChange = text => {
    const formattedText = text.replace(/[^0-9]/g, '');
    setUserID(formattedText);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Layout style={styles.layout}>
        {pending && (
          <View style={styles.spinnerContainer}>
            <Spinner size="giant" status='basic' />
          </View>
        )}

        <View style={styles.backgroundContainer}>
          <Image source={backgroundImage} style={styles.background} />
        </View>

        <Layout style={{ justifyContent: 'center', alignItems: 'center', position: 'relative', backgroundColor: 'transparent' }}>
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

        <View style={styles.formContainer}>
          <Input
            style={styles.loginInput}
            value={userID}
            size='medium'
            label="ID водителя"
            placeholder=""
            onChangeText={handleTextChange}
            keyboardType="numeric"
          />

          <Input
            style={styles.input}
            value={password}
            label="Пароль"
            size='medium'
            placeholder=""
            //status={!!(isSubmit && !password) ? 'danger' : 'primary'}
            accessoryRight={renderIcon}
            secureTextEntry={secureTextEntry}
            onChangeText={nextValue => setPassword(nextValue)}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            onPress={onLogin}
            //disabled={pending}
            appearance="filled"
            status='basic'
            accessoryLeft={<Icon name="log-in-outline" width={23} height={23} fill="#FFFFFF" />}
          >
            Войти
          </Button>

          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <Text appearance="hint" style={{ fontSize: 10 }}>
              ver. {appVersion}
            </Text>
          </View>
        </View>
      </Layout>
    </SafeAreaView>
  );
};

export default LoginScreen;
