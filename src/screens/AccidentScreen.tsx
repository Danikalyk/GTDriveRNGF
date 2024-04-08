import {
    Button,
    Layout,
    Text,
    ButtonGroup,
    Icon,
    List,
    ListItem,
    Divider,
    CheckBox,
  } from '@ui-kitten/components';
  import React from 'react';
  import {SafeAreaView} from 'react-native-safe-area-context';
  import {Alert, Linking, StyleSheet, View} from 'react-native';
  import {openAddressOnMap} from '../utils/openAddressOnMap';
  import {RouterListItem} from '../types';
  
  import AddPhoto from '../components/AddPhoto/AddPhoto';
  import {ScrollView} from 'react-native-gesture-handler';
  
  type Props = {};
  
  const RouteScreen = (props: Props) => {
    const [refreshing, setRefreshing] = React.useState(false);
  
    const onRefresh = React.useCallback(() => {
      setRefreshing(true);
      setTimeout(() => {
        setRefreshing(false);
      }, 2000);
    }, []);
  
    return (
      
        <SafeAreaView style={{flex: 1}}>
          <Layout style={{flex: 1, padding: 10}}>
            
  
            
          </Layout>
        </SafeAreaView>
      
    );
  };
  
  const styles = StyleSheet.create({
    list: {
      flex: 1,
  
      minHeight: 180,
    },
    wrap: {
      paddingVertical: 10,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    buttonGroup: {
      margin: 2,
    },
  });
  
  export default RouteScreen;
  