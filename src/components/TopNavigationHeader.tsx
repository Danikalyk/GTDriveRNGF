import React from 'react';
import {
  Icon,
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';
import {TouchableOpacity} from 'react-native-gesture-handler';
import { DrawerActions } from '@react-navigation/native';

type Props = {};

const TopNavigationHeader = ({navigation}: Props) => {
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
        title="Drive"
        // subtitle="Subtitle"
        // accessoryLeft={renderBackAction}
        accessoryRight={renderRightActions}
      />

      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <Text>111</Text>
      </TouchableOpacity>
    </Layout>
  );
};

export default TopNavigationHeader;
