import React, { useState } from 'react';
import { Button, Layout, Text, Input, RadioGroup, ButtonGroup, Radio, Card, Modal, Icon } from '@ui-kitten/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { pingServer } from '../api/request';
import { styles } from '../styles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  getCardStatus,
  getToggleCardStatus,
  getDataPostRoute,
  getDateFromJSON,
} from '../components/functions.js';
import { postRoute } from '../api/routes';

const AccidentScreen = ({ visibleAccident, onClose, uidPoint, uid }) => {
  const [text, setText] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const options = [
    'Неоплата по прибытии',
    'Техническая неисправность ТС в пути следования',
    'Задерживаюсь на погрузке/выгрузке',
    'Пробка на дороге/Движение затруднено',
    'Контактное лицо на точке выгрузки не отвечает',
    'При погрузке/выгрузке выявлен некондиционный товар',
    'Другое',
  ];

  const displayValue = options[selectedIndex];

  const handleSubmit = async () => {
    const payload = displayValue === 'Другое' ? text : displayValue;

    let data = getDataPostRoute();
    data.screen = 4;
    data.accident = payload;
    data.uidPoint = uidPoint;

    data = JSON.stringify(data);

    const res = await postRoute(uid, data);

    onClose();
  };

  const renderCardHeader = () => (
    <Layout style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
      <View style={styles.textHeaderCard}>
        <Icon name="alert-triangle-outline" width={23} height={23} style={styles.textHeaderCardIcon}></Icon>
        <Text category="h6" style={styles.textHeaderCard}>Сообщить о происшествии</Text>
      </View>
    </Layout>
  )

  const renderCardFooter = () => (
    <Layout level="1">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 10 }}>
        <Button
          appearance="filled"
          onPress={handleSubmit}
          style={{flex:1}}>
          Подтвердить
        </Button>
        <Button
          appearance="outline"
          onPress={onClose}
          style={{flex:1}}>
          Отмена
        </Button>
      </View>
    </Layout>
  )

  return (
    <Modal
      visible={visibleAccident}
      backdropStyle={styles.backdrop}     
    >
      <Card
        style={{ margin: 20 }}
        status='warning'
        header={renderCardHeader}
        footer={renderCardFooter}
      >
        {displayValue === 'Другое' && (
          <KeyboardAwareScrollView>
            <Input
              multiline={true}
              placeholder="Другое"
              label="Другое"
              value={text}
              onChangeText={nextValue => setText(nextValue)}
              textStyle={{ minHeight: 64 }}
            />
          </KeyboardAwareScrollView>
        )}

        <RadioGroup selectedIndex={selectedIndex} onChange={index => setSelectedIndex(index)}>
          {options.map((option, index) => (
            <Radio key={index}>{option}</Radio>
          ))}
        </RadioGroup>   
      </Card>
    </Modal>
  );
};

export default AccidentScreen;