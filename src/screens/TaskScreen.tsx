import {
  Button,
  Layout,
  Text,
  ButtonGroup,
  Icon,
  List,
  Divider,
  Card,
  Toggle,
  Modal,
  BottomNavigation, 
  BottomNavigationTab
} from '@ui-kitten/components';
import {
  getCardStatus,
  getToggleCardStatus,
  getDataPostRoute,
  getDateFromJSON,
} from '../components/functions.js';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import AddPhoto from '../components/AddPhoto/AddPhoto';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Alert, Linking, View } from 'react-native';
import { openAddressOnMap } from '../utils/openAddressOnMap';
import { RouterListItem } from '../types';
import { postRoute } from '../api/routes';
import { ScrollView } from 'react-native-gesture-handler';
import useSWR from 'swr';
import find from 'lodash/find';
import AccidentScreen from './AccidentScreen';
import { styles } from '../styles';

type Props = {};

const RouteScreen = (props: Props) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [modalContent, setModalContent] = React.useState(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const { Navigator, Screen } = createBottomTabNavigator();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);



  const propsParams = props?.route?.params;

  // const orders = props?.route?.params.orders;
  const uid = propsParams.uid;
  const uidPoint = propsParams.uidPoint;

  const {
    data: route,
    isLoading,
    mutate,
    error,
  } = useSWR(`/route/${uid}`, () => getRoute(uid));


  const point = find(route?.points, { uidPoint: uidPoint });
  const orders = point?.orders;


  const params = {
    ...route,
    orders,
    uidPoint
  }

  // ---------- Открытие модального окна происшествия ----------

  const [visibleAccident, setVisibleAccident] = React.useState(false);

  const handleCloseAccidentModal = () => {
    setVisibleAccident(false);
  }


  // ---------- Открытие навигатора ----------

  const handleOpenNavigator = async () => {
    const url = `yandexnavi://build_route_on_map?lat_to=${params.lat}&lon_to=${params.lon}`;

    openAddressOnMap('', params.lat, params.lon);

    // const supportedYa = await Linking.canOpenURL(url)
    //   .then(supported => supported)
    //   .catch(err => Alert.alert('Ошибка', err.toString()));
    const supportedGoogleMaps = await Linking.canOpenURL(urlAndroidMap)
      .then(supported => supported)
      .catch(err => Alert.alert('Ошибка', err.toString()));

    // if (supportedYa) {
    //   Linking.openURL(url);

    //   return;
    // }

    if (supportedGoogleMaps) {
      Linking.openURL(urlAndroidMap);

      return;
    }

    // Alert.alert('Ошибка', 'Пожалуйста, установите Яндекс Навигатор или ');
  };

  const onSelect = index => {
    setSelectedIndex(index);
  };


  // ---------- Верхняя карточка ----------

  const renderMainCard = params => {
    return (
      <Layout>
        <Card
          status="danger"
          header={renderMainCardHeader(params)}
          footer={renderMainCardFooter(params)}
          style={styles.containerCards}>

          {renderMainCardButtons(params)}
        </Card>

        <View>
          <Text category="h6" style={styles.titleList}>
            Действия
          </Text>
        </View>
      </Layout>
    );
  };

  const renderMainCardHeader = item => {
    return (
      <Layout style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <View style={styles.textHeaderCard}>
          <Icon name="pin-outline" width={23} height={23} style={styles.textHeaderCardIcon}></Icon>
          <Text category="h6" style={styles.textHeaderCard}>{item?.address}</Text>
        </View>
      </Layout>
    );
  };

  const renderMainCardButtons = item => {
    return (
      <ButtonGroup
        selectedIndex={selectedIndex}
        onSelect={onSelect}
        style={styles.buttonGroup}
        size="medium">
        <Button
          key={1}
          onPress={() => openPhoneWithNumber('79222965859')}
          accessoryLeft={<Icon name="phone" />}
        />
        <Button
          key={2}
          onPress={() => openTelegramWithNumber('79222965859')}
          accessoryLeft={<Icon name="message-square" />}
        />
        <Button
          key={3}
          //onPress={() => props.navigation.navigate('AccidentScreen', {...item})}
          onPress={() => setVisibleAccident(true)}
          accessoryLeft={<Icon name="alert-circle" />}
        />
        <Button
          key={4}
          onPress={() =>
            props.navigation.navigate('TaskPhotoScreen', { ...item })
          }
          accessoryLeft={<Icon name="camera" />}
        />
      </ButtonGroup>
    );
  };

  const openTelegramWithNumber = phoneNumber => {
    Linking.openURL(`https://t.me/${phoneNumber}`);
  };

  const openPhoneWithNumber = phoneNumber => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  // ---------- Кнопки ----------

  const renderButtonStartPoint = () => {
    return (
      <View>
        <Button style={{}} onPress={startCurrentPoint}>
          Начать следование
        </Button>
      </View>
    );
  };

  const renderButtonOpenNavigator = () => {
    return (
      <View>
        <Button style={{}} onPress={handleOpenNavigator}>
          Открыть в навигаторе
        </Button>
      </View>
    );
  };

  const renderButtonFinishPoint = () => {
    return (
      <View>
        <Button style={{}} onPress={finishCurrentPoint}>
          Завершить точку
        </Button>
      </View>
    );
  };

  const renderMainCardFooter = params => {
    allOrderFinished = !!params.orders && params.orders.every(order => order.status === 3);

    if (params.point === 0) {

      renderButtonFinishPoint();
      //-- ЭтоТочка
      if (params.status === 0) {
        return renderButtonStartPoint();
      } else if (params.status === 1) {
        return renderButtonOpenNavigator();
      } else if (params.status === 2 && allOrderFinished) {
        return renderButtonFinishPoint();
      }
    } else if (params.point === 1) {
      //-- ЭтоСклад
      if (params.status === 1) {
        return renderButtonOpenNavigator();
      } else if (params.status === 2 && allOrderFinished) {
        return renderButtonFinishPoint();
      }
    }
  };

  // ---------- Карточки заказов ----------

  const footerModal = item => (
    <Layout style={{}} level="1">
      <Button
        style={styles.buttonModal}
        status="primary"
        accessoryLeft={<Icon name='checkmark-square-outline' />}
        onPress={() => putTimeCardToServer(item)}>
        Зафиксировать
      </Button>
    </Layout>
  );

  const onPressCardOrder = item => {
    if (params.status === 0 || (item.status !== 1 && params.orders[0].status !== 3)) {
      Alert.alert('Необходимо начать следование или зафиксировать прибытие');
      return;
    }

    toggleStatus = getToggleCardStatus(item);

    if (toggleStatus || item.tasks.length === 0 || item.tasks.every(task => task.status === 3)) {
      setModalContent(
        <Card
          style={{ padding: 5 }}
          disabled={true}
          status='danger'
          footer={footerModal(item)}
        >
          <Text category='s1'>
            Необходимо зафиксировать время отгрузки заказа
          </Text>
          <Text category='h6'>
            {item.name}
          </Text>
        </Card>
      );

      setVisible(true);
    } else {
      props.navigation.navigate('TaskOrderScreen', { ...item });
    }
  };

  const renderCardOrder = ({ item, index, }: { item: RouterListItem; index: number; }): React.ReactElement => (
    <Card
      style={styles.containerCards}
      status={getCardStatus(item.status)}
      header={() => renderCardOrderName(item)}
      onPress={() => onPressCardOrder(item)}
    >
      {renderCardOrderText(item)}
    </Card>
  );

  const renderCardOrderText = item => {
    const typeName = item.type !== 1 ? "Время прибытия:" : "Время фиксации:";
    const formattedDate = item.type !== 4 && getToggleCardStatus(item) ? getDateFromJSON(item.date) : null;

    let content;
    if (item.type !== 4) {
      if (formattedDate) {
        content = (
          <Text category="c2">{typeName} {formattedDate}</Text>
        );
      } else {
        content = (
          <Text category="c2">Необходимо зафиксировать время</Text>
        );
      }
    } else {
      content = (
        <>
          <Text category="c2">Объем = {`${item.weight}`}</Text>
          <Text category="c2">Вес = {`${item.volume}`}</Text>
        </>
      );
    }

    return (
      <Layout style={styles.textBodyCardWithLeftView}>
        <Toggle checked={getToggleCardStatus(item)}></Toggle>
        <View style={styles.containerCardText}>
          {content}
        </View>
      </Layout>
    );
  };

  const renderCardOrderName = (item: RouterListItem) => {
    const hasTasks = item.tasks.length !== 0;

    return (
      <View style={styles.textHeaderCardOrder}>
        <View style={styles.textHeaderCard}>
          {renderCardOrderIcon(item.type)}

          <Text category="h6" style={styles.cardName}>
            {item.name}
          </Text>
        </View>

        {hasTasks && (
          <Icon
            name="alert-circle-outline"
            width={24}
            height={24}
            style={{ color: 'red' }}
          />
        )}
      </View>
    );
  };

  const renderCardOrderIcon = type => {
    const iconNames = {
      1: "compass-outline",
      2: "download-outline",
      3: "file-text-outline",
      4: "bookmark-outline"
    };

    const iconName = iconNames[type] || "file-outline";

    return (
      <Icon
        name={iconName}
        width={23}
        height={23}
        style={styles.textHeaderCardIcon}
      />
    );
  };


  // ---------- Запросы к серверу ----------

  const startCurrentPoint = async () => {
    let data = getDataPostRoute();
    data.screen = 2;
    data.type = 5;
    data.point = point.point;
    data.uidPoint = point.uidPoint;

    data = JSON.stringify(data);

    const res = await postRoute(uid, data);

    mutate();
  };

  const finishCurrentPoint = async () => {
    let data = getDataPostRoute();
    data.screen = 2;
    data.type = 6;
    data.point = point.point;
    data.uidPoint = point.uidPoint;

    data = JSON.stringify(data);

    await postRoute(uid, data);

    mutate();
  };

  const putTimeCardToServer = async (item) => {
    let data = getDataPostRoute();
    data.screen = 2;
    data.type = item.type;
    data.point = point.point;
    data.uidPoint = point.uidPoint;
    data.uidOrder = item.uidOrder;

    data = JSON.stringify(data);

    await postRoute(uid, data);

    setVisible(false);

    mutate();
  };

  // ---------- Модальное окно ----------

  const renderModalWindow = () => {
    return (
      <Modal
        visible={visible}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => setVisible(false)}>
        {modalContent}
      </Modal>
    );
  };

    const TasksScreen = () => (
      <SafeAreaView style={{ flex: 1 }}>
      <List
        style={{}}
        data={orders}
        ListHeaderComponent={renderMainCard(point)}
        renderItem={renderCardOrder}
      />

      {renderModalWindow()}

      <AccidentScreen
        visibleAccident={visibleAccident}
        data={orders}
        onClose={handleCloseAccidentModal}
      />
    </SafeAreaView>
  );

  const PhotoScreen = () => (
    /*<SafeAreaView style={{ flex: 1 }}>
        <Layout>
            <ScrollView contentContainerStyle={styles.wrap}>
                <Text category="h6" style={styles.titleList}>
                    Добавить фото
                </Text>

                <AddPhoto {...props} />
            </ScrollView>
        </Layout>
    </SafeAreaView>*/
    <View>
      <Text>123</Text>
    </View>
  );

   const TabNavigator = () => (
        <Navigator tabBar={props => <BottomTabBar {...props} />}>
            <Screen
                name='Действия'
                component={TasksScreen}
                options={{ headerShown: false }}
            />
            <Screen
                name='Фото'
                component={PhotoScreen}
                options={{ headerShown: false }}
            />
        </Navigator>
    );

  const BottomTabBar = ({ navigation, state }) => (
    <BottomNavigation
        selectedIndex={state.index}
        onSelect={index => navigation.navigate(state.routeNames[index])}>
        <BottomNavigationTab
            title='Задачи'
            icon={<Icon {...props} name='bookmark-outline' />}
        />
        <BottomNavigationTab
            title='Фото'
            icon={<Icon {...props} name='camera-outline' />}
        />
    </BottomNavigation>
);

  // ---------- Отрисовка ----------
  return (
    <NavigationContainer independent={true}>
      <TabNavigator />
    </NavigationContainer>
  );
};

export default RouteScreen;
