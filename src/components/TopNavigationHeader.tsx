import React from 'react';
import {
  Icon,
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {DrawerActions} from '@react-navigation/native';
import {TouchableWebElement} from '@ui-kitten/components/devsupport';

type Props = {
  navigation: any;
  options: any;
};

const TopNavigationHeader = ({navigation, route, options, isBack}: Props) => {
  const renderBackAction = (): TouchableWebElement => (
    <TopNavigationAction
      icon={props => <Icon name="arrow-back" {...props} />}
      onPress={() => {
        navigation.goBack();
      }}
    />
  );

  const renderRightActions = (): TouchableWebElement => (
    <TopNavigationAction
      icon={props => <Icon name="menu-outline" {...props} />}
      onPress={() => {
        navigation.dispatch(DrawerActions.openDrawer());
      }}
    />
  );

  return (
    <Layout style={{}} level="1">
      <TopNavigation
        alignment="center"
        title={options?.title || 'GTDrive'}
        // subtitle="Subtitle"
        // accessoryLeft={renderBackAction}
        accessoryLeft={isBack ? renderBackAction : renderRightActions}
      />

      <TouchableOpacity
        onPress={() => navigation.openDrawer()}></TouchableOpacity>
    </Layout>
  );
};

export default TopNavigationHeader;
