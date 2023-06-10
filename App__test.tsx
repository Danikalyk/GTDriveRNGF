import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';

import {
  Drawer,
  DrawerItem,
  Layout,
  Text,
  IndexPath,
  ApplicationProvider,
} from '@ui-kitten/components';

import * as eva from '@eva-design/eva';
import {ThemeContext} from './src/context/ThemeContext';

const {Navigator, Screen} = createDrawerNavigator();

const DrawerContent = ({navigation, state}) => (
  <Drawer
    selectedIndex={new IndexPath(state.index)}
    onSelect={index => navigation.navigate(state.routeNames[index.row])}>
    <DrawerItem title="Users" />
    <DrawerItem title="Orders" />
  </Drawer>
);

export const DrawerNavigator = () => (
  <Navigator drawerContent={props => <DrawerContent {...props} />}>
    <Screen
      name="Users"
      component={
        <Layout
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>Welcome to UI Kitten</Text>
        </Layout>
      }
    />
    <Screen
      name="Orders"
      component={
        <Layout
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>Welcome to UI Kitten222</Text>
        </Layout>
      }
    />
  </Navigator>
);

export default function App() {
  const [theme, setTheme] = React.useState('light');

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  return (
    <>
      <ThemeContext.Provider value={{theme, toggleTheme}}>
        <ApplicationProvider {...eva} theme={eva[theme]}>
          <NavigationContainer>
            <DrawerNavigator />
          </NavigationContainer>
        </ApplicationProvider>
      </ThemeContext.Provider>
    </>
  );
}
