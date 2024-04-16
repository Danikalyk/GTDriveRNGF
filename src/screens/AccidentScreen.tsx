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
  IndexPath,
  SelectItem,
  Select,
  Input,
} from '@ui-kitten/components';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Alert, Linking, StyleSheet, View} from 'react-native';
import {openAddressOnMap} from '../utils/openAddressOnMap';
import {RouterListItem} from '../types';

import AddPhoto from '../components/AddPhoto/AddPhoto';
import {ScrollView} from 'react-native-gesture-handler';
import { pingServer } from '../api/request';

type Props = {};

const RouteScreen = (props: Props) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [text, setText] = React.useState('');

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const [selectedIndex, setSelectedIndex] = React.useState<
    IndexPath | IndexPath[]
  >();

  console.log({selectedIndex});
  const options = [
    'Неоплата по прибытии',
    'Техническая неисправность ТС в пути следования',
    'Задерживаюсь на погрузке/выгрузке',
    'Пробка на дороге/Движение затруднено',
    'Контактное лицо на точке выгрузке не отвечает',
    'При погрузке/выгрузке выявлен некондиционный товар',
    'Другое',
  ];

  const displayValue = options[selectedIndex?.row];

  const handleSubmit = async () => {
    const payload = displayValue === 'Другое' ? text : displayValue;

    await pingServer(); // TODO ручку отправки что случилось
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <Layout style={{flex: 1, padding: 10}}>
        <Select
          style={{marginBottom: 10}}
          placeholder="Тип проишестивя"
          onSelect={index => setSelectedIndex(index)}
          label="Тип проишестивя"
          selectedIndex={selectedIndex}
          value={displayValue}>
          {options.map((option, index) => (
            <SelectItem key={option} title={option} />
          ))}
        </Select>

        {displayValue === 'Другое' && (
          <Input
            multiline={true}
            placeholder="Другое"
            label="Другое"
            value={text}
            onChangeText={nextValue => setText(nextValue)}
            textStyle={{minHeight: 64, marginTop: 0, padding: 0}}
          />
        )}

        <Layout style={styles.buttonGroup} level="1">
          <Button
            appearance="filled"
            onPress={handleSubmit}
            style={styles.button}>
            Ok
          </Button>
          <Button
            appearance="outline"
            onPress={() => props.navigation.goBack()}
            style={styles.button}>
            Отмена
          </Button>
        </Layout>
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
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  button: {
    margin: 2,
  },
});

export default RouteScreen;
