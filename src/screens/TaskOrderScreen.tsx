import { List, Card, Divider, BottomNavigationTab, Layout, Text, Toggle } from '@ui-kitten/components';
import React from 'react';
import { View } from 'react-native';
import { RouterListItem } from '../types';
import { getCardStatus, getToggleCardStatus, getDataPostRoute } from '../components/functions.js';
import { styles } from '../styles';

type Props = {};

const TaskOrderScreen = (props: Props) => {

    const order = props.route?.params;
    const tasks = props.route?.params?.tasks;

    console.log(JSON.stringify(order));

    const renderListHeader = () => {
        return(
            <View>
                <Text category="h5">Задачи по заказу {`${order.name}`}</Text>
            </View>
        )
    }

    const renderCardHeader = item => {
        return(
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

    return (
        <List
            style={{}}
            data={tasks}
            renderItem={renderCardOrder}
            ItemSeparatorComponent={Divider}
            ListHeaderComponent={renderListHeader()}
        />
    ) 
}

export default TaskOrderScreen;