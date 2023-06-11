import React from 'react';
import {Drawer, DrawerItem} from '@ui-kitten/components';

export const HomeDrawer = props => {
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
    <Drawer>
      <DrawerItem key={1} title={'Home'} />
    </Drawer>
  );
};
