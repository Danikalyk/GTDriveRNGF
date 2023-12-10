import {
  Button,
  Divider,
  Layout,
  List,
  ListItem,
  Text,
  TopNavigation,
} from '@ui-kitten/components';
import React, { useContext } from 'react';
import {RefreshControl, ScrollView} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import useSWR from 'swr';
import {StyleSheet} from 'react-native';
import {getRoutes} from '../api/routes';
import {RouterListItem} from '../types';
import { UserContext } from '../store/user/UserProvider';

type Props = {};

const ChatsScreen = (props: Props) => {
  const [refreshing, setRefreshing] = React.useState(false);


  const {usersList, setUser} = useContext(UserContext);

  

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);


  const renderItem = ({
    item,
    index,
  }: {
    item: RouterListItem;
    index: number;
  }): React.ReactElement => (
    <ListItem
      title={item?.user}
      description={item?.uid}
      accessoryLeft={() => renderItemLeft(item)}
      onPress={e => props.navigation.navigate('ChatScreen', {...item})}
    />
  );

  const renderItemLeft = (item: RouterListItem) => {
    return (
      <Layout>
        <Layout>
          
        </Layout>
      </Layout>
    );
  };

  return (
    <SafeAreaView style={{flex: 1}}>
       <List
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          style={styles.list}
          data={usersList}
          renderItem={renderItem}
          ItemSeparatorComponent={Divider}
        />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    minHeight: 180,
  },
});

export default ChatsScreen;
