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
  BottomNavigationTab,
} from '@ui-kitten/components';
import {
  getCardStatus,
  getToggleCardStatus,
  getDataPostRoute,
  getDateFromJSON,
} from '../components/functions.js';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
//import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import AddPhoto from '../components/AddPhoto/AddPhoto';
import {SafeAreaView} from 'react-native-safe-area-context';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Alert, Linking, View} from 'react-native';
import {openAddressOnMap} from '../utils/openAddressOnMap';
import {RouterListItem} from '../types';
import {postRoute} from '../api/routes';
import {ScrollView} from 'react-native-gesture-handler';
import useSWR from 'swr';
import find from 'lodash/find';
import AccidentScreen from './AccidentScreen';
import {styles} from '../styles';
import {useNavigation} from '@react-navigation/native';
import {navigate} from '../RootNavigation.js';

//type Props = {};

const RouteScreen = (props: Props) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [modalContent, setModalContent] = React.useState(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const {Navigator, Screen} = createBottomTabNavigator();
  const [nextPointDrive, setNextPointDrive] = React.useState(false);
  const navigation = useNavigation();

  const propsParams = props?.route?.params;
  const uid = propsParams.uid;
  const uidPoint = propsParams.uidPoint;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const {
    data: route,
    isLoading,
    mutate,
    error,
  } = useSWR(`/route/${uid}`, () => getRoute(uid));

  const points = route?.points;
  const point = find(points, {uidPoint: uidPoint});
  const orders = point?.orders;
  const params = {
    ...route,
    orders,
    uidPoint,
    points,
  };

  // ---------- Открытие модального окна происшествия ----------

  const [visibleAccident, setVisibleAccident] = React.useState(false);

  const handleCloseAccidentModal = () => {
    setVisibleAccident(false);
  };

  // ---------- Открытие навигатора ----------

  const handleOpenNavigator = async (params) => {
    

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
    const currentPoint = params.status === 1 || params.status === 2;
    
    return (
      <Layout>
        {currentPoint && (
          <Text category="label" style={styles.titleList}>
            <Icon
              name="corner-right-down-outline"
              width={20}
              height={20}
              style={styles.textHeaderCardIcon}></Icon>
            Текущая точка следования
          </Text>
        )}

        <Card
          status={currentPoint ? 'danger' : 'success'}
          header={renderMainCardHeader(params)}
          footer={renderMainCardFooter(params)}
          style={styles.containerCards}>
          {renderMainCardButtons(params)}
        </Card>

        {renderNextPointCard()}

        <View>
          <Text category="label" style={styles.titleList}>
            <Icon
              name="flash-outline"
              width={20}
              height={20}
              style={styles.textHeaderCardIcon}></Icon>
            Действия
          </Text>
        </View>
      </Layout>
    );
  };

  const renderMainCardHeader = item => {
    return (
      <Layout style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
        <View style={styles.textHeaderCard}>
          <Icon
            name="pin-outline"
            width={23}
            height={23}
            style={styles.textHeaderCardIcon}></Icon>
          <Text category="h6" style={styles.textHeaderCard}>
            {item?.address}
          </Text>
        </View>
      </Layout>
    );
  };

  const renderMainCardButtons = item => {
    return (
      <ButtonGroup
        selectedIndex={selectedIndex}
        onSelect={onSelect}
        style={{flex: 1, justifyContent: 'space-between', flexDirection: 'row'}}
        appearance="outline"
        status="control"
        size="medium">
        <Button
          key={1}
          onPress={() => openPhoneWithNumber('79222965859')}
          accessoryLeft={<Icon name="phone" />}
          style={{backgroundColor: '#0088cc', marginRight: 0, flex: 1}}
        />
        <Button
          key={2}
          onPress={() => openTelegramWithNumber('79222965859')}
          accessoryLeft={<Icon name="message-circle-outline" />}
          style={{backgroundColor: '#0088cc', marginRight: 0, flex: 1}}
        />
        <Button
          key={3}
          onPress={() => openWhatsAppWithNumber('79222965859')}
          accessoryLeft={<Icon name="message-circle-outline" />}
          style={{backgroundColor: '#43d854', marginRight: 0, flex: 1}}
        />
        <Button
          key={4}
          onPress={() => setVisibleAccident(true)}
          accessoryLeft={<Icon name="alert-circle" />}
          style={{backgroundColor: '#B00000', marginRight: 0, flex: 1}}
        />
      </ButtonGroup>
    );
  };

  const openTelegramWithNumber = phoneNumber => {
    Linking.openURL(`https://t.me/${phoneNumber}`);
  };

  const openWhatsAppWithNumber = phoneNumber => {
    Linking.openURL(`https://wa.me/${phoneNumber}`);
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

  const renderButtonOpenNavigator = (params) => {
    return (
      <View>
        <Button style={{}} onPress={() => handleOpenNavigator(params)}>
          Открыть в навигаторе
        </Button>
      </View>
    );
  };

  const renderButtonFinishPoint = () => {
    return (
      <View>
        <Button
          style={{}}
          onPress={finishCurrentPoint}
          accessoryLeft={<Icon name="flag" />}>
          Завершить точку
        </Button>
      </View>
    );
  };

  const renderButtonCompletePoint = () => {
    return (
      <View>
        <Button
          style={{}}
          appearance="outline"
          status="success"
          accessoryLeft={<Icon name="checkmark-circle-2-outline" />}
          onPress={() =>
            Alert.alert(
              'Точка завершена в ' + point.time_fact + ' / ' + point.date_fact,
            )
          }>
          Точка завершена
        </Button>
      </View>
    );
  };

  const renderMainCardFooter = params => {
    if (params.status === 3) {
      return renderButtonCompletePoint();
    }

    allOrderFinished =
      !!params.orders && params.orders.every(order => order.status === 3);

    if (params.point === 0) {
      //-- ЭтоТочка
      if (params.status === 0) {
        return renderButtonStartPoint();
      } else if (params.status === 1) {
        return renderButtonOpenNavigator(params);
      } else if (params.status === 2 && allOrderFinished) {
        return renderButtonFinishPoint();
      }
    } else if (params.point === 1) {
      //-- ЭтоСклад
      if (params.status === 1) {
        return renderButtonOpenNavigator(params);
      } else if (params.status === 2 && allOrderFinished) {
        return renderButtonFinishPoint();
      }
    }
  };

  // ---------- Карточка следующая точка ----------

  function findNextPoint() {
    const sortedPoints = points.sort((a, b) => a.sort - b.sort);
    const currentIndex = sortedPoints.findIndex(
      point => point.uidPoint === uidPoint,
    );
    const nextPoint = sortedPoints.find((point, index) => index > currentIndex);

    return nextPoint;
  }

  const renderNextPointCard = () => {
    const nextPoint = findNextPoint();
    const showAddress =
      nextPoint && nextPoint.address !== nextPoint.client_name;

    return (
      nextPoint &&
      nextPointDrive && (
        <Layout>
          <Text category="label" style={styles.titleList}>
            <Icon
              name="corner-up-right-outline"
              width={20}
              height={20}
              style={styles.textHeaderCardIcon}></Icon>
            Следующая точка
          </Text>
          <Card
            status="primary"
            style={styles.containerCards}
            header={renderNextPointCardHeader(nextPoint)}
            footer={renderNextPointCardFooter(nextPoint)}>
            <View style={styles.textBodyCardWithLeftView}>
              <View style={styles.textTimeLeft}>
                <Layout>
                  <Text
                    category="s1"
                    style={{
                      textAlign: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0)',
                    }}>
                    {nextPoint?.time}
                  </Text>
                </Layout>
                <Layout>
                  <Text
                    category="c2"
                    style={{
                      textAlign: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0)',
                    }}>
                    {nextPoint?.date}
                  </Text>
                </Layout>
              </View>
              <View style={styles.containerCardText}>
                {showAddress && (
                  <Text category="c2">Адрес: {nextPoint?.address}</Text>
                )}
                <Text category="c2">Объем: {nextPoint?.volume}, м3</Text>
                <Text category="c2">Вес: {nextPoint?.weight}, кг</Text>
                <Text category="c2">
                  Количество заказов: {nextPoint?.countOrders}
                </Text>
                {/*<Text category="c2">
              Загрузка: {item?.loading}, %
            </Text>*/}
              </View>
            </View>
          </Card>
        </Layout>
      )
    );
  };

  const renderNextPointCardHeader = nextPoint => (
    <Layout style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
      <View style={styles.textHeaderCard}>
        <Icon
          name="pin-outline"
          width={23}
          height={23}
          style={styles.textHeaderCardIcon}></Icon>
        <Text category="h6" style={styles.textHeaderCard}>
          {nextPoint?.address}
        </Text>
      </View>
    </Layout>
  );

  const renderNextPointCardFooter = nextPoint => (
    <View>
      <Button
        style={{}}
        accessoryLeft={<Icon name="corner-up-right-outline"></Icon>}
        onPress={() => startNextPoint(nextPoint)}>
        Начать следование
      </Button>
    </View>
  );

  // ---------- Карточки заказов ----------

  const footerModal = item => (
    <Layout style={{}} level="1">
      <Button
        style={styles.buttonModal}
        status="primary"
        accessoryLeft={<Icon name="checkmark-square-outline" />}
        onPress={() => putTimeCardToServer(item)}>
        Зафиксировать
      </Button>
    </Layout>
  );

  const onPressCardOrder = item => {
    if (
      params.status === 0 ||
      (item.status !== 1 && params.orders[0].status !== 3)
    ) {
      Alert.alert('Необходимо начать следование или зафиксировать прибытие');

      return;
    }

    toggleStatus = getToggleCardStatus(item);

    if (
      toggleStatus ||
      item.tasks.length === 0 ||
      item.tasks.every(task => task.status === 3)
    ) {
      setModalContent(
        <Card
          style={{padding: 5}}
          disabled={true}
          status="danger"
          footer={footerModal(item)}>
          <Text category="s1">Необходимо зафиксировать время</Text>

          <Text category="h6">{item.name}</Text>
        </Card>,
      );

      setVisible(true);
    } else {
      props.navigation.navigate('TaskOrderScreen', {...item, uidPoint});
    }
  };

  const renderCardOrder = ({
    item,
    index,
  }: {
    item: RouterListItem;
    index: number;
  }): React.ReactElement => (
    <Card
      style={styles.containerCards}
      status={getCardStatus(item.status)}
      header={() => renderCardOrderName(item)}
      onPress={() => onPressCardOrder(item)}>
      {renderCardOrderText(item)}
    </Card>
  );

  const renderCardOrderText = item => {
    const typeName = item.type !== 1 ? 'Время прибытия:' : 'Время фиксации:';
    const formattedDate =
      item.type !== 4 && getToggleCardStatus(item)
        ? getDateFromJSON(item.date)
        : null;

    let content;
    if (item.type !== 4) {
      if (formattedDate) {
        content = (
          <Text category="c2">
            {typeName} {formattedDate}
          </Text>
        );
      } else {
        content = <Text category="c2">Необходимо зафиксировать время</Text>;
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
        <View style={styles.containerCardText}>{content}</View>
      </Layout>
    );
  };

  const renderCardOrderName = (item: RouterListItem) => {
    const hasTasks = item.tasks.length !== 0;

    return (
      <View style={styles.textHeaderCardOrder}>
        <View style={styles.textHeaderCard}>
          {renderCardOrderIcon(item.type)}

          <Text
            category="label"
            style={{
              flex: 1,
              flexDirection: 'row',
              flexWrap: 'wrap',
              fontSize: 14,
            }}>
            {item.name}
          </Text>
        </View>

        {hasTasks && (
          <Icon
            name="bulb-outline"
            width={24}
            height={24}
            style={{color: 'red'}}
          />
        )}
      </View>
    );
  };

  const renderCardOrderIcon = type => {
    const iconNames = {
      1: 'compass-outline',
      2: 'download-outline',
      3: 'file-text-outline',
      4: 'bookmark-outline',
    };

    const iconName = iconNames[type] || 'file-outline';

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

  const startNextPoint = async item => {
    let data = getDataPostRoute();
    data.screen = 2;
    data.type = 5;
    data.point = item.point;
    data.uidPoint = item.uidPoint;

    data = JSON.stringify(data);

    const res = await postRoute(uid, data);

    props.navigation.navigate('TaskScreen', {...item});

    setNextPointDrive(false);

    mutate();
  };

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

    setNextPointDrive(true);

    //mutate();
  };

  const putTimeCardToServer = async item => {
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
    <SafeAreaView style={{flex: 1}}>
      <List
        style={{}}
        data={orders}
        ListHeaderComponent={renderMainCard(point)}
        renderItem={renderCardOrder}
      />

      {renderModalWindow()}

      <AccidentScreen
        visibleAccident={visibleAccident}
        onClose={handleCloseAccidentModal}
        uidPoint={uidPoint}
        uid={uid}
      />
    </SafeAreaView>
  );

  // ---------- Фотографии ----------

  const PhotoScreen = () => {
    console.log('@@@point', point);

    if (point.status === 1 || point.status === 2) {
      return (
        <SafeAreaView style={{flex: 1}}>
          <Layout>
            <ScrollView contentContainerStyle={styles.wrap}>
              <Text category="label" style={styles.titleList}>
                Добавить фото
              </Text>

              <AddPhoto {...props} />
            </ScrollView>
          </Layout>
        </SafeAreaView>
      );
    } else {
      return (
        <SafeAreaView style={{flex: 1}}>
          <Card style={styles.containerCard}>
            <Text category="label" style={styles.titleList}>
              <Icon
                name="alert-circle-outline"
                width={20}
                height={20}
                style={styles.textHeaderCardIcon}></Icon>
              Фотографии можно сделать только на активном маршруте
            </Text>
          </Card>
        </SafeAreaView>
      );
    }
  };

  const TabNavigator = () => (
    <Navigator tabBar={props => <BottomTabBar {...props} />}>
      <Screen
        name="Действия"
        component={TasksScreen}
        options={{headerShown: false}}
      />
      <Screen
        name="Фото"
        component={PhotoScreen}
        options={{headerShown: false}}
      />
    </Navigator>
  );

  const BottomTabBar = ({navigation, state}) => (
    <BottomNavigation
      selectedIndex={state.index}
      onSelect={index => navigation.navigate(state.routeNames[index])}>
      <BottomNavigationTab
        title="Задачи"
        icon={<Icon {...props} name="bookmark-outline" />}
      />
      <BottomNavigationTab
        title="Фото"
        icon={<Icon {...props} name="camera-outline" />}
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
