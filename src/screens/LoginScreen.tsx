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
import dayjs from 'dayjs';
import BackgroundGeolocation from 'react-native-background-geolocation';
import DeviceInfo from 'react-native-device-info';
import localStorage from '../store/localStorage';
import Loader from '../components/Icons/Loader';
import NetInfo from '@react-native-community/netinfo';
import * as eva from '@eva-design/eva';
import { ApplicationProvider } from '@ui-kitten/components';
import { default as mapping } from '../styles/mapping';


const logoXml = `
  <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 956.6 538.1" style="enable-background:new 0 0 956.6 538.1;" xml:space="preserve">
    <path fill="#403247" d="M414.1,303.4l14.9-70.6h29.8c18.9,0,28.4,9.6,28.4,28.8c0.1,5.2-0.7,10.4-2.2,15.4c-1.2,3.9-3,7.6-5.3,10.9c-2.3,3-5,5.5-8.2,7.5c-5.1,3.4-10.9,5.8-17,6.9c-3.4,0.6-6.8,1-10.2,1L414.1,303.4z M454.5,246.6h-11.8l-9.1,43.1h10.7c3.8,0.1,7.5-0.7,11-2.3c2.9-1.3,5.5-3.2,7.6-5.7c1.7-2.3,3.1-4.9,4-7.7c1.6-4.3,2.4-8.9,2.4-13.5C469.3,251.3,464.4,246.6,454.5,246.6L454.5,246.6z"/>
    <path fill="#403247" d="M537.7,251.3l-2.5,12.2c-1.3-0.3-2.7-0.4-4-0.4c-2.2,0-4.4,0.3-6.5,0.9c-2.6,0.8-5,2.3-6.9,4.3c-2.5,2.5-4.3,5.6-5.2,9.1c-0.1,0.2-0.5,1.9-1.2,5l-4.5,21h-15.4l10.8-51.2h14.7l-1.5,7.3c4.7-5.6,11.2-8.4,19.5-8.4C535.1,251.1,536,251.2,537.7,251.3z"/>
    <path fill="#403247" d="M534.4,303.4l10.9-51.2h15.3l-10.9,51.2H534.4z M562.1,244.9h-15.3l2.6-12h15.3L562.1,244.9z"/>
    <path fill="#403247" d="M583.5,252.2l3.1,34.6l17.1-34.6h15.8l-29,51.2h-14.8l-8.6-51.2L583.5,252.2z"/>
    <path fill="#403247" d="M653.1,288.6h15.5c-4.5,11.2-13.8,16.7-27.9,16.7c-7.7,0-13.6-1.8-17.9-5.3c-4.6-4.4-7-10.6-6.5-16.9c0-5.8,1.4-11.4,4.1-16.5c2.4-4.8,6.1-8.8,10.7-11.6c4.8-3,10.6-4.5,17.6-4.6c3.6-0.1,7.1,0.4,10.5,1.4c2.6,0.7,5,1.9,7.2,3.5c1.7,1.4,3.1,3.1,4.2,5c1,1.7,1.7,3.6,2.1,5.6c0.3,1.8,0.5,3.7,0.5,5.6c-0.2,3.3-0.8,6.5-1.9,9.6h-39.1c-0.3,1.4-0.4,2.7-0.4,4.1c0,6.7,3.4,10,10.3,10c2.4,0,4.8-0.6,6.8-1.8C650.8,292.3,652.3,290.6,653.1,288.6z M633.8,273h23.4c0.3-1.5,0.4-2.9,0.4-4.4c0-5.3-3.3-8-10-8C640.5,260.6,635.9,264.7,633.8,273z"/>
    <path fill="#E8375C" d="M249.9,248.1l-8.5,39.9h33.1l3.4-16h-15.8l0.9-4.1c1.3-6,3.6-7.9,9.6-7.9h35.5l-4.7,22c-2.9,13.8-12.1,21.3-26.2,21.3h-49.5c-10.6,0-15.9-6.6-13.7-17l6.9-32.4c2.9-13.8,15.5-21.3,26.2-21.3h66.8l-3.3,15.4L249.9,248.1z"/>
    <path fill="#E8375C" d="M409.3,232.8l-3.3,15.4h-27.7l-11.8,55.3h-27.7l7-32.9c2.9-13.8,12.1-21.3,22.8-21.3c0.3,0,0.6-0.2,0.6-0.5s-0.2-0.6-0.5-0.6c0,0-0.1,0-0.2,0h-45.8l3.3-15.4L409.3,232.8z"/>
    <polygon fill="#E8375C" points="743.1,275 714.7,303.4 689.4,303.4 717.8,275 688.2,232.8 713.5,232.8 "/>
  </svg>
`;

const LoginScreen = ({ navigation }: Props) => {
  const context = useContext(GlobalState);
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [isSubmit, setSubmit] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const { currentUser, setUser } = useContext(UserContext);
  const backgroundImage = require('../img/pattern.png');
  const ScreenWidth = Dimensions.get('window').width;

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
    <ApplicationProvider {...eva} customMapping={mapping} theme={eva.light}>
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
              style={styles.input}
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
              accessoryLeft={pending ? Loader : <Icon name="log-in-outline" width={23} height={23} fill="#FFFFFF" />}
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
    </ApplicationProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  layout: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'stretch',
    position: 'relative',
    padding: 20,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap', // Позволяет изображению заполнять пространство
  },
  background: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.3
  },
  logoContainer: {
    alignItems: 'center', // Центрируем логотип по горизонтали
    marginTop: '40%',
  },
  logo: {
    // styles for logo image
  },
  formContainer: {
    // styles for form container
  },
  spinnerContainer: {
    position: 'absolute',
    zIndex: 999,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  select: {
    marginBottom: 10,
  },
  input: {
    marginBottom: 10,
    borderRadius: 0
  },
  buttonContainer: {},
  settingsButton: {
    textColor: "#3E3346",
  },
  settingsButtonContainer: {
    position: 'absolute', // Позволяет разместить кнопку в правом верхнем углу
    top: 0, // Отступ сверху
    right: 0, // Отступ справа
    zIndex: 1, // Убедитесь, что кнопка находится поверх других элементов
  },
});

export default LoginScreen;
