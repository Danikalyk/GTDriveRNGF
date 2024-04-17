import {
  Button,
  Layout,
  Text,
  ButtonGroup,
  Icon,
  IconElement,
  List,
  ListItem,
  Divider,
  CheckBox,
  Card,
  Toggle,
  Modal,
} from '@ui-kitten/components';
import React from 'react';
import AddPhoto from '../components/AddPhoto/AddPhoto';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import { openAddressOnMap } from '../utils/openAddressOnMap';
import { RouterListItem } from '../types';
import { postRoute } from '../api/routes';
import { getCardStatus, getToggleCardStatus, getDataPostRoute } from '../components/functions.js';
import { ScrollView } from 'react-native-gesture-handler';
import AccidentScreen from './AccidentScreen';

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

  const params = props?.route?.params;
  const orders = props?.route?.params.orders;
  const uid = props?.route?.params.uid;

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

  const renderMainCard = (params) => {
    return (
      <View>
        <Card
          status='warning'
          header={renderMainCardHeader(params)}
          footer={renderMainCardFooter(params)}
          style={{ margin: 5 }}
        >
          {renderMainCardButtons(params)}
        </Card>

        <View>
          <Text category="h6" style={styles.title}>
            Действия
          </Text>
        </View>
      </View>
    )
  }

  const renderMainCardHeader = item => {
    return (
      <Text category="h6" style={{}}>
        <Icon name="pin-outline" width={23} height={23}></Icon> {item?.address}
      </Text>
    )
  }

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
          onPress={() => props.navigation.navigate('TaskPhotoScreen', { ...item })}
          accessoryLeft={<Icon name="camera" />}
        />
      </ButtonGroup>
    )
  }

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
        <Button
          style={{}}
          onPress={startCurrentPoint}   
        >
          Начать следование
        </Button>
      </View>
    );
  }

  const renderButtonOpenNavigator = () => {
    return (
      <View>
        <Button
          style={{}}
          onPress={handleOpenNavigator}
        >
          Открыть в навигаторе
        </Button>
      </View>
    );
  }

  const renderButtonFinishPoint = () => {
    return (
      <View>
        <Button
          style={{}}
          onPress={finishCurrentPoint}
        >
          Завершить точку
        </Button>
      </View>
    );
  }

  const renderMainCardFooter = params => {
    allOrderFinished = params.orders.every(order => order.status === 3);
    console.log(JSON.stringify(params));

    if (params.point === 0) { //-- ЭтоТочка
      if (params.status === 0) {
        return (
          renderButtonStartPoint()
        );
      } else if (params.status === 1) {
        return (
          renderButtonOpenNavigator()
        );
      } else if (params.status === 2 && allOrderFinished) {
        return (
          renderButtonFinishPoint()
        );
      }
    } else if (params.point === 1) { //-- ЭтоСклад 
      if (params.status === 1) {
        return (
          renderButtonOpenNavigator()
        ); 
      } else if (params.status === 2 && allOrderFinished) {
        return (
          renderButtonFinishPoint()
        ); 
      }
    }

    return;

    let allCardsShipped = true;

    for (const order of orders) {
      if (order.status !== 3) {
        allCardsShipped = false;
      }
    }

    if (allCardsShipped) {
      return (
        <Button
          onPress={finishCurrentPoint()
          }>
          Завершить точку
        </Button>
      )
    } else {
      if (orders[0].status === 0) {
      return (
        <Button
          onPress={handleOpenNavigator
          }>
          Открыть в навигаторе
        </Button>
      )
      }
    }
  }


  // ---------- Карточки заказов ----------

  const onPressCardOrder = item => {
    toggleStatus = getToggleCardStatus(item);

    if (toggleStatus) {
      Alert.alert("Время уже зафиксировано!");

      return;
    }

    if (item.tasks.length === 0) {
      setModalContent(
        <Card disabled={true}>
          <Text category="c2">
            Необходимо зафиксировать время
          </Text>

          <Text >
            {item.name}
          </Text>

          <Layout
            style={styles.container}
            level='1'
          >
            <Button
              style={styles.buttonModal}
              status='basic'
              onPress={() => setVisible(false)}
            >
              Отмена
            </Button>
            <Button
              style={styles.buttonModal}
              status='success'
              onPress={() => putTimeCardToServer(item)}
            >
              Зафиксировать
            </Button>
          </Layout>
        </Card>
      );

      setVisible(true);
    } else {
      props.navigation.navigate('TaskOrderScreen', { ...item });
    }
  };

  const renderCardOrder = ({ item, index } : { item: RouterListItem; index: number; }): React.ReactElement => (
    <Card
      style={{}}
      status={getCardStatus(item.status)}
      header={() => renderCardOrderName(item)}
      onPress={() => onPressCardOrder(item)}
      style={styles.card}>
      <Text> {renderCardOrderText(item)}</Text>
    </Card>
  );

  const renderCardOrderText = item => {
    if (item.type !== 4) {
      if (getToggleCardStatus(item)) {
        return (
          <Layout style={styles.containerCard}>
            <Toggle checked={getToggleCardStatus(item)}></Toggle>

            <View style={styles.containerCardText}>
              <Text category="c2">Дата Прибытия: {item.date}</Text>
            </View>
          </Layout>
        );
      } else {
        return (
          <Layout style={styles.containerCard}>
            <Toggle checked={getToggleCardStatus(item)}></Toggle>

            <View style={styles.containerCardText}>
              <Text category="c2">Необходимо зафиксировать время</Text>
            </View>
          </Layout>
        );
      }
    } else {
      return (
        <Layout style={styles.containerCard}>
          <Toggle checked={getToggleCardStatus(item)}></Toggle>

          <View style={styles.containerCardText}>
            <Text category="c2">Объем = {`${item.weight}`}</Text>
            <Text category="c2">Вес = {`${item.volume}`}</Text>
          </View>
        </Layout>
      );
    }
  };

  const renderCardOrderName = item => {
    const hasTasks = item.tasks.length !== 0;

    return (
      <Layout style={styles.containerName}>
        <Text category="h6" style={styles.name}>
          {`${item.name}`}
        </Text>

        {hasTasks && <Icon name="alert-circle-outline" width={24} height={24} style={{ padding: 7, marginRight: 10 }} />}
      </Layout>
    );
  };

  // ---------- Запросы к серверу ----------

  const startCurrentPoint = () => {
    let data = getDataPostRoute();
    data.screen = 2;
    data.type = 5;
    data.point = params.point;
    data.uidPoint = params.uidPoint;

    data = JSON.stringify(data);

    postRoute(uid, data);
  }

  const finishCurrentPoint = () => {
    let data = getDataPostRoute();
    data.screen = 2;
    data.type = 6;
    data.point = params.point;
    data.uidPoint = params.uidPoint;

    data = JSON.stringify(data);

    postRoute(uid, data);
  }

  const putTimeCardToServer = item => {
    let data = getDataPostRoute();
    data.screen = 2;
    data.type = item.type;
    data.point = params.point;
    data.uidPoint = params.uidPoint;
    data.uidOrder = item.uidOrder; 

    data = JSON.stringify(data);

    postRoute(uid, data);

    setVisible(false);
  }

  // ---------- Модальное окно ----------

  const renderModalWindow = () => {
    return (
      <Modal
        visible={visible}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => setVisible(false)}
      >
        {modalContent}
      </Modal>
    );
  }

  

  // ---------- Отрисовка ----------

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <List
        //refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={{}}
        data={orders}
        renderItem={renderCardOrder}
        ItemSeparatorComponent={Divider}
        ListHeaderComponent={renderMainCard(params)}
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

const styles = StyleSheet.create({
  list: {
    flex: 1,
    minHeight: 180,
  },
  wrap: {
    paddingVertical: 10,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    margin: 10,
  },
  buttonGroup: {
    margin: 2,
  },
  card: {
    margin: 5,
  },
  name: {
    padding: 7,
  },
  containerCard: {
    flex: 1,
    flexDirection: 'row',
  },
  containerCardText: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 20
  },
  containerName: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  buttonModal: {
    margin: 2,
  },
  
});

export default RouteScreen;
