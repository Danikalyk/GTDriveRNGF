import { SafeAreaView, List, Card, Divider, BottomNavigation, BottomNavigationTab, Layout, Text, Toggle } from '@ui-kitten/components';
import React from 'react';
import { Alert, Linking, View } from 'react-native';
import { RouterListItem } from '../types';
import { getCardStatus, getToggleCardStatus, getDataPostRoute } from '../components/functions.js';
import { styles } from '../styles';

type Props = {};

const TaskOrderScreen = (props: Props) => {

    const order = props.route?.params;
    const tasks = props.route?.params?.tasks;

    console.log(JSON.stringify(tasks));

    const renderCardHeader = () => {
        return(
            <Text>Задачи по заказу </Text>
        )
    }

    const renderCardOrder = ({ item, index }: { item: RouterListItem; index: number; }): React.ReactElement => (
        <Card
            style={styles.containerCard}
            header={renderCardHeader}
            status={getCardStatus(item.status)}>
            <Layout style={{}}>
                <Toggle checked={getToggleCardStatus(item)}></Toggle>

                <View style={styles.containerCardText}>
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
            ListHeaderComponent={renderCardHeader}
        />
    ) 
}

export default TaskOrderScreen;