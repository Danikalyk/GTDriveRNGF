import {
  Button,
  Layout,
  Text,
  ButtonGroup,
  Icon,
  List,
  ListItem,
  Divider,
  CheckBox,
} from '@ui-kitten/components';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Alert, Linking, StyleSheet, View} from 'react-native';
import {openAddressOnMap} from '../utils/openAddressOnMap';
import {RouterListItem} from '../types';

import AddPhoto from '../components/AddPhoto/AddPhoto';
import {ScrollView} from 'react-native-gesture-handler';

type Props = {};

const RouteScreen = (props: Props) => {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const params = props?.route?.params;
  const orders = props?.route?.params.orders;

  //console.log({ params });
  console.log({orders});

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

    console.log({supportedGoogleMaps});
    if (supportedGoogleMaps) {
      Linking.openURL(urlAndroidMap);

      return;
    }

    // Alert.alert('Ошибка', 'Пожалуйста, установите Яндекс Навигатор или ');
  };

  const dataButtons = [
    {title: '1', icon: 'phone'},
    {title: '2', icon: 'message-square'},
    {title: '3', icon: 'alert-circle'},
    {title: '4', icon: 'camera', onClick: () => {
      props.navigation.navigate('AddPhoto');
    }},
  ];

  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const onSelect = index => {
    setSelectedIndex(index);
  };

  const renderHeader = () => (
    <View>
      <Text style={{fontWeight: 'bold'}}>Заказы</Text>
    </View>
  );

  const renderItem = ({
    item,
    index,
  }: {
    item: RouterListItem;
    index: number;
  }): React.ReactElement => (
    <ListItem
      title={item?.name}
      accessoryRight={() => renderItemRight(item)}
      //onPress={e => props.navigation.navigate('RouteScreen', {...item})}
    />
  );

  const renderItemRight = (item: RouterListItem, index) => {
    return (
      <Layout>
        <CheckBox checked={item.status} />
      </Layout>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <SafeAreaView style={{flex: 1}}>
        <Layout style={{flex: 1, padding: 10}}>
         

         

       

          <Text category="h6" style={{marginBottom: 10, marginTop: 20}}>
            Добавить фото
          </Text>

          <AddPhoto />
        </Layout>
      </SafeAreaView>
    </ScrollView>
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
  buttonGroup: {
    margin: 2,
  },
});

export default RouteScreen;
