import {DrawerActions} from '@react-navigation/native';
import {
  Icon,
  Layout,
  TopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';
import {TouchableWebElement} from '@ui-kitten/components/devsupport';
import React from 'react';
import {TouchableOpacity} from 'react-native-gesture-handler';

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
