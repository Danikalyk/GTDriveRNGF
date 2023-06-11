import React, {useContext, useEffect} from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import * as eva from '@eva-design/eva';
import {ApplicationProvider} from '@ui-kitten/components';

import LoginScreen from '../screens/LoginScreen';
import {GlobalState} from '../store/global/global.state';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import {navigationRef} from '../RootNavigation';

const Stack = createNativeStackNavigator();

type Props = {};

const MainNavigation = (props: Props) => {
  const {theme, isLoggedIn} = useContext(GlobalState);


  
  //   if (state.isLoading) {
  //     // We haven't finished checking for the token yet
  //     return <SplashScreen />;
  //   }
  return (
    <ApplicationProvider {...eva} theme={eva[theme]}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {isLoggedIn ? (
            <Stack.Screen name="Home" component={HomeScreen} />
          ) : (
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
          )}

          <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ApplicationProvider>
  );
};

export default MainNavigation;
