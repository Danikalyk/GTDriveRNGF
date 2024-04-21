/* eslint-disable react/no-unstable-nested-components */
import map_scripts from '../map_scripts';
import useSWR from 'swr';
import Loader from '../components/Icons/Loader';
import { Divider, Layout, List, ListItem, Text, Button, TabBar, Tab, CheckBox, Card, Toggle, Icon, BottomNavigation, BottomNavigationTab } from '@ui-kitten/components';
import React, { useEffect, useContext, useRef } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getRoute, postRoute } from '../api/routes';
import { RouterListItem } from '../types';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { WebView } from 'react-native-webview';
import { GlobalState } from '../store/global/global.state';
import { getCardStatus, getToggleCardStatus, getDataPostRoute } from '../components/functions.js';

type Props = {};

const RouteScreen = (props: Props) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [pending, setPending] = React.useState(true);
  const { location } = useContext(GlobalState);
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

  // Табы
  const { Navigator, Screen } = createMaterialTopTabNavigator();

  
  // ---------- Карточки шапки ----------

  const renderMainCard = () => {
    return (
      <View>
        <Card
          status='warning'
          header={renderMainCardHeader()}
          footer={renderMainCardFooter()}
          style={{ margin: 5 }}
        >
          <Text category="c2">
            Объем: {routeItem?.volume}, м3
          </Text>
          <Text category="c2">
            Вес: {routeItem?.weight}, кг
          </Text>
          <Text category="c2">
            Загрузка: {routeItem?.loading}%
          </Text>
        </Card>

        <View>
          <Text category="h6" style={styles.title}>
            Точки Доставки
          </Text>
        </View>
      </View>
    )
  }

  const renderMainCardHeader = () => {
    return (
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <Layout style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Icon name="car-outline" width={23} height={23} style={{ marginRight: 5 }}></Icon>
          <Text category="h6">{routeItem?.name}</Text>

          {renderMainCardReturnToWarehouse()}
        </Layout>
      </View>
    )
  }

  const renderMainCardFooter = () => {
    if(!routeItem.check) {
      return (
        <View>
          <Button
            onPress={getThisRoute}
            disabled={pending}
            accessoryLeft={pending ? Loader : false}
            style={{}}
          >
            Начать Маршрут
          </Button>
        </View>  
      )
    }
  }

  const renderMainCardReturnToWarehouse = () => {
    if (routeItem.returnToWarehouse) {
      return (
        <View style={{}}>
          <Icon name="swap" width={23} height={23} style={{ marginRight: 5 }} onPress={() => { Alert.alert("Требуется возврат на склад!") }}  ></Icon>
        </View>
      )
    } else {
      return (
        <View style={{}}>
          <Icon name="arrow-forward" width={23} height={23} style={{ marginRight: 5 }} onPress={() => { Alert.alert("Возврат на склад не требуется!") }}  ></Icon>
        </View>
      )
    }
  }


  // ---------- Карточки точек доставки ----------

  const renderCardPoint = ({ item, index }: { item: RouterListItem; index: number; }): React.ReactElement => (
    <View style={{ padding: 10 }}>
      <Card
        style={{}}
        status={getCardStatus(item.status)}
        header={() => renderCardPointName(item)}
        onPress={e => props.navigation.navigate('TaskScreen', { ...item })}
        style={styles.card}>
        <Text> {renderCardPointText(item)}</Text>
      </Card>
    </View>
  );

  const renderCardPointText = (item: RouterListItem) => {
    if (item.type === 1) {
      return (
        <Layout style={styles.containerCard}>
          {renderCardPointTextLeft(item)}

          <View style={styles.containerCardText}>
            <Text category="c2">
              Точка погрузки машины
            </Text>
          </View>
        </Layout>
      );
    } else {
      return (
        <Layout style={styles.containerCard}>
          {renderCardPointTextLeft(item)}

          <View style={styles.containerCardText}>
            <Text category="c2">
              Объем: {item?.volume}, м3
            </Text>
            <Text category="c2">
              Вес: {item?.weight}, кг
            </Text>
            <Text category="c2">
              Загрузка: {item?.loading}, %
            </Text>
          </View>
        </Layout>
      );
    }
  };

  const renderCardPointTextLeft = (item: RouterListItem) => {
    return (
      <Layout style={{ flex: 1, justifyContent: 'center' }}>
        <View>
          <Text category="s1" style={{ textAlign: 'center' }}>
            {item?.time}
          </Text>
        </View>
        <View>
          <Text category="c2" style={{ textAlign: 'center' }}>
            {item?.date}
          </Text>
        </View>
      </Layout>
    );
  };

  const renderCardPointName = (item: RouterListItem) => {
    return (
      <Layout style={styles.containerName}>
        {renderCardPointNameIcon()}

        <Text category="h6" style={styles.cardName}>
          {`${item?.client_name}`}
        </Text>
      </Layout>
    );
  };

  const renderCardPointNameIcon = () => {
    //-- заделка под разные иконки в зависимости от точки доставки

    return (
      <Icon name="pin-outline" width={23} height={23} style={{ margin: 10 }}></Icon>
    )
  }

  // ---------- Таб Точки ----------

  const PointsScreen = () => (
    <SafeAreaView style={{ flex: 1 }}>
      <List
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={styles.list}
        data={routeItem?.points}
        renderItem={renderCardPoint}
        ItemSeparatorComponent={Divider}
        ListHeaderComponent={renderMainCard}
      />
    </SafeAreaView>
  );


  // ---------- Таб Карты ----------

  const MapOSRMScreen = () => (
    <SafeAreaView style={styles.Container}>
      <WebView
        ref={Map_Ref}
        source={{ html: map_scripts }}
        style={styles.Webview}
        onLoad={() => this.jsMapInit(lat, lon, routeItem)}
      />
    </SafeAreaView>
  );

  jsMapInit = (lat, lon, routeItem) => {
    if (Map_Ref.current) {
      Map_Ref.current.injectJavaScript(`init(${lat}, ${lon});`);
      Map_Ref.current.injectJavaScript(
        `renderPoints(${JSON.stringify(routeItem)})`,
      );
    }
  };


  // ---------- Запросы к серверу ----------

  const getThisRoute = async () => {
    let data = getDataPostRoute();
    data.screen = 0;
    data.type = 5;
    data.uid = uid;

    data = JSON.stringify(data);

    postRoute(uid, data);
  };

  // ---------- Табы ----------

  const TabNavigator = () => (
    <Navigator tabBar={props => <BottomTabBar {...props} />}>
      <Screen name='Точки' component={PointsScreen} />
      <Screen name='Карта' component={MapOSRMScreen} />
    </Navigator>
  );

  const BottomTabBar = ({ navigation, state }) => (
    <BottomNavigation
      selectedIndex={state.index}
      onSelect={index => navigation.navigate(state.routeNames[index])}>

      <BottomNavigationTab title='Точки' icon={<Icon {...props} name='pin' />} />
      <BottomNavigationTab title='Карта' icon={<Icon {...props} name='globe' />} />

    </BottomNavigation>
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
    justifyContent: 'center'
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
