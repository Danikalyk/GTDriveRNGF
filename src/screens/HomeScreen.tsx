//-- 20241021
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { RefreshControl, View, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Icon, Layout, Text, Spinner } from '@ui-kitten/components';
import { GlobalState } from '../store/global/global.state';
import { UserContext } from '../store/user/UserProvider';
import { getRoutes, postRoute } from '../api/routes';
import { getCardStatus, addGeofenceToNextPoint, deleteAllGeofences, getDataPostRoute } from '../components/functions';
import { styles } from '../styles';
import useSWR, { useSWRConfig } from 'swr';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import BackgroundGeolocation from 'react-native-background-geolocation';
import { RouterListItem } from '../types';

const HomeScreen = (props) => {
  const { cache } = useSWRConfig();
  const [startGeo, setStartGeo] = useState(false);
  const [renderComplete, setRenderComplete] = useState(false);
  const { currentUser, setRoute } = useContext(UserContext);
  const context = useContext(GlobalState);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [pending, setPending] = useState(false);

  // Получаем маршруты с использованием SWR 
  const { data: routes, mutate, error } = useSWR(`/routes?user=${currentUser}`, () => getRoutes(currentUser), {
    fallbackData: cache.get(`/routes?user=${currentUser}`),
  });

  // Функция для запуска маршрута
  const startRoute = async (routeToStart: RouterListItem) => {
    setPending(true);
    setRoute(routeToStart.uid);

    await new Promise((resolve) => resolve(null));

    context.enableGeo();
    BackgroundGeolocation.resetOdometer();

    const data = getDataPostRoute();
    data.screen = 0;
    data.type = 5;
    data.uid = routeToStart.uid;

    try {
      const netInfo = await NetInfo.fetch();
      mutate((currentData: RouterListItem[]) => {
        const updatedData = { ...currentData, status: 2, check: true };
        return updatedData;
      }, false);

      const dataString = JSON.stringify(data);
      await postRoute(routeToStart.uid, dataString);
      console.log('Отправленные данные:', dataString);
      
      if (routeToStart.points) {
        await Promise.all(routeToStart.points.map((point: any) => addGeofenceToNextPoint(point)));
      }

      mutate();
    } catch (error) {
      console.error('Ошибка при запуске маршрута:', error);
    }

    setPending(false);
  };

  // Функция для добавления геозон
  const addGeofencesToRoute = async (startRoute) => {
    await addGeofenceToNextPoint(startRoute.startGeo);

    for (const point of startRoute.followingPoints) {
      await addGeofenceToNextPoint(point);
    }
  };

  // Функция для сброса геозон 
  const resetGeofences = async () => {
    setRoute(null);
    setStartGeo(false);
    context.disableGeo();
    await deleteAllGeofences();
  };

  // Функция для удаления сохраненных фотографий
  const deleteSavedPhotos = async () => {
    const keys = await AsyncStorage.getAllKeys();
    const savedPhotosKeys = keys.filter(uid => uid.startsWith('savedPhotos_'));
    const validUids = routes?.map(item => item.uid) || [];
    const keysToRemove = savedPhotosKeys.filter(key => !validUids.includes(key.replace('savedPhotos_', '')));
    await AsyncStorage.multiRemove(keysToRemove);
  };

  // Функция для логирования маршрутов
  const logRoutes = () => {
    if (routes && routes.length > 0) {
      console.log('Полученные маршруты (форматированный вывод):');
      routes.forEach((route: { name: string; uid: string; status: string; start: boolean; firstInQueue?: boolean }, index: number) => {
        console.log(`Маршрут ${index + 1}:`);
        console.log(`- Название: ${route.name}`);
        console.log(`- ID: ${route.uid}`);
        console.log(`- Статус: ${route.status}`);
        console.log(`- Активный: ${route.start ? 'Да' : 'Нет'}`);
        console.log(`- Автозапуск: ${route.firstInQueue ? 'Да' : 'Нет'}`);
        console.log('------------------------');
      });

      console.log('\nJSON данные маршрутов:');
      console.log(JSON.stringify(routes, null, 2));
    } else {
      console.log('Маршруты не найдены');
    }
  };

  // Обработка ошибок и кэширование данных
  if (error && !routes) {
    mutate(`/routes?user=${currentUser}`, cache.get(`/routes?user=${currentUser}`), false);
  }

  // Функция для обновления данных
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    mutate();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [mutate]);

  // Эффект для обработки маршрутов и геозон
  useEffect(() => {
    if (routes) {
      logRoutes();
      deleteSavedPhotos();

      const hasStartGeo = routes.some((route: RouterListItem) => route.start === true);
      setStartGeo(hasStartGeo);

      // Добавляем слушатель событий backgroundGeolocation
      BackgroundGeolocation.onGeofence(geofence => {
        if (geofence.action === 'EXIT') {
          // Обновляем данные маршрутов после выхода из геозоны
          console.log('Выход из геозоны, обновляем данные маршрутов');
          mutate();
        }
      });

      if (!renderComplete) {
        setRenderComplete(true);
        
        if (hasStartGeo) {
          const startRoute = routes.find((route: RouterListItem) => route.start === true);
          setRoute(startRoute.uid);
          context.enableGeo();
          addGeofencesToRoute(startRoute);
        } else {
          // Проверяем наличие маршрутов с firstInQueue: true
          const queuedRoutes = routes.filter((route: RouterListItem) => 
            (route.firstInQueue === true || route.firstInQueue === "true") && !route.start
          );
          console.log('Найдены маршруты с firstInQueue:', queuedRoutes);
          
          if (queuedRoutes.length > 0) {
            // Сортируем по дате и берем самый ранний
            const routeToStart = queuedRoutes.sort((a: RouterListItem, b: RouterListItem) => {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              return dateA.getTime() - dateB.getTime();
            })[0];

            console.log('Выбран маршрут для автозапуска:', routeToStart);
            startRoute(routeToStart);
          } else {
            console.log('Нет маршрутов для автозапуска');
            resetGeofences();
          }
        }
      } else {
        // Проверяем, есть ли завершенный маршрут и следующий для автозапуска
        const finishedRoute = routes.find((route: RouterListItem) => route.status === 3 && route.start);
        
        if (finishedRoute) {
          console.log('Найден завершенный маршрут:', finishedRoute);
          
          // Ищем следующий маршрут для автозапуска
          const nextQueuedRoutes = routes.filter((route: RouterListItem) => 
            (route.firstInQueue === true || route.firstInQueue === "true") && 
            !route.start && 
            route.date > finishedRoute.date
          );
          
          if (nextQueuedRoutes.length > 0) {
            // Сортируем по дате и берем самый ранний
            const nextRouteToStart = nextQueuedRoutes.sort((a: RouterListItem, b: RouterListItem) => {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              return dateA.getTime() - dateB.getTime();
            })[0];
            
            console.log('Найден следующий маршрут для автозапуска:', nextRouteToStart);
            startRoute(nextRouteToStart);
          } else {
            console.log('Нет подходящих маршрутов для автозапуска после завершенного маршрута');
            resetGeofences();
          }
        }
      }
    }

    const unsubscribe = navigation.addListener('focus', () => {
      mutate();
    });

    return unsubscribe;
  }, [
    navigation, 
    routes, 
    context, 
    startGeo, 
    renderComplete, 
    startRoute, 
    setRoute, 
    addGeofencesToRoute, 
    resetGeofences, 
    deleteSavedPhotos, 
    logRoutes, 
    mutate
  ]);

  // Функция для фильтрации и сортировки данных
  const filteredData = routes?.filter(route => route.start || route.status)
    .sort((a, b) => (b.start - a.start) || (a.status - b.status));

  // Функция для получения статуса маршрута
  const getCardRouteStatus = (item) => {
    let status = getCardStatus(item.status);
    
    return (status === 'basic' && !item.start) ? 'control' : status;
  };

  // Функция для рендеринга карточки маршрута 
  const renderItemCard = ({ item }) => (
    <Card style={styles.containerCards}
      header={() => renderCardHeader(item)}
      status={getCardRouteStatus(item)}
      onPress={() => props.navigation.navigate('RouteScreen', { ...item })}>
      <View style={styles.textBodyCardWithLeftView}>
        {renderItemLeft(item)}
        <View style={styles.containerCardText}>
          {Object.values(item.descriptions).map((description, index) => (
            <Text key={index} category="c2" style={{ fontSize: 11 }}> • {description}</Text>
          ))}
        </View>
      </View>
    </Card>
  );

  // Функция для рендеринга заголовка карточки
  const renderCardHeader = (item) => (
    <View style={[styles.textHeaderCard, { padding: 10 }]}>
      <Icon name="car-outline" width={20} height={20} style={styles.textHeaderCardIcon} />
      <Text category="label" style={{ flex: 1, fontSize: 14 }}>{item.name}</Text>
    </View>
  );

  // Функция для рендеринга времени загрузки
  const renderItemLeft = (item) => (
    <View style={styles.textTimeLeft}>
      <Layout>
        <Text category="s1" style={{ textAlign: 'center', fontSize: 12 }}>{item?.loading_time}</Text>
      </Layout>
      <Layout>
        <Text category="c2" style={{ textAlign: 'center', fontSize: 10 }}>{item?.loading_date}</Text>
      </Layout>
    </View>
  );

  // Функция для отображения текущего маршрута
  const renderCurrentRouteTextIcon = () => (
    <View style={styles.currentRouteContainer}>
      <Icon name="corner-right-down-outline" width={20} height={20} style={styles.textHeaderCardIcon} />
      <Text category="label" style={styles.titleList}>Текущий маршрут</Text>
    </View>
  );

  return (
    <SafeAreaView>
      {pending && (
        <View style={styles.spinnerContainer}>
          <Spinner size="giant" status='basic' />
        </View>
      )}
      <View style={styles.backgroundContainer}>
        <Image source={require('../img/pattern.png')} style={styles.background} />
      </View>

      {startGeo && renderCurrentRouteTextIcon()}
      <FlatList
        style={styles.containerFlatList}
        data={filteredData}
        renderItem={renderItemCard}
        keyExtractor={item => item.uid}
        onEndReachedThreshold={0.5}
        onEndReached={onRefresh}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
