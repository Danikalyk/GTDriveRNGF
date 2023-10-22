import React from 'react';
import {Drawer, DrawerItem, IndexPath} from '@ui-kitten/components';

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
    <Drawer
    
    onSelect={onItemSelect}>
    
      <DrawerItem key={1} title={'Home'} />
      <DrawerItem key={2} title={'Chats'} />
      <DrawerItem key={3} title={'Settings'} />
      
    </Drawer>
  );
};
