import { List, Card, Divider, Layout, Text, Toggle, BottomNavigation, BottomNavigationTab, Icon } from '@ui-kitten/components';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View } from 'react-native';
import { RouterListItem } from '../types';
import { getCardStatus, getToggleCardStatus, getDataPostRoute } from '../components/functions.js';
import { styles } from '../styles';

import AddPhoto from '../components/AddPhoto/AddPhoto';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {};

const TaskOrderScreen = (props: Props) => {
    const { Navigator, Screen } = createBottomTabNavigator();
    const order = props.route?.params;
    const tasks = props.route?.params?.tasks;

    // ---------- Фотографии ----------

    const renderListHeader = () => {
        return (
            <View>
                <Text category="h5">Задачи по заказу {`${order.name}`}</Text>
            </View>
        )
    }

    const renderCardHeader = item => {
        return (
            <View>
                <Text category="h6">Задачи по заказу </Text>
            </View>
        )
    }

    const renderCardOrder = ({ item, index }: { item: RouterListItem; index: number; }): React.ReactElement => (
        <Card
            style={styles.containerCards}
            header={renderCardHeader(item)}
            status={getCardStatus(item.status)}
        >
            <Layout style={styles.containerCard}>
                <View>
                    <Toggle checked={getToggleCardStatus(item)}></Toggle>
                </View>

                <View style={styles.containerCardBody}>
                    <Text category="c2">{item.description}</Text>
                </View>
            </Layout>
        </Card>
    );

    const TasksScreen = () => (
        <Layout style={{}}>
            <List
                style={{}}
                data={tasks}
                renderItem={renderCardOrder}
                ItemSeparatorComponent={Divider}
                ListHeaderComponent={renderListHeader()}
            />
        </Layout>
    );

    // ---------- Фотографии ----------

    const PhotoScreen = () => (
        <Layout style={{flex: 1, padding: 10}}>
            <ScrollView contentContainerStyle={styles.wrap}>
                <SafeAreaView style={{flex: 1}}>
                    <Text category="h6" style={{marginBottom: 10, marginTop: 20}}>
                        Добавить фото заголовок
                    </Text>

                    <AddPhoto {...props} />
                </SafeAreaView>
            </ScrollView>
        </Layout>
    );

    // ---------- Табы ----------

    const TabNavigator = () => (
        <Navigator tabBar={props => <BottomTabBar {...props} />}>
            <Screen 
                name='Задачи' 
                component={TasksScreen} 
                options={{ headerShown: false }}
            />
            <Screen 
                name='Фото' 
                component={PhotoScreen} 
                options={{ headerShown: false }}
            />
        </Navigator>
    );

    const BottomTabBar = ({ navigation, state }) => (
        <BottomNavigation
            selectedIndex={state.index}
            onSelect={index => navigation.navigate(state.routeNames[index])}>
            <BottomNavigationTab 
                title='Задачи'
                icon={<Icon {...props} name='bookmark-outline'/>} 
            />
            <BottomNavigationTab 
                title='Фото' 
                icon={<Icon {...props} name='camera-outline'/>}
            />
        </BottomNavigation>
    );

    return (
        <NavigationContainer independent={true}>
            <TabNavigator />
        </NavigationContainer>
    )
}

export default TaskOrderScreen;