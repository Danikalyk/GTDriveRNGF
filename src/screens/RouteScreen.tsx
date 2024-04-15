import { Divider, Layout, List, ListItem, Text, Button, TabBar, Tab, CheckBox, Card, Toggle, Icon } from '@ui-kitten/components';
import React, { useEffect, useContext, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import useSWR from 'swr';
import { getRoute, postRoute } from '../api/routes';
import { RouterListItem } from '../types';
import Loader from '../components/Icons/Loader';
import {NavigationContainer} from '@react-navigation/native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {WebView} from 'react-native-webview';
import map_scripts from '../map_scripts';
import {GlobalState} from '../store/global/global.state';

type Props = {};

const RouteScreen = (props: Props) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [pending, setPending] = React.useState(true);
  const {location} = useContext(GlobalState);
  const Map_Ref = useRef(null);
  const lat = location?.coords?.latitude;
  const lon = location?.coords?.longitude;

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

  /*const renderItem = ({ item, index }): React.ReactElement => {
    return (
      <ListItem
        title={item?.client_name}
        description={item?.address}
        accessoryLeft={() => renderItemLeft(item)}
        onPress={e =>
          props.navigation.navigate('TaskScreen', {...item, uid_route: uid})
        }
      />
    );
  };*/

  const getCardStatus = (item: RouterListItem) => {
    if (item.status === 1) {
      return 'danger';
    } else if (item.status === 2) {
      return 'primary';
    } else if (item.status === 3) {
      return 'success';
    } else {
      return 'basic';
    }
  };

  const renderItemName = (item: RouterListItem) => {
    return (
      <Layout style={styles.containerName}>
        <Icon name="pin-outline" width={23} height={23} style={{  }}></Icon> 

        <Text category="h6" style={styles.cardName}>
          {`${item?.client_name}`}
        </Text>
      </Layout>
    );
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: RouterListItem;
    index: number;
  }): React.ReactElement => (
    <View style={{padding: 10}}>
      <Card
        style={{}}
        status={getCardStatus(item)}
        header={() => renderItemName(item)}
        onPress={e => props.navigation.navigate('TaskScreen', { ...item })}
        style={styles.card}>
        <Text> {renderCardText(item)}</Text>
      </Card>
    </View>
  );

  const renderCardText = item => {
    return (
      <Layout style={styles.containerCard}>
        {renderItemLeft(item)}

        <View style={styles.containerCardText}>
          <Text>
            Объем: {item?.volume}, м3
          </Text>
          <Text>
            Вес: {item?.weight}, кг
          </Text>
          <Text>
            Загрузка: {item?.loading}, %
          </Text>
        </View>
      </Layout>
    );
  }; 

  const getToggleStatus = (item, index) => {
    return item.status !== 0;
  };

  const renderItemLeft = (item: RouterListItem) => {
    return (
      <Layout>
        <Layout>
          <Text category="s1" style={{textAlign: 'center'}}>
            {item?.time}
          </Text>
        </Layout>
        <Layout>
          <Text category="c2" style={{textAlign: 'center'}}>
            {item?.date}
          </Text>
        </Layout>
      </Layout>
    );
  };

  const getThisRoute = async () => {

    const currentDate = new Date();

    const data = {
      screen: 0,
      type: 1,
      date: currentDate.toJSON()
    };

    const jsonData = JSON.stringify(data);

    const user = postRoute(uid, jsonData);

    console.log({user});

  };

  // Табы
  const {Navigator, Screen} = createMaterialTopTabNavigator();

  const RouteScreen = () => (
    <SafeAreaView style={{flex: 1}}>
      <List
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.list}
        data={routeItem?.points}
        renderItem={renderItem}
        ItemSeparatorComponent={Divider}
        ListHeaderComponent={
          <View>
            <Card
              status='warning'
              style = {{margin: 5}}
            >
              <Text category="h6" style={{ flex: 1, marginBottom: 10 }}>
                {routeItem?.name}
              </Text>
              <Text>
                Возврат на склад: {routeItem?.returnToWarehouse}
              </Text>
              <Text>
                Объем: {routeItem?.volume}, м3
              </Text>
              <Text>
                Вес: {routeItem?.weight}, кг
              </Text>
              <Text>
                Загрузка: {routeItem?.loading}%
              </Text>
              <Text category="s1" style={{ flex: 1 }}>
                {routeItem?.description_full}
              </Text>
            </Card>
            <View>
              <Text category="h5" style={styles.title}>
                Точки Доставки
              </Text>
            </View>
          </View>
        }
      />
      <View>
        <Button
          onPress={getThisRoute}
          disabled={pending}
          accessoryLeft={pending ? Loader : false}>
          Начать Маршрут
        </Button>
      </View>
    </SafeAreaView>
  );

  jsInit = (lat, lon, routeItem) => {
    if (Map_Ref.current) {
      Map_Ref.current.injectJavaScript(`init(${lat}, ${lon});`);
      Map_Ref.current.injectJavaScript(
        `renderPoints(${JSON.stringify(routeItem)})`,
      );
    }
  };

  const MapScreen = () => (
    <SafeAreaView style={styles.Container}>
      <WebView
        ref={Map_Ref}
        source={{html: map_scripts}}
        style={styles.Webview}
        onLoad={() => this.jsInit(lat, lon, routeItem)}
      />
    </SafeAreaView>
  );

  const TopTabBar = ({navigation, state}) => (
    <TabBar
      selectedIndex={state.index}
      onSelect={index => navigation.navigate(state.routeNames[index])}>
      <Tab title="Маршрут" />
      <Tab title="Карта" />
    </TabBar>
  );

  const TabNavigator = () => (
    <Navigator tabBar={props => <TopTabBar {...props} />}>
      <Screen name="Route" component={RouteScreen} />
      <Screen name="Map" component={MapScreen} />
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
  containerCard: {
    flex: 1,
    flexDirection: 'row',
  },
  containerCardText: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 20,
  },
  containerName: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    padding: 10,
  },
  itemCard: {
    margin: 5,
    padding: 5
  },
  cardName: {
    padding: 5
  }
});

export default RouteScreen;
