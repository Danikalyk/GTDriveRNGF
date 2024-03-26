import { Divider, Layout, List, ListItem, Text, Button, TabBar, Tab } from '@ui-kitten/components';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import useSWR from 'swr';
import { getRoute } from '../api/routes';
import { RouterListItem } from '../types';
import Loader from '../components/Icons/Loader';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { WebView } from 'react-native-webview';
import map_scripts from '../map_scripts';

type Props = {};

const RouteScreen = (props: Props) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [pending, setPending] = React.useState(true);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    setPending(false);
  }, []);

  const uid = props?.route?.params?.uid;

  const {
    data: route,
    isLoading,
    error,
  } = useSWR(`/route/${uid}`, () => getRoute(uid));

  const routeItem = route;

  if (error || !routeItem) {
    return null;
  }

  const renderItem = ({ item, index }): React.ReactElement => {
    return (
      <ListItem
        style={{ padding: 20 }}
        title={item?.client_name}
        description={item?.address}
        accessoryLeft={() => renderItemLeft(item)}
        onPress={e => props.navigation.navigate('TaskScreen', { ...item })}
      />
    );
  };

  const renderItemLeft = (item: RouterListItem) => {
    return (
      <Layout>
        <Layout>
          <Text category="s1" style={{ textAlign: 'center' }}>
            {item?.time}
          </Text>
        </Layout>
        <Layout>
          <Text category="c2" style={{ textAlign: 'center' }}>
            {item?.date}
          </Text>
        </Layout>
      </Layout>
    );
  };

  const getThisRoute = async () => {


  };

  // Табы
  const { Navigator, Screen } = createMaterialTopTabNavigator();

  const RouteScreen = () => (
    <SafeAreaView style={{ flex: 1 }}>
      <List
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.list}
        data={routeItem?.points}
        renderItem={renderItem}
        ItemSeparatorComponent={Divider}
        ListHeaderComponent={
          <Layout style={{ flex: 1, padding: 10 }}>
            <Text category="h6" style={{ flex: 1, marginBottom: 10 }}>
              {routeItem?.name}
            </Text>

            <Text category="s1" style={{ flex: 1 }}>
              {routeItem?.description_full}
            </Text>
          </Layout>
        }
      />
      <View>
        <Button
          onPress={getThisRoute}
          disabled={pending}
          accessoryLeft={pending ? Loader : false}>
          НачатьМаршрут
        </Button>
      </View>
    </SafeAreaView>
  );

  const MapScreen = () => (
    <SafeAreaView style={styles.Container}>
      <WebView
        useRef={'Map_Ref'}
        source={{ html: map_scripts }}
        style={styles.Webview}
      />
    </SafeAreaView>
  );

  const TopTabBar = ({ navigation, state }) => (
    <TabBar
      selectedIndex={state.index}
      onSelect={index => navigation.navigate(state.routeNames[index])}>
      <Tab title='Маршрут' />
      <Tab title='Карта' />
    </TabBar>
  );

  const TabNavigator = () => (
    <Navigator tabBar={props => <TopTabBar {...props} />}>
      <Screen name='Route' component={RouteScreen} />
      <Screen name='Map' component={MapScreen} />
    </Navigator>
  );



  return (
    <NavigationContainer independent={true}>
        <TabNavigator />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,

    minHeight: 180,
  },
  Container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'grey',
  },
  Webview: {
    flex: 2,
  },
});

export default RouteScreen;
