//-- 20241021
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { RefreshControl, View, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Icon, Layout, Text, Spinner } from '@ui-kitten/components';
import { GlobalState } from '../store/global/global.state';
import { UserContext } from '../store/user/UserProvider';
import { getRoutes } from '../api/routes';
import { getCardStatus, addGeofenceToNextPoint, deleteAllGeofences } from '../components/functions';
import { styles } from '../styles';
import useSWR, { useSWRConfig } from 'swr';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

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
      deleteSavedPhotos();

      if (!renderComplete) {
        setRenderComplete(true);
        const hasStartGeo = routes.some(route => route.start === true);
        setStartGeo(hasStartGeo);

        if (hasStartGeo) {
          const startRoute = routes.find(route => route.start === true);
          setRoute(startRoute.uid);
          context.enableGeo();
          addGeofencesToRoute(startRoute);
        } else {
          resetGeofences();
        }
      }
    }

    const unsubscribe = navigation.addListener('focus', () => {
      mutate();
    });

    return unsubscribe;
  }, [navigation, routes, context, startGeo, renderComplete]);

 
  

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

  // Функция для фильтрации и сортировки данных
  const filteredData = routes?.filter(route => route.start || route.status)
    .sort((a, b) => (b.start - a.start) || (a.status - b.status));

  // Функция для получения статуса маршрута
  const getCardRouteStatus = (item) => {
    let status = getCardStatus(item.status);
    return (status === 'info' && !item.start) ? 'control' : status;
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

  // Функция для удаления сохраненных фотографий
  const deleteSavedPhotos = async () => {
    const keys = await AsyncStorage.getAllKeys();
    const savedPhotosKeys = keys.filter(uid => uid.startsWith('savedPhotos_'));
    const validUids = filteredData.map(item => item.uid);
    const keysToRemove = savedPhotosKeys.filter(key => !validUids.includes(key.replace('savedPhotos_', '')));
    await AsyncStorage.multiRemove(keysToRemove);
  };

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
