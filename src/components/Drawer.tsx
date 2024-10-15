import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Drawer, DrawerItem, IndexPath, Icon, Button } from '@ui-kitten/components';
import { UserContext } from '../store/user/UserProvider';
import { appVersion } from '../version';

const renderIcon = (name) => (style) => (
  <Icon {...style} name={name} />
);

export const HomeDrawer = (props: any) => {
  const { logoutUser } = useContext(UserContext);
  const [selectedIndex, setSelectedIndex] = useState(new IndexPath(0));

  const onItemSelect = (index: IndexPath): void => {
    setSelectedIndex(index); // Исправлено: теперь состояние обновляется правильно
    const selectedTabRoute: string = props.state.routeNames[index.row];
    props.navigation.navigate(selectedTabRoute);
    props.navigation.closeDrawer();
  };

  return (
    <View style={styles.container}>
      <Drawer selectedIndex={selectedIndex} onSelect={onItemSelect} style={{backgroundColor: "#DEE4ED"}}>
        <DrawerItem 
          key={1} 
          title={'Список маршрутов'} 
          accessoryLeft={renderIcon('list-outline')}
        />
        <DrawerItem 
          key={2} 
          title={'Карта'} 
          accessoryLeft={renderIcon('map-outline')}
        />
        <DrawerItem 
          key={3} 
          title={'Настройки'} 
          accessoryLeft={renderIcon('settings-2-outline')} 
        />
      </Drawer>

      <View style={styles.bottomSection}>
        <Button
          accessoryLeft={renderIcon('log-out-outline')}
          size='small'
          appearance="filled"
              status='basic'
          onPress={() => {
            logoutUser();
            props.navigation.navigate('Login');
          }}
        >
          Выйти
        </Button>
        <Text style={styles.versionText}>ver. {appVersion}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DEE4ED"
  },
  bottomSection: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: "#DEE4ED"
  },
  versionText: {
    fontSize: 10,
    color: '#888',
    marginTop: 8,
  },
});