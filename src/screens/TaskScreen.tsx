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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import { openAddressOnMap } from '../utils/openAddressOnMap';
import { RouterListItem } from '../types';
import { postRoute } from '../api/routes';

import AddPhoto from '../components/AddPhoto/AddPhoto';
import {ScrollView} from 'react-native-gesture-handler';

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

  console.log(JSON.stringify(props.route));

  const params = props?.route?.params;
  const orders = props?.route?.params.orders;
  const uid = props?.route?.params.uid;

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


  const putTimeToServer = item => {
    const currentDate = new Date();

    const data = {
      screen: item.screen,
      order: item.uid,
      type: item.type,
      date: currentDate.toJSON()
    };

    const jsonData = JSON.stringify(data);

    const user = postRoute(uid, jsonData);

    setVisible(false);
  }

  const onSelect = index => {
    setSelectedIndex(index);
  };

  const getCardStatus = (item: RouterListItem, index) => {
    if (item.status === 1) {
      return 'warning';
    } else {
      return 'basic';
    }
  };

  const getToggleStatus = item => {
    let date1c = new Date(item.date).getTime();
    let dateEmpty = new Date("0001-01-01T00:00:00+00:00").getTime();

    return date1c !== dateEmpty;
  };

  const onPressCard = (item) => {
    if (item.tasks.length === 0) {
      setModalContent(
        <Card disabled={true}>
          <Text>
            Необходимо зафиксировать время 
          </Text>

          <Text>
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
              onPress={() => putTimeToServer(item)}
              //onPress={() => setVisible(false)}
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

  const renderItem = ({
    item,
    index,
  }: {
    item: RouterListItem;
    index: number;
  }): React.ReactElement => (
    <Card
      style={styles.item}
      status={getCardStatus(item)}
      header={() => renderItemName(item)}
      onPress={() => onPressCard(item)}
      style={styles.card}>
      <Text> {renderCardText(item)}</Text>
    </Card>
  );

  const renderCardText = item => {
    if (item.type !== 4) {
      if(getToggleStatus(item)){
        return (
          <Layout style={styles.containerCard}>
            <Toggle checked={getToggleStatus(item)}></Toggle>
  
            <View style={styles.containerCardText}>
              <Text>Дата Прибытия: {item.date}</Text>
            </View>
          </Layout>
        );
      }else{
        return (
          <Layout style={styles.containerCard}>
            <Toggle checked={getToggleStatus(item)}></Toggle>
  
            <View style={styles.containerCardText}>
              <Text>Необходимо зафиксировать время</Text>
            </View>
          </Layout>
        );
      }    
    } else {
      return (
        <Layout style={styles.containerCard}>
          <Toggle checked={getToggleStatus(item)}></Toggle>

          <View style={styles.containerCardText}>
            <Text>Объем = {`${item.weight}`}</Text>
            <Text>Вес = {`${item.volume}`}</Text>
          </View>
        </Layout>
      );
    }





    if (item.name === 'Прибытие на точку') {
     
    } else {
      
    }
  };

  const renderItemName = (item: RouterListItem, index) => {
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

  const openTelegramWithNumber = phoneNumber => {
    Linking.openURL(`https://t.me/${phoneNumber}`);
  };

  const openPhoneWithNumber = phoneNumber => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const renderBottomButtons = () => {
    const allShipped = orders?.find(item => item.status === 0);

    if (!allShipped) {
      return (
        <Button onPress={handleOpenNavigator}>
          <Text>Завершить отгрузку</Text>
        </Button>
      )
    } else {
      return (
        <Button onPress={handleOpenNavigator}>
          <Text>Открыть в навигаторе</Text>
        </Button>
      )
    }
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      <Layout style={{flex: 1, padding: 10}}>
        <Text category="h6" style={{marginBottom: 10}}>
          {params?.client_name}
        </Text>

        <Text category="s1" style={{marginBottom: 20}}>
          {params?.address}
        </Text>

        <Layout style={styles.container} level="1">
          <ButtonGroup
            selectedIndex={selectedIndex}
            onSelect={onSelect}
            style={styles.buttonGroup}
            size="small">
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
              onPress={() => openTelegramWithNumber('79222965859')}
              accessoryLeft={<Icon name="alert-circle" />}
            />
            <Button
              key={4}
              onPress={() => openTelegramWithNumber('79222965859')}
              accessoryLeft={<Icon name="camera" />}
            />
          </ButtonGroup>
        </Layout>

        <List style={styles.list} data={orders} renderItem={renderItem} />

        <Modal
          visible={visible}
          backdropStyle={styles.backdrop}
          onBackdropPress={() => setVisible(false)}
        >
          {modalContent}
        </Modal>

        {renderBottomButtons()}
      </Layout>
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
    paddingLeft: 20,
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
