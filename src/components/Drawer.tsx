import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Drawer, DrawerItem, IndexPath, Icon, Button } from '@ui-kitten/components';
import { UserContext } from '../store/user/UserProvider';
import { appVersion } from '../version';
import { GlobalState } from '../store/global/global.state';

const renderIcon = (name) => (style) => (
  <Icon {...style} name={name} />
);

export const HomeDrawer = (props: any) => {
  const { logoutUser } = useContext(UserContext);
  const [selectedIndex, setSelectedIndex] = useState(new IndexPath(0));
  const { showInstaller, updateData, downloadAndInstallAPK } = useContext(GlobalState);

  const onItemSelect = (index: IndexPath): void => {
    //-- Обрати внимание! Если "обновить приложение"!
    if (index.row == 2) {
      downloadAndInstallAPK();

      return;
    }

    setSelectedIndex(index); // Исправлено: теперь состояние обновляется правильно
    const selectedTabRoute: string = props.state.routeNames[index.row];
    props.navigation.navigate(selectedTabRoute);
    props.navigation.closeDrawer();
  };

  {/*<DrawerItem 
    key={2} 
    title={'Карта'} 
    accessoryLeft={renderIcon('map-outline')}
  />*/}

  return (
    <View style={[styles.container, {}]}>
      <Drawer selectedIndex={selectedIndex}
        onSelect={onItemSelect}
        style={{}}
      >
        <DrawerItem
          key={1}
          title={'Список маршрутов'}
          accessoryLeft={renderIcon('list-outline')}
        />
        <DrawerItem
          key={2}
          title={'Настройки'}
          accessoryLeft={renderIcon('settings-2-outline')}
        />
        {!showInstaller && (<DrawerItem
          key={3}
          title={'Обновить приложение'}
          accessoryLeft={renderIcon('download-outline')}
        />)}
      </Drawer>

      <View style={[styles.bottomSection, { flex: 1 }]}>
        <Button
          accessoryLeft={renderIcon('log-out-outline')}
          size='small'
          appearance="filled"
          status='basic'
          style={{}}
          onPress={() => {
            logoutUser();
            props.navigation.navigate('Login');
          }}
        >
          Выйти
        </Button>

        <View>
          <Text style={styles.versionText}>ver. {appVersion}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  bottomSection: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  versionText: {
    fontSize: 10,
    color: '#888',
    marginTop: 8,
  },
});