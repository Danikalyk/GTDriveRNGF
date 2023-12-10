import React, {useContext, useEffect} from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import * as eva from '@eva-design/eva';
import {ApplicationProvider, Drawer, IndexPath} from '@ui-kitten/components';

import LoginScreen from '../screens/LoginScreen';
import {GlobalState} from '../store/global/global.state';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ChatsScreen from '../screens/ChatsScreen';
import ChatScreen from '../screens/ChatScreen';
import {navigationRef} from '../RootNavigation';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {HomeDrawer} from './Drawer';
import TopNavigationHeader from './TopNavigationHeader';

import RouteScreen from '../screens/RouteScreen';
import TaskScreen from '../screens/TaskScreen';

const Stack = createNativeStackNavigator();

type Props = {};

const {Navigator, Screen} = createDrawerNavigator();

const RoutesNavigation = () => (
  <Stack.Navigator initialRouteName="Home">
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={{
        header: props => <TopNavigationHeader {...props} />,
        title: 'Маршруты',
      }}
    />
    <Stack.Screen
      name="RouteScreen"
      component={RouteScreen}
      options={{
        header: props => <TopNavigationHeader {...props} isBack />,
        title: 'Текущий маршрут',
      }}
    />
    <Stack.Screen
      name="TaskScreen"
      component={TaskScreen}
      options={{
        header: props => <TopNavigationHeader {...props} isBack />,
        title: 'Карточка контрагента',
      }}
    />
  </Stack.Navigator>
);

const ChatsNavigation = () => (
  <Stack.Navigator initialRouteName="Home">
    {/* <Screen
      name="Chats"
      component={ChatsScreen}
      options={{
        header: props => <TopNavigationHeader {...props} />,

        title: 'Чаты',
      }}
    /> */}

    <Screen
      name="ChatScreen"
      component={ChatScreen}
      options={{
        header: props => <TopNavigationHeader {...props} />,

        title: 'Чат',
      }}
    />
  </Stack.Navigator>
);

export const DrawerNavigator = () => (
  <Navigator
    initialRouteName={'Home'}
    useLegacyImplementation={false}
    id="LeftDrawer"
    drawerContent={props => <HomeDrawer {...props} />}
    drawerPosition="left"
    swipeEnabled
    swipeEdgeWidth={50}>
    <Screen
      name="RoutesNavigation"
      component={RoutesNavigation}
      options={{
        headerShown: false,
      }}
    />

    <Screen
      name="ChatsNavigation"
      component={ChatsNavigation}
      options={{
        headerShown: false,
      }}
    />

    <Screen
      name="SettingsScreen"
      component={SettingsScreen}
      options={{
        header: props => <TopNavigationHeader {...props} />,
      }}
    />
  </Navigator>
);

const MainNavigation = (props: Props) => {
  const {isLoggedIn} = useContext(GlobalState);

  //   if (state.isLoading) {
  //     // We haven't finished checking for the token yet
  //     return <SplashScreen />;
  //   }

  return (
    <NavigationContainer ref={navigationRef}>
      {isLoggedIn ? (
        <DrawerNavigator />
      ) : (
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              title: 'Sign in',
              // When logging out, a pop animation feels intuitive
              // You can remove this if you want the default 'push' animation
              animationTypeForReplace: isLoggedIn ? 'pop' : 'push',
            }}
          />

          <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default MainNavigation;
