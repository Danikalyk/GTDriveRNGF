import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  Card, Layout, Text, Toggle, BottomNavigation, BottomNavigationTab, Icon,
  Modal, Button, Spinner, Divider
} from '@ui-kitten/components';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { View, Alert, Image, FlatList, Dimensions  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NetInfo from '@react-native-community/netinfo';
import useSWR, { useSWRConfig } from 'swr';
import { getToggleCardStatus, getDataPostRoute, getDateFromJSON } from '../components/functions.js';
import { postRoute } from '../api/routes';
import { getReq } from '../api/request';
import FunctionQueue from '../utils/FunctionQueue.js';
import { styles } from '../styles';
import AddPhoto from '../components/AddPhoto/AddPhoto';
import { RouterListItem } from '../types';

// Инициализация очереди функций
const queue = new FunctionQueue();

type Props = {};

const TaskOrderScreen = ({ route, navigation  }) => {
  const { Navigator, Screen } = createBottomTabNavigator();
  const { cache } = useSWRConfig();
  const getCachedData = key => cache.get(key); // Получаем кэшированные данные
  
  // Управление состояниями компонента
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(true);
  const [modalContent, setModalContent] = useState(null);
  const [title, setTitle] = useState('');

  // Получаем ширину экрана - 20 пикселей
  const screenWidth = Dimensions.get('window').width;
  const modalWidth = screenWidth - 20;

  // Деструктуризация параметров маршрута
  const { uid, uidOrder, uidPoint } = route.params || {};
  const order = route?.params || [];
  const tasks = order.tasks || [];
  const canFinishOrder = tasks.every(task => task.status === 3); // Проверка, могут ли все задачи быть завершены
  const taskFinished = route?.params?.status === 3; // Проверка завершенности задачи

  // Получение данных маршрута с использованием SWR
  const { data: routeData, mutate, error } = useSWR(
    `/route/${uid}`,
    () => getReq(`/route/${uid}`).then(res => res.data),
    { fallbackData: getCachedData(`/route/${uid}`) }
  );

  // Обработка ошибки и подстановка кэшированных данных
  if (error && !routeData) {
    mutate(`/route/${uid}`, getCachedData(`/route/${uid}`), false);
  }

  // Эффект для установки состояния "не в ожидании" после первоначальной загрузки
  useEffect(() => {
    setPending(false);
  }, []);

  // Установка заголовка навигации при изменении параметров маршрута
  useLayoutEffect(() => {
    const newTitle = `Задачи по заказу ${order?.name || ''}`;
    navigation.setOptions({ title: newTitle });
  }, [navigation, order?.name]);

  // Функция для обновления данных
  const updateData = async (data, callback = () => {}) => {
    const netInfo = await NetInfo.fetch();

    // Мутация данных с изменениями
    mutate(currentData => {
      const updatedData = { ...currentData };
      // код для изменения
      
      return updatedData;
    }, false);

    // Функция коллбэк для выполнения после обновления данных
    const callbackFunc = async () => {
      await callback();
    };

    // Очередь выполнения функций в зависимости от состояния сети
    if (!netInfo.isConnected) {
      queue.enqueue(callbackFunc);
    } else {
      callbackFunc();
    }
    
    setPending(false);
  };

  // Функция для создания данных отправления
  const createPostData = (screen, additionalData = {}) => JSON.stringify({
    ...getDataPostRoute(),
    screen,
    uidOrder: uidOrder,
    ...additionalData,
  });

  // Функция для завершения текущего заказа
  const finishCurrentOrder = async () => {
    const data = createPostData(2, { type: order.type, point: 0, uidPoint: uidPoint });
    updateData(data, async () => {
      await postRoute(uid, data);
      navigation.goBack({ post: true });
    });
  };

  // Функция для отправки времени карты на сервер
  const putTimeCardToServer = async (item) => {
    setVisible(false);
    setPending(true);

    await new Promise(resolve => setTimeout(resolve, 0));

    const data = createPostData(3, { uidTask: item.uidTask });
    updateData(data, async () => {
      await postRoute(uid, data);
      mutate();
    });
  };

  // Функция для рендера заголовка карточки задачи
  const renderCardHeader = item => (
    <Layout>
      <View style={styles.textHeaderCardOrder}>
        <View style={styles.textHeaderCard}>
          <Icon name="bulb-outline" width={23} height={23} style={{ marginRight: 5 }} />
          <Text category="label" style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', fontSize: 14 }}>
            {item?.name}
          </Text>
        </View>
      </View>
    </Layout>
  );

  // Функция для рендера карточки завершения заказа
  const renderFinishOrderCard = () => (
    <Layout style={{ marginHorizontal: 5, marginTop: 5 }}>
      <Card style={[styles.containerCards, { paddingHorizontal: 25, paddingVertical: 15 }]} appearance='outline' status='basic'>
        <Button
          accessoryLeft={<Icon name="checkmark-square-outline" />}
          onPress={finishCurrentOrder}
          appearance="filled"
          status='basic'
        >
          Зафиксировать время заказа
        </Button>
      </Card>
    </Layout>
  );

  // Функция для рендера футера модального окна
  const footerModal = item => (
    <Layout level="1">
      <Button
        style={styles.buttonModal}
        appearance="filled"
        status='basic'
        accessoryLeft={<Icon name="checkmark-square-outline" fill="#FFFFFF" />}
        onPress={() => putTimeCardToServer(item)}
      >
        Зафиксировать
      </Button>
    </Layout>
  );

  // Функция для рендера заголовка модального окна
  const headerModal = () => (
    <Layout style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
      <Icon name="bulb-outline" width={23} height={23} />
      <Text category="s1" style={styles.textHeaderCard}>Необходимо зафиксировать</Text>
    </Layout>
  );

  // Обработчик нажатия на карточку заказа
  const onPressCardOrder = item => {
    const toggleStatus = getToggleCardStatus(item);

    if (toggleStatus) {
      Alert.alert('Задача уже зафиксирована');
      return;
    }

    setModalContent(
      <Card
        style={[styles.containerCards, { borderWidth: 0, width: modalWidth }]}
        disabled={true}
        status="basic"
        header={headerModal}
        footer={footerModal(item)}
      >
        <View style={{ padding: 10 }}>
          <Text category="h6">{item.name}</Text>
        </View>
      </Card>
    );

    setVisible(true);
  };

  // Функция для рендера карточки задачи
  const renderCardTask = ({ item }) => {
    const finishedTask = item.status === 3;

    return (
      <View>
        <Card
          style={styles.containerCards}
          header={renderCardHeader(item)}
          status={finishedTask ? 'success' : 'primary'}
          onPress={() => onPressCardOrder(item)}
        >
          {renderCardTaskText(item)}
        </Card>
      </View>
    );
  };

  // Функция для рендера текста в карточке задачи
  const renderCardTaskText = item => {
    const statusToggle = getToggleCardStatus(item);
    const timeFix = item.status === 3 ? getDateFromJSON(item.date) : null;

    return (
      <Layout style={styles.textBodyCardWithLeftView}>
        <Toggle
          style={styles.textTimeLeft}
          //disabled={statusToggle}
          checked={statusToggle}
          onChange={() => onPressCardOrder(item)}
        />

        <View style={styles.containerCardText}>
          <Text category="c2">{item.description}</Text>
          {item?.status === 3 && (
            <View style={{ paddingTop: 5 }}>
              <Divider />
              <Text category="c2">Дата фиксации: {timeFix}</Text>
            </View>
          )}
        </View>
      </Layout>
    );
  };

  // Вкладка "Задачи"
  const TasksOrderScreen = () => (
    <SafeAreaView style={{ flex: 1 }}>
      {pending && !taskFinished && (
        <View style={styles.spinnerContainer}>
          <Spinner size="giant" status='basic' />
        </View>
      )}

      <View style={styles.backgroundContainer}>
        <Image source={require('../img/pattern.png')} style={styles.background} />
      </View>

      {canFinishOrder && !taskFinished && renderFinishOrderCard()}

      <FlatList
        style={[styles.containerFlatList, { marginTop: 5 }]}
        data={tasks}
        keyExtractor={(item, index) => item.uidTask || index.toString()}
        renderItem={renderCardTask}
      />

      {renderModalWindow()}
    </SafeAreaView>
  );

  // Функция для рендера модального окна
  const renderModalWindow = () => (
    <Modal visible={visible} backdropStyle={styles.backdrop} onBackdropPress={() => setVisible(false)}>
      {modalContent}
    </Modal>
  );

  // Вкладка "Фото"
  const PhotoScreen = () => (
    <SafeAreaView style={{ flex: 1 }}>
      {pending && (
        <View style={styles.spinnerContainer}>
          <Spinner size="giant" />
        </View>
      )}

      <View style={styles.backgroundContainer}>
        <Image source={require('../img/pattern.png')} style={styles.background} />
      </View>

      {!taskFinished ? (
        <Layout>
          <ScrollView contentContainerStyle={styles.wrap}>
            <AddPhoto route={route} navigation={navigation} />
          </ScrollView>
        </Layout>
      ) : (
        <Card style={styles.containerCard}>
          <Text category="label" style={styles.titleList}>
            <Icon name="alert-circle-outline" width={20} height={20} style={styles.textHeaderCardIcon} />
            Фотографии можно сделать только на активном маршруте
          </Text>
        </Card>
      )}
    </SafeAreaView>
  );

  // Навигация между вкладками
  const TabNavigator = () => (
    <Navigator tabBar={props => <BottomTabBar {...props} />}>
      <Screen name="Задачи" component={TasksOrderScreen} options={{ headerShown: false }} />
      <Screen name="Фото" component={PhotoScreen} options={{ headerShown: false }} />
    </Navigator>
  );

  // Нижняя панель навигации
  const BottomTabBar = ({ navigation, state }) => {
    const handleTabSelect = (index) => {
      const nameTab = state.routeNames[index];
      const newTitle = nameTab === 'Задачи'
        ? `Задачи по заказу ${order?.name || ''}`
        : `Фото по задачам заказа ${order?.name || ''}`;
      
      setTitle(newTitle);
      navigation.navigate(nameTab);
    };

    return (
      <BottomNavigation selectedIndex={state.index} onSelect={handleTabSelect}>
        <BottomNavigationTab title="Задачи" icon={<Icon name="bookmark-outline" />} />
        <BottomNavigationTab title="Фото" icon={<Icon name="camera-outline" />} />
      </BottomNavigation>
    );
  };

  return (
    <NavigationContainer independent={true}>
      <TabNavigator />
    </NavigationContainer>
  );
};

export default TaskOrderScreen;
