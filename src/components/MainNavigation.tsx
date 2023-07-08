import React, {useContext, useEffect} from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import * as eva from '@eva-design/eva';
import {ApplicationProvider, Drawer, IndexPath} from '@ui-kitten/components';

import LoginScreen from '../screens/LoginScreen';
import {GlobalState} from '../store/global/global.state';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import {navigationRef} from '../RootNavigation';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {HomeDrawer} from './Drawer';
import TopNavigationHeader from './TopNavigationHeader';
import {Layout} from 'react-native-reanimated';
import RouteScreen from '../screens/RouteScreen';

const Stack = createNativeStackNavigator();

type Props = {};

const {Navigator, Screen} = createDrawerNavigator();

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
      name="Home"
      component={HomeScreen}
      options={{
        header: props => <TopNavigationHeader {...props} />,
        title: 'Маршруты',
      }}
    />
    <Screen
      name="RouteScreen"
      component={RouteScreen}
      options={{
        header: props => <TopNavigationHeader {...props} isBack />,
        title: 'Текущий маршрут',
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
