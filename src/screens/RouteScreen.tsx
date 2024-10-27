// ---------- Страница Текущий маршрут ----------

import map_scripts from '../map_scripts';
import useSWR, { useSWRConfig } from 'swr';
import { Layout, Text, Button, Card, Icon, BottomNavigation, BottomNavigationTab, Spinner, Menu, MenuItem } from '@ui-kitten/components';
import React, { useEffect, useContext, useRef, useCallback, useState } from 'react';
import { View, Alert, RefreshControl, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { postRoute, getOSRM } from '../api/routes';
import { RouterListItem } from '../types';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { GlobalState } from '../store/global/global.state';
import { getCardStatus, getDataPostRoute, addGeofenceToNextPoint, getDateFromJSON } from '../components/functions.js';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { styles } from '../styles';
import { UserContext } from '../store/user/UserProvider';
import { getReq, getRequest } from '../api/request';
import { LocationContext } from '../store/location/LocationProvider';
import NetInfo from '@react-native-community/netinfo';
import FunctionQueue from '../utils/FunctionQueue.js';
import BackgroundGeolocation from 'react-native-background-geolocation';
import * as eva from '@eva-design/eva';
import { ApplicationProvider } from '@ui-kitten/components';
import { default as mapping } from '../styles/mapping';

type Props = {};

const { Navigator, Screen } = createBottomTabNavigator();
const queue = new FunctionQueue();
const backgroundImage = require('../img/pattern.png');
const useRouteData = (uid) => {
  const { cache } = useSWRConfig();
  const getCachedData = (key) => cache.get(key);

  return useSWR(`/route/${uid}`, () => getReq(`/route/${uid}`).then(res => res.data), {
    fallbackData: getCachedData(`/route/${uid}`),
  });
};

const RouteScreen = (props: Props) => {
  const { currentRoute, setRoute } = useContext(UserContext);
  const context = useContext(GlobalState);
  const navigation = useNavigation();
  const [pending, setPending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const uid = props?.route?.params?.uid;
  const mainDesription = props?.route?.params?.descriptions;
  const goBack = () => {
    navigation.goBack({ post: true });
  };

  const { data: route, mutate, error } = useRouteData(uid);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      mutate();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        queue.processQueue();
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (error && (!route || !route?.points)) {
      mutate(`/route/${uid}`, getCachedData(`/route/${uid}`), false);
    }
  }, [error, route, uid, mutate]);

  const updateDate = async (data, callback = () => { }) => {
    const netInfo = await NetInfo.fetch();
    mutate((currentData) => {
      const updatedData = { ...currentData, status: data.finish ? 3 : 2, check: !data.finish };
      return updatedData;
    }, false);

    const callbackFunc = async () => await callback();

    if (!netInfo.isConnected) {
      data.needJSON = false;
      queue.enqueue(callbackFunc);
    } else {
      callbackFunc();
    }

    setPending(false);
  };

  const title = ('Текущий ' + route?.name) || 'Маршрут';

  useEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    mutate();
    setTimeout(() => setRefreshing(false), 1000);
  }, [mutate]);

  const routeItem = route;

  if (!routeItem || !routeItem.points) return null;

  let points = [...route.points].sort((a, b) => a.sort - b.sort); //-- Сортируем по статусу маршурта
  //points = points.filter(point => point.status !== 3);

  if (!route.check) points[0].status = 0; //-- Если маршрут не взят в работу, то нужно у первой точки склада проставить статус 0 

  const unfinishedPoints = points.filter((item) => item.status !== 3);

  // ---------- Карточки Маршрута Доставки ----------

  const renderMainCard = () => {
    const allPointsFinished = points.every(point => point.status === 3);

    const cardStyle = {
      ...styles.containerCards,
      borderWidth: 1,
      paddingHorizontal: 24,
      paddingBottom: 16,
      paddingTop: 6,
      marginTop: 5
    };

    const renderButton = (onPress, text, iconName, disabled = false, appearance = "filled", status = "basic") => (
      <Button
        onPress={onPress}
        disabled={disabled}
        appearance={appearance}
        status={status}
        accessoryLeft={<Icon name={iconName} fill="#FFFFFF" />}
        style={{ marginTop: 10 }}
      >
        {text}
      </Button>
    );

    if (!routeItem.check && !allPointsFinished) {
      const otherRoute = currentRoute && currentRoute !== uid;
      const buttonText = otherRoute ? 'В работе другой маршрут' : 'Начать Маршрут';
      const buttonIcon = otherRoute ? 'stop-circle' : 'flag';
      const buttonDisabled = pending || otherRoute;

      return (
        <Card style={cardStyle}>
          {renderButton(getThisRoute, buttonText, buttonIcon, buttonDisabled)}
        </Card>
      );
    }

    if (allPointsFinished && routeItem.check && routeItem.status !== 3) {
      return (
        <Card style={cardStyle}>
          {renderButton(finishThisRoute, 'Завершить маршрут', 'flag-outline')}
        </Card>
      );
    }

    if (routeItem.status === 3) {
      return (
        <Card style={cardStyle}>
          {renderButton(null, 'Маршрут завершен', 'checkmark-circle-2-outline', false, 'outline', 'success')}
        </Card>
      );
    }

    return null; // Возвращаем null, если ни одно из условий не выполнено
  };

  // ---------- Карточки точек доставки ----------

  const renderStatusText = (iconName: string, text: string) => (
    <View style={styles.currentRouteContainer}>
      <Icon name={iconName} width={20} height={20} style={styles.textHeaderCardIcon} />
      <Text category="label" style={styles.titleList}>{text}</Text>
    </View>
  );

  const renderItemCard = ({ item, index }: { item: RouterListItem; index: number; }): React.ReactElement => {
    const statusFirstPoint = points[0].status === 0;
    const isCurrentPoint = (item.status === 1 || item.status === 2) && routeItem.check;
    const isRoutePoint = !isCurrentPoint && ((index === 1 && !statusFirstPoint) || (index === 0 && statusFirstPoint)) && item.status !== 3;
    const finishedPoint = item.status === 3;
    const status = item.status === 2 ? 1 : item.status;

    return (
      <View>
        {isCurrentPoint && renderStatusText("corner-right-down-outline", "Текущая точка следования")}
        {isRoutePoint && renderStatusText("navigation-2", "Точки Маршрута")}
        <Card
          style={[styles.containerCards]}
          status={getCardStatus(status)}
          header={() => renderCardHeader(item)}
          onPress={() => handleOpenTaskScreen(item)}
        >
          {renderCardPointText(item)}
        </Card>
      </View>
    );
  };

  const handleOpenTaskScreen = (item) => {
    if (!routeItem.check) {
      Alert.alert('Необходимо принять маршрут');
    } else {
      props.navigation.navigate('TaskScreen', { ...item, ...points });
    }
  };

  function renderCardPointText(item: RouterListItem) {
    const time_finish = item.status === 3 ? getDateFromJSON(item.time_finish) : null;

    return (
      <View style={styles.textBodyCardWithLeftView}>
        {renderCardPointTextLeft(item)}
        {time_finish ? (
          <Text category="c2">Дата завершения: {time_finish}</Text>
        ) : (
          (item.type === 1 || item.type === 7) ? renderWarehouseText(item) : renderPointText(item)
        )}
      </View>
    );
  }

  function renderWarehouseText(item: RouterListItem) {
    //console.log({ item });

    return (
      <View style={styles.containerCardText}>
        <Text category="c2">
          {item.type === 1 ? 'Точка погрузки машины на складе' : 'Точка завершения маршрута'}
        </Text>
      </View>
    );
  }

  const renderPointText = (item: RouterListItem) => {
    const showAddress = item.address !== item.client_name;

    return (
      <View style={styles.containerCardText}>
        {showAddress && <Text category="c2" style={{ fontSize: 11 }}>Адрес: {item?.address}</Text>}
        <Text category="c2" style={{ fontSize: 11 }}>Объем: {item?.volume}, м³</Text>
        <Text category="c2" style={{ fontSize: 11 }}>Вес: {item?.weight}, кг</Text>
        <Text category="c2" style={{ fontSize: 11 }}>Количество заказов: {item?.countOrders}</Text>
      </View>
    );
  };

  const renderCardPointTextLeft = (item: RouterListItem) => (
    <View style={styles.textTimeLeft}>
      <Layout>
        <Text category="s1" style={{ textAlign: 'center', fontSize: 12 }}>{item?.time}</Text>
      </Layout>
      <Layout>
        <Text category="c2" style={{ textAlign: 'center', fontSize: 10 }}>{item?.date}</Text>
      </Layout>
    </View>
  );

  const renderCardHeader = (item: RouterListItem) => {
    const nameIcon = item.point === 1 ? 'download-outline' : 'pin-outline';

    return (
      <View style={[styles.textHeaderCard, { padding: 10 }]}>
        <Icon name={nameIcon} width={20} height={20} style={styles.textHeaderCardIcon} />
        <Text category="label" style={{ flex: 1, fontSize: 14 }}>{item?.client_name}</Text>
      </View>
    );
  };

  const renderAllShipmetsText = () => (
    <>
      <View style={[styles.currentRouteContainer, { justifyContent: 'center' }]}>
        <Icon
          name="checkmark-circle-outline"
          width={25}
          height={25}
          style={styles.textHeaderCardIcon}
        />
        <Text category="label" style={styles.titleList}>
          Все заказы отгружены
        </Text>
      </View>
    </>
  )

  // ---------- Таб Точки ----------

  function PointsScreen() {
    return (
      <SafeAreaView style={{}}>
        {pending && (
          <View style={styles.spinnerContainer}>
            <Spinner size="giant" status='basic' />
          </View>
        )}

        <View style={styles.backgroundContainer}>
          <Image source={backgroundImage} style={styles.background} />
        </View>
        
        {unfinishedPoints.length === 0 && renderAllShipmetsText()}
        
        <FlatList
          refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
          style={styles.containerFlatList}
          data={unfinishedPoints}
          renderItem={renderItemCard}
          ListHeaderComponent={renderMainCard} />

      </SafeAreaView>
    );
  }

  // ----------- Таб Информация ----------

  const renderInfoCard = ({ item, index }: { item: RouterListItem; index: number; }): React.ReactElement => {

    return (
      <View>
        <Card
          style={[
            styles.containerCards
          ]}
          status="suceess"
          header={() => renderCardHeader(item)}
        //onPress={() => handleOpenTaskScreen(item)}
        >
          <View style={styles.textBodyCardWithLeftView}>
            {renderCardPointTextLeft(item)}
            {renderPointText(item)}
          </View>
        </Card>
      </View>
    );
  };



  function InformationScreen() {
    const pointsComplete = points.filter(point => point.status === 3);
    const timeStart = points[0]?.time_start;
    
    //-- Точки и завершенные точки
    const lengthPoints = points.length;
    const lengthPointsComplete = pointsComplete.length;
    const readableDate = timeStart ? getDateFromJSON(timeStart) : '';
  
    //-- Время в пути
    const timeInRoad = timeStart ? parseFloat(((new Date() - new Date(timeStart)) / 36e5).toFixed(2)) : 0;
  
    //-- Требуется возврат на склад
    const returnToWarehouseMessage = routeItem.returnToWarehouse ? 'Требуется возврат на склад!' : 'Возврат на склад не требуется!';
  
    //-- Заказы и завершенные заказы
    const { unfinishedOrders, finishedOrders } = points.reduce((acc, item) => {
      const ordersOfTypeFour = item.orders.filter(order => order.type === 4);
      acc.unfinishedOrders += ordersOfTypeFour.length;
      acc.finishedOrders += ordersOfTypeFour.filter(order => order.status === 3).length;
      return acc;
    }, { unfinishedOrders: 0, finishedOrders: 0 });
  
    //-- одометр
    const odometer = isNaN(BackgroundGeolocation.getOdometer()) ? 0 : BackgroundGeolocation.getOdometer() / 1000;
  
    const renderMenuInfoText = (text) => (
      <MenuItem
        title={<Text style={{}}>{text}</Text>}
        accessoryLeft={<Icon name="chevron-right-outline" style={{}} />}
        style={[styles.textInfoCard, {}]}
      />
    );
  
    return (
      <SafeAreaView style={styles.containerFlatList}>
        {pending && (
          <View style={styles.spinnerContainer}>
            <Spinner size="giant" />
          </View>
        )}
  
        <View style={styles.backgroundContainer}>
          <Image source={backgroundImage} style={styles.background} />
        </View>
  
        <Card status="basic" style={[styles.containerCards, { marginTop: 5 }]}>
          <Menu>
            {renderMenuInfoText(returnToWarehouseMessage)}
  
            {routeItem.check && (
              <>
                {renderMenuInfoText(`Время начала ${readableDate}`)}
                {renderMenuInfoText(`Время в пути ~ ${timeInRoad} ч.`)}
              </>
            )}
  
            {renderMenuInfoText(`Пройдено ~ ${odometer} км.`)}
            {renderMenuInfoText(`Посещено точек ${lengthPointsComplete} из ${lengthPoints}`)}
            {renderMenuInfoText(`Отгружено заказов ${finishedOrders} из ${unfinishedOrders}`)}
  
            {/* Object.values(mainDesription).map((description, index) => (
              <Text key={index} category="c2">
                • {description}
              </Text>
            )) */}
          </Menu>
        </Card>
  
        {pointsComplete.length > 0 && (
          <>
            {renderStatusText("code-download-outline", "Завершенные точки")}
            <FlatList
              data={pointsComplete}
              refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
              renderItem={renderItemCard}
            />
          </>
        )}
      </SafeAreaView>
    );
  }

  // ---------- Таб Карты ----------

  const MapOSRMScreen = ({ points }) => {
    const { location } = useContext(LocationContext);

    const Map_Ref = useRef(null);
    const lat = location?.coords?.latitude;
    const lon = location?.coords?.longitude;

    const calculateMapData = async () => {
      let mapData = [];
      let pointNumber = 0;
      let coordinates = [];

      points.forEach(point => {
        let color = 'grey';

        switch (point.status) {
          case 0:
            color = 'blue';
            break;
          case 1:
            color = 'green';
            break;
          case 2:
            color = 'red';
            break;
          default:
            color = 'grey';
            break;
        }

        const bindText = {
          address: point.address,
          name: point.client_name,
          count: point.orders.length,
          plan: point.time + ' / ' + point.date,
          fact: point.time_fact + ' / ' + point.date_fact,
        };

        const dataPoint = {
          lat: point.lat,
          lon: point.lon,
          color: color,
          bindText: point.address,
        };

        if (point.status !== 3) {
          pointNumber++;
          dataPoint.number = pointNumber;
        } else {
          dataPoint.number = '';
        }

        if (point.status === 3) {
          mapData.unshift(dataPoint);
        } else {
          mapData.push(dataPoint);
        }
      });

      coordinates = points
        .filter(point => point.status !== 3 && point.lat && point.lon)
        .map(point => `${point.lon},${point.lat}`);

      if (lon && lat) {
        coordinates.unshift(`${lon},${lat}`);
      }

      const osrmData = await getOSRM(coordinates);

      const mapDataWithCoordinates = {
        points: mapData,
        coordinates: osrmData,
      };

      return mapDataWithCoordinates;
    };

    const jsMapInit = async (lat, lon) => {
      const dataPoints = await calculateMapData();

      if (Map_Ref.current) {
        Map_Ref.current.injectJavaScript(`init(${lat}, ${lon});`);
        Map_Ref.current.injectJavaScript(
          `renderPoints(${JSON.stringify(dataPoints)})`,
        );
      }
    };
    return (
      <WebView
        ref={Map_Ref}
        source={{ html: map_scripts }}
        style={styles.Webview}
        onLoad={() => jsMapInit(lat, lon)}
      />
    );
  };

  // ---------- Запросы к серверу ----------

  const prepareRouteData = (finish = false) => {
    const data = getDataPostRoute();
    data.screen = 0;
    data.type = 5;
    data.uid = uid;
    if (finish) data.finish = true;
    return data;
  };

  const postRouteData = async (data) => {
    const dataString = JSON.stringify(data);
    await postRoute(uid, dataString);
    mutate();
  };

  const getThisRoute = async () => {
    setPending(true);
    setRoute(uid);

    await new Promise(resolve => setTimeout(resolve, 0));

    context.enableGeo();
    BackgroundGeolocation.resetOdometer();

    const data = prepareRouteData();
    await updateDate(data, () => postRouteData(data));

    if (route.lite) {
      await Promise.all(points.map(point => addGeofenceToNextPoint(point)));
    }

    setPending(false);
  };

  const finishThisRoute = async () => {
    setPending(true);

    await new Promise(resolve => setTimeout(resolve, 0));

    context.disableGeo();
    setRoute(null);

    await new Promise(resolve => setTimeout(resolve, 0));

    const data = prepareRouteData(true);
    await updateDate(data, () => postRouteData(data));

    goBack();
    setPending(false);
  };

  // ---------- Табы ----------

  const TabNavigator = () => (
    <Navigator tabBar={props => <BottomTabBar {...props} />}>
      <Screen
        name="Точки"
        component={PointsScreen}
        options={{ headerShown: false }}
      />

      <Screen
        name="Информация"
        component={InformationScreen}
        options={{ headerShown: false }}
      />

    </Navigator>
  );

  /*<Screen
        name="Карта"
        component={() => <MapOSRMScreen points={points} />}
        options={{headerShown: false}}
      />
      */

  const BottomTabBar = ({ navigation, state }) => (
    <SafeAreaView>
      <BottomNavigation
        selectedIndex={state.index}
        onSelect={index => navigation.navigate(state.routeNames[index])}>
        <BottomNavigationTab
          title={() => <Text style={styles.bottonNavigatorText}>Точки</Text>}
          icon={<Icon {...props} name="pin" />}
        />

        {/*<BottomNavigationTab
          title="Карта"
          icon={<Icon {...props} name="globe" />}
        />*/}

        <BottomNavigationTab
          title={() => <Text style={styles.bottonNavigatorText}>Информация</Text>}
          icon={<Icon {...props} name="info-outline" />}
        />
      </BottomNavigation>
    </SafeAreaView>
  );

  return (
    <ApplicationProvider {...eva} customMapping={mapping} theme={eva.light}>
      <NavigationContainer independent={true}>
        <TabNavigator />
      </NavigationContainer>
    </ApplicationProvider>
  );
};

export default RouteScreen;
