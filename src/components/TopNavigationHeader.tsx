import { DrawerActions } from '@react-navigation/native';
import { Icon, Layout, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';

type Props = {
  navigation: any;
  options: any;
  isBack?: boolean;
};

const TopNavigationHeader = ({ navigation, options, isBack }: Props) => {
  const [title, setTitle] = useState(options?.title || 'GTDrive');

  useEffect(() => {
    setTitle(options?.title || 'GTDrive');
  }, [options?.title]);

  const renderBackAction = () => (
    <TopNavigationAction
      icon={(props) => <Icon name="arrow-back" {...props} fill="#FFFFFF" />}
      onPress={navigation.goBack}
    />
  );

  const renderRightActions = () => (
    <TopNavigationAction
      icon={(props) => <Icon name="menu-outline" {...props} fill="#FFFFFF" />}
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
    />
  );

  return (
    <Layout>
      <TopNavigation
        alignment="center"
        title={() => <Text style={{ color: '#FFFFFF' }}>{title}</Text>}
        accessoryLeft={isBack ? renderBackAction() : renderRightActions()}
        style={{ backgroundColor: "#3E3346" }}
      />
    </Layout>
  );
};

export default TopNavigationHeader;
