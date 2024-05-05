import React from 'react';
import { Button, Layout, Text, Input, RadioGroup, Radio, Card, Modal, Icon } from '@ui-kitten/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { pingServer } from '../api/request';
import { styles } from '../styles';

type Props = {};

const AccidentScreen = ({ visibleAccident, onClose }) => {
  const [ text, setText ] = React.useState('');
  const [ selectedIndex, setSelectedIndex ] = React.useState(0);
  //const [ visibleAccident, setVisibleAccident ] = React.useState();

  const options = [
    'Неоплата по прибытии',
    'Техническая неисправность ТС в пути следования',
    'Задерживаюсь на погрузке/выгрузке',
    'Пробка на дороге/Движение затруднено',
    'Контактное лицо на точке выгрузке не отвечает',
    'При погрузке/выгрузке выявлен некондиционный товар',
    'Другое',
  ];

  const displayValue = options[selectedIndex];

  const handleSubmit = async () => {
    const payload = displayValue === 'Другое' ? text : displayValue;

    await pingServer(); // TODO ручку отправки что случилось
  };

  const renderCardHeader = () => {
    return (
      <Layout style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <View style={styles.containerCardText}>
          <Icon name="alert-triangle-outline" width={23} height={23} style={styles.textHeaderCardIcon}></Icon>
          <Text category="h6" style={styles.textHeaderCard}>Сообщить о происшествии</Text>
        </View>
      </Layout>
    )
  }

  const renderCardFooter = () => {
    return (
      <Layout style={{}} level="1">
        <Button
          appearance="filled"
          onPress={handleSubmit}
          style={{}}>
          Подтвердить
        </Button>
        {/*<Button
          appearance="outline"
          onPress={onClose}
          style={{}}>
          Отмена
        </Button>*/}
      </Layout>
    )
  }

  return (
    <Modal
      visible={visibleAccident}
      backdropStyle={styles.backdrop}     
    >
      <Card
        style={{margin: 20}}
        status='warning'
        header={renderCardHeader}
        footer={renderCardFooter}
      >
        <RadioGroup
          selectedIndex={selectedIndex}
          onChange={index => setSelectedIndex(index)}
        >
          {options.map((option, index) => (
            <Radio key={index}>
              {`${option}`}
            </Radio>
          ))}
        </RadioGroup>

        {displayValue === 'Другое' && (
          <Input
            multiline={true}
            placeholder="Другое"
            label="Другое"
            value={text}
            onChangeText={nextValue => setText(nextValue)}
            textStyle={{ minHeight: 64 }}
          />
        )}
      </Card>  
    </Modal>
  );
};

/*const styles = StyleSheet.create({
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
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});*/

export default AccidentScreen;
