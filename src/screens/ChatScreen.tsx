import {
  Button,
  Divider,
  Layout,
  List,
  ListItem,
  Text,
  TopNavigation,
} from '@ui-kitten/components';
import React, {useContext} from 'react';
import {RefreshControl, ScrollView} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import useSWR from 'swr';

import {Alert, StyleSheet, Linking, Platform} from 'react-native';
import {getRoute, getRoutes} from '../api/routes';
import {RouterListItem} from '../types';
import {openAddressOnMap} from '../utils/openAddressOnMap';
import {getChat} from '../api/chats';
import {UserContext} from '../store/user/UserProvider';

type Props = {};

const ChatScreen = (props: Props) => {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  console.log('ChatScreen', props);

  const {currentUser} = useContext(UserContext);

  const user = props?.route?.params;

  const {
    data: messages,
    error,
    isLoading,
  } = useSWR(`/messages/${user?.uid}`, () =>
    getChat({
      messages: {
        Date: Date.now(),
        Text: 'текст сообщения',
      },
      sender: currentUser?.uid,
    }),
  );

  return (
    <SafeAreaView style={{flex: 1}}>
      <Layout style={{flex: 1, padding: 10}}>
        <Text category="h6" style={{marginBottom: 10}}>
          ssss
        </Text>
      </Layout>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,

    minHeight: 180,
  },
});

export default ChatScreen;
