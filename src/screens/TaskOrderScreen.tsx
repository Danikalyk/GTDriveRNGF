import { Card, Layout, Text, Toggle, BottomNavigation, BottomNavigationTab, Icon, Modal, Button, Spinner } from '@ui-kitten/components';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Alert, Image, FlatList } from 'react-native';
import { RouterListItem } from '../types';
import { getToggleCardStatus, getDataPostRoute } from '../components/functions.js';
import { styles } from '../styles';
import AddPhoto from '../components/AddPhoto/AddPhoto';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { postRoute } from '../api/routes';
import useSWR from 'swr';
import find from 'lodash/find';
import { getReq } from '../api/request';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

type Props = {};

const TaskOrderScreen = (props: Props) => {
  const backgroundImage = require('../img/pattern.png');
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);
  const { Navigator, Screen } = createBottomTabNavigator();
  const [pending, setPending] = useState(true);
  const [modalContent, setModalContent] = useState(null);
  const { data: route, mutate, error } = useSWR(`/route/${uid}`, getReq);
  const { uid, uidOrder, uidPoint } = props.route.params || {};
  const [title, setTitle] = useState('');
  const goBack = () => {
    navigation.goBack({ post: true });
  };
  const order = props.route?.params || [];
  const tasks = order.tasks || [];
  const canFinishOrder = tasks.every(task => task.status === 3);
  const taskFinished = props.route?.params?.status === 3;

  useEffect(() => {
    setPending(false);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  let newTitle = 'Задачи по заказу' + (order?.name ? ` ${order.name}` : '');
  
  React.useLayoutEffect(() => {
      navigation.setOptions({ title: newTitle });
  }, [navigation, newTitle]);

  // ---------- Запросы ----------

  const createPostData = (screen, additionalData = {}) => {
    const data = {
      ...getDataPostRoute(),
      screen,
      uidOrder: uidOrder,
      ...additionalData,
    };

    return JSON.stringify(data);
  };

  const finishCurrentOrder = async () => {
    const data = createPostData(2, {
      type: order.type,
      point: 0,
      uidPoint: uidPoint,
    });

    await postRoute(uid, data);
    goBack();
  };

  const putTimeCardToServer = async (item) => {
    const data = createPostData(3, {
      uidTask: item.uidTask,
    });

    await postRoute(uid, data);
    setVisible(false);
    mutate();
  };

  // ---------- Задачи ----------

  const renderCardHeader = item => {
    return (
      <View style={[styles.textHeaderCardOrder]}>
        <View style={styles.textHeaderCard}>
          <Icon
            name="bulb-outline"
            width={23}
            height={23}
            style={{marginRight: 5}}
          />
          <Text
            category="label"
            style={{
              flex: 1,
              flexDirection: 'row',
              flexWrap: 'wrap',
              fontSize: 14,
            }}>
            {item?.name}
          </Text>
        </View>
      </View>
    );
  };

  const renderFinishOrderCard = () => {
    return (
      <Layout style={{ marginHorizontal: 5}}>
        <Card
          style={[
            styles.containerCards
          ]}
          appearance='outline'
          status='basic'
        >
          <View>
            <Button
              style={{}}
              accessoryLeft={<Icon name="checkmark-square-outline"></Icon>}
              onPress={() => finishCurrentOrder()}
              appearance="filled"
              status='basic'
            >
              Зафиксировать время заказа
            </Button>
          </View>
        </Card>
      </Layout>
    );
  };

  const footerModal = item => (
    <Layout style={{}} level="1">
      <Button
        style={styles.buttonModal}
        appearance="filled"
        status='basic'
        accessoryLeft={<Icon name="checkmark-square-outline" fill="#FFFFFF" />}
        onPress={() => putTimeCardToServer(item)}>
        Зафиксировать
      </Button>
    </Layout>
  );

  const headerModal = () => (
    <Layout style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
      <Icon name="bulb-outline" width={23} height={23} />
      <Text category="s1" style={styles.textHeaderCard}>Необходимо зафиксировать</Text>
    </Layout>
  );

  const onPressCardOrder = item => {
    toggleStatus = getToggleCardStatus(item);

    if (toggleStatus) {
      Alert.alert('Задача уже зафиксирована');

      return;
    }

    setModalContent(
      <Card
        style={[styles.containerCards, { borderWidth: 0, width: 350 }]}
        disabled={true}
        status="warning"
        header={headerModal}
        footer={footerModal(item)}
      >
        <View style={{ padding: 10 }}>
          <Text category="h6">{item.name}</Text>
        </View>
      </Card>
    );

    setVisible(true);
  };

  const renderCardTask = ({ item, index, }: { item: RouterListItem; index: number; }): React.ReactElement => {
    const finishedTask = item.status === 3;

    return (
      <View>
        <Card
          style={[
            styles.containerCards
          ]}
          header={renderCardHeader(item)}
          status={(finishedTask && 'success') || 'info'}
          onPress={() => onPressCardOrder(item)}
        >
          {renderCardTaskText(item)}
        </Card>
      </View>
    );
  };

  const renderCardTaskText = item => {
    const statusToggle = getToggleCardStatus(item);

    return (
      <Layout style={styles.textBodyCardWithLeftView}>
        <Toggle
          style={styles.textTimeLeft}
          disable={statusToggle}
          checked={statusToggle}
          onChange={() => onPressCardOrder(item)}>
        </Toggle>

        <View style={styles.containerCardText}>
          <Text category="c2">{item.description}</Text>
        </View>
      </Layout>
    );
  };

  function TasksOrderScreen() {
    console.log({tasks});

    return (
      <SafeAreaView style={{ flex: 1 }}>
        {pending && (
          <View style={styles.spinnerContainer}>
            <Spinner size="giant" />
          </View>
        )}

        <View style={styles.backgroundContainer}>
          <Image source={backgroundImage} style={styles.background} />
        </View>

        {canFinishOrder && !taskFinished && renderFinishOrderCard()}

        <FlatList
          style={[styles.containerFlatList, { marginTop: 5}]}
          data={tasks}
          renderItem={renderCardTask}/>

        {renderModalWindow()}
      </SafeAreaView>
    );
  }

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

  // ---------- Фотографии ----------

  const PhotoScreen = () => {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        {pending && (
          <View style={styles.spinnerContainer}>
            <Spinner size="giant" />
          </View>
        )}

        <View style={styles.backgroundContainer}>
          <Image source={backgroundImage} style={styles.background} />
        </View>

        {!taskFinished ? (
          <Layout>
            <ScrollView contentContainerStyle={styles.wrap}>
              <AddPhoto {...props} />
            </ScrollView>
          </Layout>
        ) : (
          <Card style={styles.containerCard}>
            <Text category="label" style={styles.titleList}>
              <Icon
                name="alert-circle-outline"
                width={20}
                height={20}
                style={styles.textHeaderCardIcon}
              />
              Фотографии можно сделать только на активном маршруте
            </Text>
          </Card>
        )}
      </SafeAreaView>
    );
  };

  // ---------- Табы ----------

  const TabNavigator = () => (
    <Navigator tabBar={props => <BottomTabBar {...props} />}>
      <Screen
        name="Задачи"
        component={TasksOrderScreen}
        options={{ headerShown: false }}
      />
      <Screen
        name="Фото"
        component={PhotoScreen}
        options={{ headerShown: false }}
      />
    </Navigator>
  );

  const BottomTabBar = ({ navigation, state }) => {
    const handleTabSelect = (index) => {
      const nameTab = state.routeNames[index];

      if (nameTab === 'Задачи') {
        newTitle = `Задачи по заказу ${order?.name || 'Задачи по заказу'}`;
      } else {
        newTitle = `Фото по заказу ${order?.name || ''}`;
      }

      setTitle(newTitle);
      navigation.navigate(nameTab);
    };

    return (
      <BottomNavigation
        selectedIndex={state.index}
        onSelect={handleTabSelect}
      >
        <BottomNavigationTab
          title="Задачи"
          icon={<Icon name="bookmark-outline" />}
        />
        <BottomNavigationTab
          title="Фото"
          icon={<Icon name="camera-outline" />}
        />
      </BottomNavigation>
    );
  };

  return (
    <NavigationContainer independent={true}>
      <TabNavigator>
      </TabNavigator>
    </NavigationContainer>
  );
};

export default TaskOrderScreen;
