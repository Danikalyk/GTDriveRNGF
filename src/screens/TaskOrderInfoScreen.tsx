/**
 * TaskOrderInfoScreen - компонент, отображающий информацию о заказе и фотографии.
 * 
 * Основные функции:
 * - Показ информации о заказе, включая статус, дату и другие детали.
 * - Возможность сообщить о происшествии через специальную кнопку.
 * - Показ экрана добавления фотографий, который доступен только на активном маршруте.
 * 
 * Входные параметры:
 * - route: Объект, содержащий параметры маршрута, такие как uidOrder и uid.
 * 
 * Внутренние компоненты:
 * - InfoScreen: Экран с информацией о заказе.
 * - PhotoScreen: Экран для добавления фотографий.
 * 
 */

import React, { useState, useEffect } from 'react';
import { View, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Card, Text, Divider, Button, Spinner, Icon, Layout, BottomNavigation, BottomNavigationTab } from '@ui-kitten/components';
import { styles } from '../styles';
import AddPhoto from '../components/AddPhoto/AddPhoto';
import { getDateFromJSON } from '../components/functions.js';
import AccidentScreen from './AccidentScreen';
import { NavigationContainer } from '@react-navigation/native';

const TaskOrderInfoScreen = ({ route }) => {
  const { params } = route;
  const [loading, setLoading] = useState(true);
  const [visibleAccident, setVisibleAccident] = useState(false);
  const Tab = createBottomTabNavigator();

  useEffect(() => {
    setLoading(false);
  }, []);

  if (!params) return null;

  const renderTextWithDivider = (text, key) => (
    <View key={key}>
      <Text category="c2" style={styles.textInfoCard}>• {text}</Text>
      <Divider />
    </View>
  );

  const renderAccidentButton = () => (
    <View style={{paddingVertical: 15, paddingHorizontal: 20}}>
      <Button
        status='warning'
        accessoryLeft={<Icon name="alert-triangle" />}
        onPress={() => setVisibleAccident(true)}
        style={{ paddingHorizontal: 20, paddingVertical: 15 }}
      >
        Сообщить об происшествии
      </Button>
    </View>
  );

  const renderCardHeader = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, justifyContent: 'center' }}>
      <Text category="s1" style={styles.textHeaderCard}>{params.name || 'Н/Д'}</Text>
    </View>
  );

  const renderInfoCard = () => {
    const formattedDate = getDateFromJSON(params.date);
    return (
      <Card style={[styles.containerCards, { marginTop: 5 }]}>
        <View style={{ paddingVertical: 4, paddingHorizontal: 10 }}>
          {params.status === 3 && renderTextWithDivider(`Заказ зафиксирован ${formattedDate || 'Н/Д'}`)}
          {Object.values(params.info || {}).map((description, index) => renderTextWithDivider(description, index))}
        </View>
      </Card>
    );
  };

  const InfoScreen = () => (
    <SafeAreaView style={{ flex: 1, marginTop: 5 }}>
      {loading && <Spinner size="giant" status="basic" style={styles.spinnerContainer} />}
      <View style={styles.backgroundContainer}>
        <Image source={require('../img/pattern.png')} style={styles.background} />
      </View>
      <Layout style={styles.containerFlatList}>
        <Card
          style={styles.containerCards}
          status='warning'
          header={renderCardHeader}
          footer={renderAccidentButton}
        />
        {renderInfoCard()}
      </Layout>
      <AccidentScreen
        visibleAccident={visibleAccident}
        onClose={() => setVisibleAccident(false)}
        uidOrder={params.uidOrder}
        uid={params.uid}
      />
    </SafeAreaView>
  );

  const PhotoScreen = () => (
    <SafeAreaView style={{ flex: 1 }}>
      {loading && <Spinner size="giant" status="basic" style={styles.spinnerContainer} />}
      <View style={styles.backgroundContainer}>
        <Image source={require('../img/pattern.png')} style={styles.background} />
      </View>
      {!params.taskFinished && (
        <Layout>
          <ScrollView contentContainerStyle={styles.wrap}>
            <AddPhoto />
          </ScrollView>
          <Card style={styles.containerCard}>
            <Text category="label" style={styles.titleList}>
              <Icon name="alert-circle-outline" width={20} height={20} style={styles.textHeaderCardIcon} />
              Фотографии можно сделать только на активном маршруте
            </Text>
          </Card>
        </Layout>
      )}
    </SafeAreaView>
  );

  const BottomTabBar = ({ navigation, state }) => (
    <BottomNavigation
      selectedIndex={state.index}
      onSelect={index => navigation.navigate(state.routeNames[index])}
    >
      <BottomNavigationTab title="Информация" icon={<Icon name="bookmark-outline" />} />
      <BottomNavigationTab title="Фото" icon={<Icon name="camera-outline" />} />
    </BottomNavigation>
  );

  return (
    <NavigationContainer independent={true}>
      <Tab.Navigator tabBar={props => <BottomTabBar {...props} />}>
        <Tab.Screen name="Информация" component={InfoScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Фото" component={PhotoScreen} options={{ headerShown: false }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default TaskOrderInfoScreen;