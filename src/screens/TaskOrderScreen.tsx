import { List, Card, Divider, Layout, Text, Toggle, BottomNavigation, BottomNavigationTab, Icon, Modal, Button } from '@ui-kitten/components';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useEffect } from 'react';
import { View, Alert } from 'react-native';
import { RouterListItem } from '../types';
import { getCardStatus, getToggleCardStatus, getDataPostRoute } from '../components/functions.js';
import { styles } from '../styles';
import AddPhoto from '../components/AddPhoto/AddPhoto';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { postRoute, getRoute } from '../api/routes';
import useSWR from 'swr';
import find from 'lodash/find';

type Props = {};

const TaskOrderScreen = (props: Props) => {
    const { Navigator, Screen } = createBottomTabNavigator();
    const [modalContent, setModalContent] = React.useState(null);
    const [pending, setPending] = React.useState(true);
    const [visible, setVisible] = React.useState(false);
    const propsParams = props?.route?.params;
    const uid = propsParams.uid;
    const order = propsParams;
    const uidOrder = propsParams.uidOrder;
    const { uidPoint } = props?.route?.params;

    useEffect(() => {
        setPending(false);
    }, []);
 
    const {
        data: route,
        isLoading,
        mutate,
        error,
    } = useSWR(`/route/${uid}`, () => getRoute(uid)); 



    let points = route?.points;
    let point = find(points, { uidPoint: uidPoint });
    let orders = find(point, { uidOrder: uidOrder })
    let tasks = order?.tasks;

    const params = {
        ...route,
        tasks
    }

    console.log("@@@2", JSON.stringify(params.tasks));


 

    // ---------- Задачи ----------

    const renderListHeader = () => {
        return (
            <View>
                <Text category="label" style={styles.titleList}><Icon name="info-outline" width={23} height={23} style={styles.textHeaderCardIcon}></Icon> Задачи по заказу {order.name}</Text>
            </View>
        )
    }

    const renderCardHeader = item => {
        return (
            <Layout style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.textHeaderCardRoute}>
                    <Icon name="bulb-outline" width={23} height={23} style={styles.textHeaderCardIcon}></Icon>
                    <Text 
                        category='label' 
                        style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', fontSize: 14 }}
                    >
                        {item?.name}
                    </Text>
                </View>
            </Layout>
        )
    }

    const putTimeCardToServer = async (item) => {
        let data = getDataPostRoute();
        data.screen = 3;
        data.uidOrder = order.uidOrder;
        data.uidTask = item.uidTask;
        data = JSON.stringify(data);

        await postRoute(uid, data);

        setVisible(false);

        mutate();
    };

    const footerModal = item => (
        <Layout style={{}} level="1">
            <Button
                style={styles.buttonModal}
                status="primary"
                accessoryLeft={<Icon name='checkmark-square-outline'/>}
                onPress={() => putTimeCardToServer(item)}>
                Зафиксировать
            </Button>
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
                style={{padding: 5}}
                disabled={true}
                status='danger'
                footer={footerModal(item)}
            >
                <Text category='s1'>
                    Необходимо зафиксировать время для
                </Text>
                <Text category='h6'>
                    {item.name}
                </Text>       
            </Card>
        );

        setVisible(true);
    };

    const renderCardTask = ({ item, index }: { item: RouterListItem; index: number; }): React.ReactElement => (
        <Card
            style={styles.containerCards}
            header={renderCardHeader(item)}
            status={getCardStatus(item.status)}
            onPress={() => onPressCardOrder(item)}
        >
            {renderCardTaskText(item)}
        </Card>
    );

    const renderCardTaskText = item => {
        return (
            <Layout style={styles.textBodyCardWithLeftView}>
                <Toggle checked={getToggleCardStatus(item)}></Toggle>

                <View style={styles.containerCardText}>
                    <Text category="c2">{item.description}</Text>
                </View>
            </Layout>
        )
    };

    const TasksScreen = () => (
        <Layout style={{}}>
            <List
                style={{}}
                data={tasks}
                renderItem={renderCardTask}
                ListHeaderComponent={renderListHeader()}
            />

            {renderModalWindow()}
        </Layout>
    );

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

    const PhotoScreen = () => (
        <SafeAreaView style={{ flex: 1 }}>
            <Layout>
                <ScrollView contentContainerStyle={styles.wrap}>
                    <Text category="label" style={styles.titleList}>
                        Добавить фото
                    </Text>

                    <AddPhoto {...props} />
                </ScrollView>
            </Layout>
        </SafeAreaView>
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
                icon={<Icon {...props} name='bookmark-outline' />}
            />
            <BottomNavigationTab
                title='Фото'
                icon={<Icon {...props} name='camera-outline' />}
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