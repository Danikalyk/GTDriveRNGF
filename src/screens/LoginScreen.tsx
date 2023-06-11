import {View} from 'react-native';
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
import {fetchUser, saveTokens} from '../api/auth';
import Loader from '../components/Icons/Loader';
import {GlobalState} from '../store/global/global.state';
import localStorage from '../store/localStorage';

const LoginScreen = ({navigation}: Props) => {
  const context = React.useContext(GlobalState);
  const [login, setLogin] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pending, setPending] = React.useState(false);

  const [isSubmit, setSubmit] = React.useState(false);

  const [secureTextEntry, setSecureTextEntry] = React.useState(true);

  React.useEffect(() => {
    const init = async () => {
      const authInfo = await localStorage.getItem('tokens');
      if (authInfo.login) {
        setLogin(authInfo.login);
      }
      if (authInfo.password) {
        setPassword(authInfo.password);
      }
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

  const SettingIcon = (props): IconElement => (
    <Icon {...props} name="settings-2-outline" />
  );

  const onLogin = async () => {
    setSubmit(true);
    setPending(true);
    if (login && password) {
      await saveTokens({login, password});
      // await fetchUser();
      context.login();
    }

    setPending(false);
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
        <View></View>
        <View>
          <Input
            style={{marginBottom: 10}}
            label="Логин"
            placeholder="login"
            value={login}
            autoFocus
            status={!!(isSubmit && !login) ? 'danger' : 'primary'}
            onChangeText={nextValue => setLogin(nextValue)}
          />

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
      </Layout>
    </SafeAreaView>
  );
};

export default LoginScreen;
