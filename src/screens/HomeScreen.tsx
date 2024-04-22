import {
  Divider,
  Layout,
  List,
  ListItem,
  Text,
  Card,
  Icon
} from '@ui-kitten/components';
import React, { useContext } from 'react';
import { RefreshControl } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import useSWR from 'swr';
import { getRoutes } from '../api/routes';
import { GlobalState } from '../store/global/global.state';
import { UserContext } from '../store/user/UserProvider';
import { RouterListItem } from '../types';
import { styles } from '../styles';
import { getCardStatus } from '../components/functions.js';

type Props = {};

const HomeScreen = (props: Props) => {
  const [refreshing, setRefreshing] = React.useState(false);

  const { location } = useContext(GlobalState);

  //console.log('@@@HomeScreen', { location });

  const { currentUser } = useContext(UserContext);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const { data: routes } = useSWR(`/routes?user=${currentUser?.uid}`, () =>
    getRoutes(currentUser?.uid),
  );

  const renderItemCard = ({ item, index }: { item: RouterListItem; index: number; }): React.ReactElement => (
    <Card
      style={styles.containerCards}
      header={renderCardHeader(item)}
      status={getCardStatus(item.status)}
      onPress={e => props.navigation.navigate('RouteScreen', { ...item })}
    >
        <View style={styles.textBodyCardWithLeftView}> 
          {renderItemLeft(item)}
          <Text>{item?.description}</Text>
        </View>
    </Card>
  );

  const renderCardHeader = (item: RouterListItem) => {
    return (
      <Layout>
        <View style={styles.textHeaderCard}>
          <Icon name="car-outline" width={23} height={23} style={styles.textHeaderCardIcon}></Icon>
          <Text category="h6">{item.name}</Text>
        </View>
      </Layout>
    )
  }

  const renderItemLeft = (item: RouterListItem) => {
    return (
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
  };

  return (
    <SafeAreaView>
      <List
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={{}}
        data={routes}
        renderItem={renderItemCard}
      />
    </SafeAreaView>
  )
};

export default HomeScreen;
