import React, { useContext, useState, useEffect } from 'react';
import { View, Image, StyleSheet, Alert } from 'react-native';
import { Button, Icon, Input, Layout, Spinner, Text } from '@ui-kitten/components';
import { TouchableWithoutFeedback } from '@ui-kitten/components/devsupport';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveTokens, userAuth } from '../api/auth';
import { navigate } from '../RootNavigation';
import { getDevTokens } from '../api/auth';
import { GlobalState } from '../store/global/global.state';
import {UserContext} from '../store/user/UserProvider';
import dayjs from 'dayjs';
import BackgroundGeolocation from 'react-native-background-geolocation';
import DeviceInfo from 'react-native-device-info';
import localStorage from '../store/localStorage';
import Loader from '../components/Icons/Loader';
import { appVersion } from '../version';


const LoginScreen = ({ navigation }: Props) => {
  const context = useContext(GlobalState);
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(true);
  const [isSubmit, setSubmit] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const {currentUser, setUser} = useContext(UserContext);

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

  useEffect(() => {
    setPending(false);
  });

  const onLogin = async () => {
    setSubmit(true);
    setPending(true);

    const jwtToken = await getDevTokens({ isRefresh: true });
    await saveTokens({ id: userID, password, jwtToken });

    let deviceInfo = await BackgroundGeolocation.getDeviceInfo();
    let version = DeviceInfo.getVersion();
    let instanceId = await DeviceInfo.getInstanceId();

    const params = {
      user: {
        date: dayjs().format(),
        id: userID,
        password: password
      },
      device: {
        ID: instanceId,
        ...deviceInfo,
        version_gtdrive: version,
      },
    };

    try {
      const userAnswer = await userAuth(params);
      if (!userAnswer.error) {
        setUser(userAnswer.userUID);

        context.login();
        //context.enableGeo(); 
        setPending(false);
      } else {
        Alert.alert(userAnswer.error);
        setPending(false);
        return;
      }
    } catch (error) {
      console.error(error);
      setPending(false);
    }
  };

  const gotoSettings = () => {
    navigate('SettingsScreen');
  };

  const handleTextChange = (text) => {
    const formattedText = text.replace(/[^0-9]/g, '');
    setUserID(formattedText);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Layout style={styles.layout}>
        <View style={styles.logoContainer}>
          <Image source={require('../logo.png')} style={styles.logo} />
        </View>
        <View style={styles.formContainer}>
          {pending && (
            <View style={styles.spinnerContainer}>
              <Spinner />
            </View>
          )}

          <Input
            style={styles.input}
            value={userID}
            label="ID водителя"
            placeholder="Введите ID водителя"
            onChangeText={handleTextChange}
            keyboardType="numeric"
          />

          <Input
            style={styles.input}
            value={password}
            label="Пароль"
            placeholder="Введите пароль"
            status={!!(isSubmit && !password) ? 'danger' : 'primary'}
            accessoryRight={renderIcon}
            secureTextEntry={secureTextEntry}
            onChangeText={nextValue => setPassword(nextValue)}
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            style={styles.settingsButton}
            onPress={gotoSettings}
            accessoryLeft={<Icon name="settings-2-outline" />}
            appearance="outline"
          >
            Настройки
          </Button>
          <Button
            onPress={onLogin}
            disabled={pending}
            accessoryLeft={pending ? Loader : false}
          >
            Войти
          </Button>
          
          <Text appearance='hint' style={{fontSize: 10}}>{appVersion}</Text>
        </View>
      </Layout>
    </SafeAreaView>
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
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    // styles for logo image
  },
  formContainer: {
    // styles for form container
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  select: {
    marginBottom: 10,
  },
  input: {
    marginBottom: 10,
  },
  buttonContainer: {
    
  },
  settingsButton: {
    marginBottom: 20,
  },
});

export default LoginScreen;