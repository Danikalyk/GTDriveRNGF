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
} from '@ui-kitten/components';
import {
  getCardStatus,
  getToggleCardStatus,
  getDataPostRoute,
} from '../components/functions.js';
import React from 'react';
import AddPhoto from '../components/AddPhoto/AddPhoto';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Alert, Linking, View} from 'react-native';
import {openAddressOnMap} from '../utils/openAddressOnMap';
import {RouterListItem} from '../types';
import { postRoute } from '../api/routes';
import {ScrollView} from 'react-native-gesture-handler';
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

  
  const point = find(route?.points, {uidPoint: uidPoint});
  const orders = point?.orders;
  

  const params = {
    ...route,
    orders,
    uidPoint
  }

  // ---------- Открытие модального окна происшествия ----------

  const [ visibleAccident, setVisibleAccident ] = React.useState(false);

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
            props.navigation.navigate('TaskPhotoScreen', {...item})
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
    console.log('@renderMainCardFooter', JSON.stringify(params));

    if (params.point === 0) {
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

  const onPressCardOrder = item => {
    if (params.status === 0) {
      Alert.alert('Необходимо начать следование');

      return;  
    }

    console.log(params.orders[0].status);

    if (item.status !== 1 && params.orders[0].status !== 3 ) {
      Alert.alert('Необходимо зафиксировать прибытие');

      return;
    }

    toggleStatus = getToggleCardStatus(item);
    if (toggleStatus) {
      Alert.alert('Время уже зафиксировано!');

      return;
    }

    const canFinishOrder = item.tasks.every(task => task.status === 3) || item.tasks.length === 0;

    if (canFinishOrder) {
      setModalContent(
        <Card disabled={true}>
          <Text category="c2">Необходимо зафиксировать время</Text>

          <Text>{item.name}</Text>

          <Layout style={styles.container} level="1">
            <Button
              style={styles.buttonModal}
              status="basic"
              onPress={() => setVisible(false)}>
              Отмена
            </Button>
            <Button
              style={styles.buttonModal}
              status="success"
              onPress={() => putTimeCardToServer(item)}>
              Зафиксировать
            </Button>
          </Layout>
        </Card>,
      );

      setVisible(true);
    } else {
      props.navigation.navigate('TaskOrderScreen', {...item});
    }
  };

  const renderCardOrder = ({item,index,} : {item: RouterListItem; index: number;}): React.ReactElement => (
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
    if (item.type !== 4) {
      if (getToggleCardStatus(item)) {
        return (
          <Layout style={styles.textBodyCardWithLeftView}>
            <Toggle checked={getToggleCardStatus(item)}></Toggle>

            <View style={styles.containerCardText}>
              <Text category="c2">Дата Прибытия: {item.date}</Text>
            </View>
          </Layout>
        );
      } else {
        return (
          <Layout style={styles.textBodyCardWithLeftView}>
            <Toggle checked={getToggleCardStatus(item)}></Toggle>

            <View style={styles.containerCardText}>
              <Text category="c2">Необходимо зафиксировать время</Text>
            </View>
          </Layout>
        );
      }
    } else {
      return (
        <Layout style={styles.textBodyCardWithLeftView}>
          <Toggle checked={getToggleCardStatus(item)}></Toggle>

          <View style={styles.containerCardText}>
            <Text category="c2">Объем = {`${item.weight}`}</Text>
            <Text category="c2">Вес = {`${item.volume}`}</Text>
          </View>
        </Layout>
      );
    }
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
            style={{color: 'red'}}
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
    data.point = params.point;
    data.uidPoint = params.uidPoint;

    data = JSON.stringify(data);

    const res = await postRoute(uid, data);

    mutate();
  };

  const finishCurrentPoint = async () => {
    let data = getDataPostRoute();
    data.screen = 2;
    data.type = 6;
    data.point = params.point;
    data.uidPoint = params.uidPoint;

    data = JSON.stringify(data);

    await postRoute(uid, data);

    mutate();
  };

  const putTimeCardToServer = async (item) => {
    let data = getDataPostRoute();
    data.screen = 2;
    data.type = item.type;
    data.point = params.point;
    data.uidPoint = params.uidPoint;
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

  // ---------- Отрисовка ----------
  console.log('AAAA', { params })
  return (
    <SafeAreaView style={{flex: 1}}>
      <List
        //refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={{}}
        data={orders}
        ListHeaderComponent={renderMainCard(params)}
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
};

export default RouteScreen;
