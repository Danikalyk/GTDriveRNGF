import React, { useContext, useCallback, useEffect, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Divider, Icon, Layout, List, Text } from '@ui-kitten/components';
import { GlobalState } from '../store/global/global.state';
import { UserContext } from '../store/user/UserProvider';
import { getRoutes } from '../api/routes';
import { RouterListItem } from '../types';
import { getCardStatus } from '../components/functions';
import { styles } from '../styles';
import useSWR from 'swr';

const HomeScreen = (props) => {
  const [startGeo, setStartGeo] = useState(false);
  const { currentUser, currentRoute, setRoute } = useContext(UserContext);
  const context = useContext(GlobalState);
  const { data: routes, mutate } = useSWR(`/routes?user=${currentUser}`, () => getRoutes(currentUser)); 

  const onRefresh = useCallback(() => {
    mutate(); // Обновление данных
  }, [mutate]);

  const renderItemCard = ({ item }) => (
    <Card
      style={styles.containerCards}
      header={() => renderCardHeader(item)}
      status={getCardStatus(item.status)}
      onPress={() => props.navigation.navigate('RouteScreen', { ...item })}
    >
      <View style={styles.textBodyCardWithLeftView}>
        {renderItemLeft(item)}
        <Text category="c2">{item?.description}</Text>
      </View>
    </Card>
  );

  const renderCardHeader = (item) => (
    <Layout>
      <View style={styles.textHeaderCard}>
        <Icon name="car-outline" width={23} height={23} style={styles.textHeaderCardIcon}></Icon>
        <Text category="h6">{item.name}</Text>
      </View>
    </Layout>
  );

  const renderItemLeft = (item) => (
    <View style={styles.textTimeLeft}>
      <Layout>
        <Text category="s1" style={{ textAlign: 'center' }}>
          {item?.loading_time}
        </Text>
      </Layout>
      <Layout>
        <Text category="c2" style={{ textAlign: 'center' }}>
          {item?.loading_date}
        </Text>
      </Layout>
    </View>
  );

  //-- Если нет активных маршрутов, то удаляем все фото
  async function deleteAllSavedPhotos() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const savedPhotosKeys = keys.filter(key => key.startsWith('savedPhotos_'));
      await AsyncStorage.multiRemove(savedPhotosKeys);
      console.log('Все фотографии успешно удалены.');
    } catch (error) {
      console.log('Ошибка при удалении фотографий:', error);
    }
  }

  useEffect(() => {
    const hasStartGeo = routes && routes.some(route => route.start === true);
    if (hasStartGeo && !startGeo) {
      const startRoute = routes.find(route => route.start === true); 
      const uid = startRoute.uid; 

      console.log({startRoute}, startRoute);

      setRoute(uid);
      context.enableGeo(); 
      setStartGeo(true);
    }
  }, [routes, context, startGeo]);

  return (
    <SafeAreaView>
      <List
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
        style={{}}
        data={routes}
        renderItem={renderItemCard}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;