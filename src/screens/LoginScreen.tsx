import {View} from 'react-native';
import React, {useContext, useEffect} from 'react';
import {
  Button,
  Icon,
  Input,
  Layout,
  TopNavigation,
  IndexPath,
  Select,
  SelectItem,
  Spinner,
} from '@ui-kitten/components';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TouchableWithoutFeedback} from '@ui-kitten/components/devsupport';
import {navigate} from '../RootNavigation';
import {saveTokens, userAuth} from '../api/auth';
import Loader from '../components/Icons/Loader';
import {GlobalState} from '../store/global/global.state';
import localStorage from '../store/localStorage';
import {UserContext} from '../store/user/UserProvider';
import {UserListItem} from '../types';
import BackgroundGeolocation from 'react-native-background-geolocation';
import dayjs from 'dayjs';
import DeviceInfo from 'react-native-device-info';
import findIndex from 'lodash/findIndex';

const LoginScreen = ({navigation}: Props) => {
  const context = React.useContext(GlobalState);
  const [login, setLogin] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pending, setPending] = React.useState(true);

  const [isSubmit, setSubmit] = React.useState(false);

  const [secureTextEntry, setSecureTextEntry] = React.useState(true);

  const {usersList, setUser} = useContext(UserContext);

  const [selectedIndex, setSelectedIndex] = React.useState<
    IndexPath | IndexPath[]
  >(new IndexPath(0));

  React.useEffect(() => {
    const init = async () => {
      const authInfo = await localStorage.getItem('tokens');

      if (authInfo?.login) {
        setLogin(authInfo.login);

        if (usersList && usersList[0]) {
          const index =
            findIndex(usersList, item => item.user === authInfo?.login) || 0;
          setSelectedIndex(new IndexPath(index));
        }
      }
      if (authInfo?.password) {
        setPassword(authInfo.password);
      }
    };

    init();
  }, [usersList]);

  const toggleSecureEntry = (): void => {
    setSecureTextEntry(!secureTextEntry);
  };

  const renderIcon = (props): React.ReactElement => (
    <TouchableWithoutFeedback onPress={toggleSecureEntry}>
      <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  );

  useEffect(() => {
    if (!!usersList && usersList[0]) {
      setPending(false);
    }
  }, [usersList]);

  const SettingIcon = (props): IconElement => (
    <Icon {...props} name="settings-2-outline" />
  );

  const onLogin = async () => {
    setSubmit(true);
    setPending(true);

    await saveTokens({login, password});

    let deviceInfo = await BackgroundGeolocation.getDeviceInfo();

    let version = DeviceInfo.getVersion();
    let instanceId = await DeviceInfo.getInstanceId();

    const params = {
      user: {
        date: dayjs().format(),
      },
      device: {
        ID: instanceId,
        ...deviceInfo,
        version_gtdrive: version,
      },
    };

    if (usersList[selectedIndex?.row]?.uid) {
      params.user.uid = usersList[selectedIndex?.row]?.uid;
    }

    try {
      const user = await userAuth(params);

      if (user.name === 'AxiosError') {
        return;
      }
      setUser(usersList[selectedIndex?.row]);

      context.login();
      context.enableGeo();
      setPending(false);
    } catch (error) {
      console.error(error);
      setPending(false);
    }
  };

  const gotoSettings = () => {
    navigate('SettingsScreen');
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <TopNavigation title="Вход" alignment="center" />

      <Layout
        style={{
          flex: 1,
          justifyContent: 'space-between',
          alignItems: 'stretch',
          padding: 20,
        }}>
        <>
          <View></View>
          <View>
            {pending && (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                }}>
                <Spinner />
              </View>
            )}
            <Select
              style={{marginBottom: 10}}
              placeholder="User"
              value={usersList?.[selectedIndex?.row]?.user}
              selectedIndex={selectedIndex}
              onSelect={index => {
                setSelectedIndex(index);
                setLogin(usersList?.[index.row]?.user);
              }}>
              {usersList &&
                usersList.map((item: UserListItem) => (
                  <SelectItem title={item.user} key={item.uid} />
                ))}
            </Select>

            <Input
              style={{marginBottom: 10}}
              value={password}
              label="Пароль"
              placeholder="password"
              status={!!(isSubmit && !password) ? 'danger' : 'primary'}
              accessoryRight={renderIcon}
              secureTextEntry={secureTextEntry}
              onChangeText={nextValue => setPassword(nextValue)}
            />
          </View>
          <View>
            <Button
              style={{marginBottom: 20}}
              onPress={gotoSettings}
              accessoryLeft={SettingIcon}
              appearance="outline">
              Настройки
            </Button>
            <Button
              onPress={onLogin}
              disabled={pending}
              accessoryLeft={pending ? Loader : false}>
              Войти
            </Button>
          </View>
        </>
      </Layout>
    </SafeAreaView>
  );
};

export default LoginScreen;
