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
import AddPhoto from '../components/AddPhoto/AddPhoto';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

type Props = {};

const TaskPhotoScreen = (props: Props) => {
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <SafeAreaView style={{flex: 1}}>
        <Layout style={{flex: 1, padding: 10}}>
          <Text category="h6" style={{marginBottom: 10, marginTop: 20}}>
            Добавить фото заголовок
          </Text>

          <AddPhoto {...props} />
        </Layout>
      </SafeAreaView>
    </ScrollView>
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

export default TaskPhotoScreen;
