/* eslint-disable react/no-unstable-nested-components */
import map_scripts from '../map_scripts';
import useSWR from 'swr';
import Loader from '../components/Icons/Loader';
import { Layout, List, Text, Button, Card, Icon, BottomNavigation, BottomNavigationTab } from '@ui-kitten/components';
import React, { useEffect, useContext, useRef } from 'react';
import { View, Alert } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getRoute, postRoute } from '../api/routes';
import { RouterListItem } from '../types';
import { NavigationContainer } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { GlobalState } from '../store/global/global.state';
import { getCardStatus, getToggleCardStatus, getDataPostRoute } from '../components/functions.js';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { styles } from '../styles';

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
  const { Navigator, Screen } = createBottomTabNavigator();

  // ---------- Карточки шапки ----------

  const renderMainCard = () => {
    return (
      <Layout>
        <Card
          status='danger'
          header={renderMainCardHeader()}
          footer={renderMainCardFooter()}
          style={styles.containerCards}
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
          <Text category="h6" style={styles.titleList}>
            Точки Доставки
          </Text>
        </View>
      </Layout>
    )
  }

  const renderMainCardHeader = () => {
    return (
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <Layout style={styles.textHeaderCard}>
          <Icon name="car-outline" width={23} height={23} style={styles.textHeaderCardIcon}></Icon>
          <Text category="h6">{routeItem?.name}</Text>

          {renderMainCardReturnToWarehouse()}
        </Layout>
      </View>
    )
  }

  const renderMainCardFooter = () => {
    if (!routeItem.check) {
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

  const renderCardsPoint = ({ item, index }: { item: RouterListItem; index: number; }): React.ReactElement => (
    <Card
      style={styles.containerCards}
      status={getCardStatus(item.status)}
      header={() => renderCardPointName(item)}
      onPress={e => props.navigation.navigate('TaskScreen', { ...item })}
    >
      {renderCardPointText(item)}
    </Card>
  );

  const renderCardPointText = (item: RouterListItem) => {
    return (
      <View style={styles.textBodyCardWithLeftView}>
        {renderCardPointTextLeft(item)}

        {item.type === 1 ? renderWarehouseText(item) : renderPointText(item)}
      </View>
    );
  };

  const renderWarehouseText = (item: RouterListItem) => (
    <Text category="c2">
      Точка погрузки машины
    </Text>
  );

  const renderPointText = (item: RouterListItem) => (
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
  );

  const renderCardPointTextLeft = (item: RouterListItem) => {
    return (
      <View style={styles.textTimeLeft}>
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
      </View>
    );
  };

  const renderCardPointName = (item: RouterListItem) => {
    return (
      <Layout style={styles.textHeaderCard}>
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
    <SafeAreaView>
      <List
        //refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={{}}
        data={routeItem?.points}
        renderItem={renderCardsPoint}
        ListHeaderComponent={renderMainCard}
      />
    </SafeAreaView>
  );

  // ---------- Таб Карты ----------

  const MapOSRMScreen = () => (
    <WebView
      ref={Map_Ref}
      source={{ html: map_scripts }}
      style={styles.Webview}
      onLoad={() => this.jsMapInit(lat, lon, routeItem)}
    />
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
      <Screen
        name='Точки'
        component={PointsScreen}
        options={{ headerShown: false }}
      />
      <Screen
        name='Карта'
        component={MapOSRMScreen}
        options={{ headerShown: false }}
      />
    </Navigator>
  );

  const BottomTabBar = ({ navigation, state }) => (
    <SafeAreaView>
      <BottomNavigation
        selectedIndex={state.index}
        onSelect={index => navigation.navigate(state.routeNames[index])}>

        <BottomNavigationTab
          title='Точки'
          icon={<Icon {...props} name='pin' />}
        />

        <BottomNavigationTab
          title='Карта'
          icon={<Icon {...props} name='globe' />}
        />

      </BottomNavigation>
    </SafeAreaView>
  );

  return (
    <NavigationContainer independent={true}>
      <TabNavigator />
    </NavigationContainer>
  );
};

export default RouteScreen;
