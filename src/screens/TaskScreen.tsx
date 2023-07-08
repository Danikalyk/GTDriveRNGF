import {
  Button,
  Divider,
  Layout,
  List,
  ListItem,
  Text,
  TopNavigation,
} from '@ui-kitten/components';
import React from 'react';
import {RefreshControl, ScrollView} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import useSWR from 'swr';
import {StyleSheet} from 'react-native';
import {getRoute, getRoutes} from '../api/routes';
import {RouterListItem} from '../types';

type Props = {};

const RouteScreen = (props: Props) => {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const uid = props?.route?.params?.uid;

  const {
    data: route,
    isLoading,
    error,
  } = useSWR(`/routes/${uid}`, () => getRoute(uid));

  const routeItem = route?.data;

  if (error || !routeItem) {
    return null;
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      <Layout style={{flex: 1, padding: 10}}>
        <Text category="h6" style={{flex: 1, marginBottom: 10}}>
          {routeItem?.name}
        </Text>

        <Text category="s1" style={{flex: 1}}>
          {routeItem?.description_full}
        </Text>
      </Layout>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,

    minHeight: 180,
  },
});

export default RouteScreen;
