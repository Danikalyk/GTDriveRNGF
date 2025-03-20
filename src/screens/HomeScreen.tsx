//-- 20241021
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { RefreshControl, View, FlatList, Image, ImageStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Icon, Layout, Text, Spinner } from '@ui-kitten/components';
import { GlobalState } from '../store/global/global.state';
import { UserContext } from '../store/user/UserProvider';
import { getRoutes, postRoute } from '../api/routes';
import { getCardStatus, addGeofenceToNextPoint, deleteAllGeofences, getDataPostRoute } from '../components/functions';
import { styles } from '../styles';
import useSWR, { useSWRConfig } from 'swr';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import BackgroundGeolocation from 'react-native-background-geolocation';
import { RouterListItem } from '../types';

interface HomeScreenProps {
  navigation: NavigationProp<any>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { cache } = useSWRConfig();
  const [startGeo, setStartGeo] = useState(false);
  const [renderComplete, setRenderComplete] = useState(false);
  const { currentUser, setRoute } = useContext(UserContext);
  const context = useContext(GlobalState);
  const [refreshing, setRefreshing] = useState(false);
  const [pending, setPending] = useState(false);

  // Получаем маршруты с использованием SWR 
  const { data: routes, mutate, error, isLoading } = useSWR(
    `/routes?user=${currentUser}`,
    () => getRoutes(currentUser),
    {
      fallbackData: cache.get(`/routes?user=${currentUser}`) || [],
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // Функция для запуска маршрута
  const startRoute = useCallback(async (routeToStart: RouterListItem) => {
    setPending(true);
    setRoute(routeToStart.uid);

    await new Promise(resolve => resolve(null));

    context.enableGeo();
    BackgroundGeolocation.resetOdometer();

    const data = getDataPostRoute();
    data.screen = 0;
    data.type = 5;
    data.uid = routeToStart.uid;

    try {
      await NetInfo.fetch();
      mutate((currentData: RouterListItem[]) => {
        const updatedData = { ...currentData, status: 2, check: true };
        return updatedData;
      }, false);

      const dataString = JSON.stringify(data);
      await postRoute(routeToStart.uid, dataString);
      console.log('Отправленные данные:', dataString);
      
      if (routeToStart.points) {
        await Promise.all(
          routeToStart.points.map((point: any) => addGeofenceToNextPoint(point))
        );
      }

      mutate();
    } catch (error) {
      console.error('Ошибка при запуске маршрута:', error);
    }

    setPending(false);
  }, [context, mutate, setRoute]);

  // Функция для добавления геозон
  const addGeofencesToRoute = useCallback(async (startRoute: RouterListItem) => {
    await addGeofenceToNextPoint(startRoute.startGeo);

    for (const point of startRoute.followingPoints) {
      await addGeofenceToNextPoint(point);
    }
  }, []);

  // Функция для сброса геозон 
  const resetGeofences = useCallback(async () => {
    setRoute(null);
    setStartGeo(false);
    context.disableGeo();
    await deleteAllGeofences();
  }, [context, setRoute]);

  // Функция для удаления сохраненных фотографий
  const deleteSavedPhotos = useCallback(async () => {
    const keys = await AsyncStorage.getAllKeys();
    const savedPhotosKeys = keys.filter(uid => uid.startsWith('savedPhotos_'));
    const validUids = routes?.map((item: RouterListItem) => item.uid) || [];
    const keysToRemove = savedPhotosKeys.filter(
      key => !validUids.includes(key.replace('savedPhotos_', '')),
    );
    await AsyncStorage.multiRemove(keysToRemove);
  }, [routes]);

  // Функция для логирования маршрутов
  const logRoutes = useCallback(() => {
    if (routes && routes.length > 0) {
      console.log('Полученные маршруты (форматированный вывод):');
      routes.forEach(
        (
          route: {
            name: string;
            uid: string;
            status: string;
            start: boolean;
            firstInQueue?: boolean;
          },
          index: number,
        ) => {
          console.log(`Маршрут ${index + 1}:`);
          console.log(`- Название: ${route.name}`);
          console.log(`- ID: ${route.uid}`);
          console.log(`- Статус: ${route.status}`);
          console.log(`- Активный: ${route.start ? 'Да' : 'Нет'}`);
          console.log(`- Автозапуск: ${route.firstInQueue ? 'Да' : 'Нет'}`);
          console.log('------------------------');
        },
      );

      console.log('\nJSON данные маршрутов:');
      console.log(JSON.stringify(routes, null, 2));
    } else {
      console.log('Маршруты не найдены');
    }
  }, [routes]);

  // Обработка ошибок и кэширование данных
  if (error && !routes) {
    mutate(`/routes?user=${currentUser}`, [], false);
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
    if (!isLoading && Array.isArray(routes)) {
      console.log('Данные маршрутов загружены:', routes);
      logRoutes();
      deleteSavedPhotos();

      const hasStartGeo = routes.some(
        (route: RouterListItem) => route && route.start === true,
      );
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
        console.log('Первичная инициализация маршрутов');
        setRenderComplete(true);
        
        if (hasStartGeo) {
          const startRoute = routes.find(
            (route: RouterListItem) => route && route.start === true,
          );
          if (startRoute) {
            console.log('Найден активный маршрут для запуска:', startRoute);
            setRoute(startRoute.uid);
            context.enableGeo();
            addGeofencesToRoute(startRoute);
          }
        } else {
          // Проверяем наличие маршрутов с firstInQueue: true
          const queuedRoutes = routes.filter(
            (route: RouterListItem) =>
              route &&
              (route.firstInQueue === true || route.firstInQueue === 'true') &&
              !route.start,
          );
          console.log('Найдены маршруты с firstInQueue:', queuedRoutes);
          
          if (queuedRoutes.length > 0) {
            // Сортируем по дате и берем самый ранний
            const routeToStart = queuedRoutes.sort(
              (a: RouterListItem, b: RouterListItem) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateA.getTime() - dateB.getTime();
              },
            )[0];

            if (routeToStart) {
              console.log('Выбран маршрут для автозапуска:', routeToStart);
              // Добавляем небольшую задержку для уверенности, что все компоненты смонтированы
              setTimeout(() => {
                startRoute(routeToStart);
              }, 100);
            }
          } else {
            console.log('Нет маршрутов для автозапуска');
            resetGeofences();
          }
        }
      } else {
        // Проверяем, есть ли завершенный маршрут и следующий для автозапуска
        const finishedRoute = routes.find(
          (route: RouterListItem) => route && route.status === 3 && route.start,
        );
        
        if (finishedRoute) {
          console.log('Найден завершенный маршрут:', finishedRoute);
          
          // Ищем следующий маршрут для автозапуска
          const nextQueuedRoutes = routes.filter(
            (route: RouterListItem) =>
              route &&
              (route.firstInQueue === true || route.firstInQueue === 'true') &&
              !route.start &&
              route.date > finishedRoute.date,
          );
          
          if (nextQueuedRoutes.length > 0) {
            // Сортируем по дате и берем самый ранний
            const nextRouteToStart = nextQueuedRoutes.sort(
              (a: RouterListItem, b: RouterListItem) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateA.getTime() - dateB.getTime();
              },
            )[0];
            
            if (nextRouteToStart) {
              console.log('Найден следующий маршрут для автозапуска:', nextRouteToStart);
              // Добавляем небольшую задержку для уверенности, что все компоненты смонтированы
              setTimeout(() => {
                startRoute(nextRouteToStart);
              }, 100);
            }
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
    mutate,
    isLoading,
  ]);

  // Функция для фильтрации и сортировки данных
  const filteredData = Array.isArray(routes) ? routes.filter((route: RouterListItem) => 
    route && (route.start || route.status)
  ).sort((a: RouterListItem, b: RouterListItem) => {
    const startDiff = Number(b.start) - Number(a.start);
    const statusDiff = Number(a.status) - Number(b.status);
    return startDiff || statusDiff;
  }) : [];

  // Функция для получения статуса маршрута
  const getCardRouteStatus = (item: RouterListItem) => {
    const status = getCardStatus(item.status);
    return status === 'basic' && !item.start ? 'control' : status;
  };

  // Функция для рендеринга карточки маршрута 
  const renderItemCard = ({ item }: { item: RouterListItem }) => (
    <Card
      style={styles.containerCards}
      header={() => renderCardHeader(item)}
      status={getCardRouteStatus(item)}
      onPress={() => navigation.navigate('RouteScreen', { ...item })}
    >
      <View style={styles.textBodyCardWithLeftView}>
        {renderItemLeft(item)}
        <View style={styles.containerCardText}>
          {Object.values(item.descriptions).map((description: string, index: number) => (
            <Text key={index} category="c2" style={{ fontSize: 11 }}>
              {' '}
              • {description}
            </Text>
          ))}
        </View>
      </View>
    </Card>
  );

  // Функция для рендеринга заголовка карточки
  const renderCardHeader = (item: RouterListItem) => (
    <View style={[styles.textHeaderCard, { padding: 10 }]}>
      <Icon
        name="car-outline"
        width={20}
        height={20}
        style={styles.textHeaderCardIcon}
      />
      <Text category="label" style={{ flex: 1, fontSize: 14 }}>
        {item.name}
      </Text>
    </View>
  );

  // Функция для рендеринга времени загрузки
  const renderItemLeft = (item: RouterListItem) => (
    <View style={styles.textTimeLeft}>
      <Layout>
        <Text category="s1" style={{ textAlign: 'center', fontSize: 12 }}>
          {item?.loading_time}
        </Text>
      </Layout>
      <Layout>
        <Text category="c2" style={{ textAlign: 'center', fontSize: 10 }}>
          {item?.loading_date}
        </Text>
      </Layout>
    </View>
  );

  // Функция для отображения текущего маршрута
  const renderCurrentRouteTextIcon = () => (
    <View style={styles.currentRouteContainer}>
      <Icon
        name="corner-right-down-outline"
        width={20}
        height={20}
        style={styles.textHeaderCardIcon}
      />
      <Text category="label" style={styles.titleList}>
        Текущий маршрут
      </Text>
    </View>
  );

  return (
    <SafeAreaView>
      {pending && (
        <View style={styles.spinnerContainer}>
          <Spinner size="giant" status="basic" />
        </View>
      )}
      <View style={styles.backgroundContainer}>
        <Image
          source={require('../img/pattern.png')}
          style={styles.background as ImageStyle}
        />
      </View>

      {startGeo && renderCurrentRouteTextIcon()}
      <FlatList
        style={styles.containerFlatList}
        data={filteredData}
        renderItem={renderItemCard}
        keyExtractor={item => item.uid}
        onEndReachedThreshold={0.5}
        onEndReached={onRefresh}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
