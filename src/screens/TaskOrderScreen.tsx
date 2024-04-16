import { SafeAreaView, List, Card, Divider, BottomNavigation, BottomNavigationTab, Layout, Text } from '@ui-kitten/components';
import React from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import { RouterListItem } from '../types';

type Props = {};

const TaskOrderScreen = (props: Props) => {

    const order = props.route?.params;
    const tasks = props.route?.params?.tasks;

    console.log(JSON.stringify(tasks));


    return (
            <Text>123</Text>  
    )
  
}

export default TaskOrderScreen;