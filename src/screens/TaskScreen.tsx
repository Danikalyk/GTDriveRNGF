import { Button, Layout, Text, ButtonGroup, Icon, IconElement } from '@ui-kitten/components';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import { openAddressOnMap } from '../utils/openAddressOnMap';

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

  console.log({ params });

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

    console.log({ supportedGoogleMaps });
    if (supportedGoogleMaps) {
      Linking.openURL(urlAndroidMap);

      return;
    }

    // Alert.alert('Ошибка', 'Пожалуйста, установите Яндекс Навигатор или ');
  };


  const dataButtons = [
    { title: '1', icon: 'phone' },
    { title: '2', icon: 'star' },
    { title: '3', icon: 'star' },
    { title: '4', icon: 'star' }
  ];

  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const onSelect = (index) => {
    setSelectedIndex(index);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Layout style={{ flex: 1, padding: 10 }}>
        <Text category="h6" style={{ marginBottom: 10 }}>
          {params?.client_name}
        </Text>

        <Text category="s1" style={{ marginBottom: 20 }}>
          {params?.address}
        </Text>

        <Layout style={styles.container} level='1'>
          <ButtonGroup selectedIndex={selectedIndex} onSelect={onSelect} style={styles.buttonGroup} size='tiny'>
            {dataButtons.map((item, index) => (
              <Button key={index} accessoryLeft={(props) => <Icon {...props} name={item.icon} />}/>
            ))}
          </ButtonGroup>
        </Layout>

        <Button onPress={handleOpenNavigator}>
          <Text>Открыть в навигаторе</Text>
        </Button>
      </Layout>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,

    minHeight: 180,
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  buttonGroup: {
    margin: 2,
  },
});

export default RouteScreen;
