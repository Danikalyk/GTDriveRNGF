import React, { useContext, useCallback, useEffect, useState } from 'react';
import { RefreshControl, View, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Divider, Icon, Layout, List, Text, Button } from '@ui-kitten/components';
import { GlobalState } from '../store/global/global.state';
import { UserContext } from '../store/user/UserProvider';
import { getRoutes } from '../api/routes';
import { RouterListItem } from '../types';
import { getCardStatus, getNewAppVersion } from '../components/functions';
import { styles } from '../styles';
import useSWR from 'swr';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = (props) => {
  const [startGeo, setStartGeo] = useState(false);
  const { currentUser, currentRoute, setRoute } = useContext(UserContext);
  const context = useContext(GlobalState);
  const { data: routes, mutate } = useSWR(`/routes?user=${currentUser}`, () => getRoutes(currentUser)); 
  const [startRoute, setStartRoute] = useState(null);
  //const [sortRoutes, setSortRoutes] = useState([]);
 // const [updatedRoutes, setRoutes] = useState([]); 

  const onRefresh = useCallback(() => {
    mutate(); // Обновление данных
  }, [mutate]);
  
  const handleLongPress = (item) => {
    console.log('Вызвано сообщение об удалении элемента');
    Alert.alert(
      'Удаление элемента',
      'Вы уверены, что хотите удалить этот элемент?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', onPress: () => handleDeleteItem(item) }
      ]
    );
  }

  const handleDeleteItem = (item) => {
    // Обновление списка routes, исключая удаленный элемент
    //const updatedRoutes = routes.filter(route => route.uid !== item.uid);
    //setRoutes(updatedRoutes);

    //mutate();
    
    console.log('Элемент успешно удален', routes);
  }

  useEffect(() => {
    const hasStartGeo = routes && routes.some(route => route.start === true);
    setStartRoute(hasStartGeo);

    if (hasStartGeo && !startGeo) {
      const startRoute = routes.find(route => route.start === true); 
      const uid = startRoute.uid; 
      
      setRoute(uid);
      context.enableGeo(); 
      setStartGeo(true);
    }
  }, [routes, context, startGeo]);

  const getCardRouteStatus= (item) => {
    let status = getCardStatus(item.status);
    
    if (status === "info" && item.start  === false){
      status = 'basic';
    }

    return status;
  }

  const renderItemCard = ({ item }) => {
    return (
      <Card
        style={styles.containerCards}
        header={() => renderCardHeader(item)}
        status={getCardRouteStatus(item)}
        onPress={() => props.navigation.navigate('RouteScreen', { ...item })}
        onLongPress={() => handleLongPress(item)}
      >
        <View style={styles.textBodyCardWithLeftView}>
          {renderItemLeft(item)}
          <Text category="c2">{item?.description}</Text>
        </View>
      </Card>
    )
  };

  const renderCardHeader = (item) => (
    <View style={[styles.textHeaderCard, { padding: 10 }]}>
        <Icon name="car-outline" width={23} height={23} style={styles.textHeaderCardIcon}></Icon>
        <Text category='label' style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', fontSize: 14 }}>{item.name}</Text>
    </View>
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
      await AsyncStorage.clear();
      /*сonst keys = await AsyncStorage.getAllKeys();
      const savedPhotosKeys = keys.filter(key => key.startsWith('savedPhotos_'));
      await AsyncStorage.multiRemove(savedPhotosKeys);
      console.log('Все фотографии успешно удалены.');*/
    } catch (error) {
      console.log('Ошибка при удалении фотографий:', error);
    }
  }

  //deleteAllSavedPhotos();

  async function checkNewVersion() {
    const newversion = getNewAppVersion();

    console.log(newversion);
  }

  return (
    <SafeAreaView>
      <Button onPress={() => checkNewVersion()}>
        Проверка
      </Button>

      {startRoute && 
      <Text category="label" style={styles.titleList}>
        <Icon name="corner-right-down-outline" width={20} height={20} style={styles.textHeaderCardIcon}></Icon>
        Текущий маршрут
      </Text>}
          
      <FlatList
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
        style={{}}
        data={routes}
        renderItem={renderItemCard}
        keyExtractor={(item) => item.uid}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;