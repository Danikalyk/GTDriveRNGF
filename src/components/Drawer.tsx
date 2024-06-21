import {Drawer, DrawerItem, IndexPath} from '@ui-kitten/components';
import React from 'react';

export const HomeDrawer = (props: any) => {
  const onItemSelect = (index: IndexPath): void => {
    const selectedTabRoute: string = props.state.routeNames[index.row];
    props.navigation.navigate(selectedTabRoute);
    props.navigation.closeDrawer();
  };

  const createDrawerItemForRoute = (route, index: number) => {
    const {options} = props.descriptors[route.key];
    return (
      <DrawerItem
        key={index}
        title={route.name}
        accessoryLeft={options.drawerIcon}
      />
    );
  };

  return (
    <Drawer onSelect={onItemSelect}>
      <DrawerItem key={1} title={'Список маршрутов'} />
      <DrawerItem key={2} title={'Карта'} />
      <DrawerItem key={3} title={'Настройки'} />
    </Drawer>
  );
};
