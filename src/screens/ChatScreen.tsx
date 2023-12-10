import {
  Button,
  Divider,
  Layout,
  List,
  ListItem,
  Text,
  TopNavigation,
} from '@ui-kitten/components';
import React, {useContext, useRef, useState} from 'react';
import {RefreshControl, ScrollView} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import useSWR from 'swr';

import {Alert, StyleSheet, Linking, Platform} from 'react-native';
import {getRoute, getRoutes} from '../api/routes';
import {RouterListItem} from '../types';
import {openAddressOnMap} from '../utils/openAddressOnMap';
import {getChat} from '../api/chats';
import {UserContext} from '../store/user/UserProvider';
import {Chatty} from 'react-native-chatty';
import dayjs from 'dayjs';

type Props = {};

const ChatScreen = (props: Props) => {
  const [refreshing, setRefreshing] = React.useState(false);

  const [messages, setMessages] = React.useState([
    {
      id: 1,
      text: 'Hello',
      me: true,
      createdAt: new Date(),
      user: {
        id: 1,
        username: 'John Doe',
        avatar: {uri: 'https://i.pravatar.cc/300'},
      },
    },
    {
      id: 2,
      text: 'Hello22!!!',
      me: false,
      createdAt: new Date(),
      user: {
        id: 2,
        username: 'Jane Doe',
        avatar: {uri: 'https://i.pravatar.cc/300'},
      },
    },
    {
      id: 8,
      text: 'Hello!!!',
      me: false,
      createdAt: new Date(),
      user: {
        id: 2,
        username: 'Jane Doe',
        avatar: {uri: 'https://i.pravatar.cc/300'},
      },
    },
    {
      id: 7,
      text: 'Hello!!!',
      me: false,
      createdAt: new Date(),
      user: {
        id: 2,
        username: 'Jane Doe',
        avatar: {uri: 'https://i.pravatar.cc/300'},
      },
    },
    {
      id: 3,
      text: 'Hello!!!',
      me: false,
      createdAt: dayjs().add(2, 'day').toDate(),
      user: {
        id: 2,
        username: 'Jane Doe',
        avatar: {uri: 'https://i.pravatar.cc/300'},
      },
    },
    {
      id: 4,
      text: 'http://google.com Hello!!!',
      me: false,
      createdAt: dayjs().add(2, 'day').toDate(),
      user: {
        id: 2,
        username: 'Jane Doe',
        avatar: {uri: 'https://i.pravatar.cc/300'},
      },
    },
    {
      id: 5,
      text: '#hashtag Hello!!!',
      me: false,
      createdAt: dayjs().add(2, 'day').toDate(),
      user: {
        id: 2,
        username: 'Jane Doe',
        avatar: {uri: 'https://i.pravatar.cc/300'},
      },
    },
    {
      id: 5,
      text: '#hashtag Hello!!!',
      me: false,
      createdAt: dayjs().add(2, 'day').toDate(),
      user: {
        id: 2,
        username: 'Jane Doe',
        avatar: {uri: 'https://i.pravatar.cc/300'},
      },
      media: [
        {
          uri: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          type: 1,
          videoOptions: {
            thumbnail:
              'https://peach.blender.org/wp-content/uploads/bbb-splash.png',
          },
        },
      ],
    },
    {
      id: 6,
      text: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.

      The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.`,
      me: false,
      createdAt: dayjs().add(2, 'day').toDate(),
      user: {
        id: 2,
        username: 'Jane Doe',
        avatar: {uri: 'https://i.pravatar.cc/300'},
      },
      repliedTo: {
        id: 1,
        text: 'Hello',
        me: true,
        createdAt: new Date(),
        user: {
          id: 1,
          username: 'John Doe',
          avatar: {uri: 'https://i.pravatar.cc/300'},
        },
      },
    },
  ]);
  const text = useRef();

  const onPressSend = data => {
    // Implement
    console.log('', data);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // console.log('ChatScreen', props);

  const {currentUser} = useContext(UserContext);

  const user = props?.route?.params;

  const {
    data: dataMessages,
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
    <KeyboardAwareScrollView>
      <SafeAreaView style={{flex: 1}}>
        <Layout style={{flex: 1}}>
          <Chatty
            bubbleProps={{
              
            }}
            messages={messages}
            footerProps={{
              // To prevent any unnecessary re-rendering, we're using ref instead of states.
              onChangeText: _text => (text.current = _text),
              onPressSend,
            }}
            renderHeader={props => null}
          />
        </Layout>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,

    minHeight: 180,
  },
});

export default ChatScreen;
