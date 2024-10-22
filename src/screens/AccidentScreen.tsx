import React, { useState, useEffect } from 'react';
import { Button, Layout, Text, Input, RadioGroup, Radio, Card, Modal, Icon, Spinner } from '@ui-kitten/components';
import { KeyboardAvoidingView, Platform, View, Keyboard } from 'react-native';
import { getDataPostRoute } from '../components/functions.js';
import { postRoute } from '../api/routes';
import NetInfo from '@react-native-community/netinfo';
import FunctionQueue from '../utils/FunctionQueue.js';
import { styles } from '../styles';
import localStorage from '../store/localStorage';

const queue = new FunctionQueue();

const AccidentScreen = ({ visibleAccident, onClose, uidPoint, uid }) => {
  const [text, setText] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pending, setPending] = useState(false);
  const [accidents, setAccidents] = useState([]);
  const [keyboardSize, setKeyboardSize] = useState(0);

  console.log({visibleAccident});
 
  //-- При открытии клавиатуры нам надо изменить положение модального окна
  useEffect(() => { 
    const showListener = Keyboard.addListener("keyboardDidShow", e => {
      setKeyboardSize(e.endCoordinates.height)
    });
    const hideListener = Keyboard.addListener("keyboardDidHide", e => {
      setKeyboardSize(e.endCoordinates.height)
    });
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        queue.processQueue();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchStorageKey = async () => {
      try {
        const StorageKey = await localStorage.getItem('LoginKey');
        if (StorageKey) {
          const accidents = StorageKey.parametrs.accidents;

          accidents.sort((a, b) => {
            return b.code.localeCompare(a.code, undefined, { numeric: true });
          });

          setAccidents(accidents);
        }
      } catch (error) {
        console.error('Error retrieving storage key:', error);
      }
    };

    fetchStorageKey();
  }, []);

  const displayValue = accidents[selectedIndex];

  const handleSubmit = async () => {
    setPending(true);
    const payload = displayValue.code;

    const data = {
      ...getDataPostRoute(),
      screen: 4,
      accident: payload,
      uidPoint,
    };

    await updateData(data);
  };

  const updateData = async (data) => {
    const netInfo = await NetInfo.fetch();
    const callback = async () => {
      await postRoute(uid, JSON.stringify(data));
      setPending(false);
      onClose();
    };

    if (!netInfo.isConnected) {
      data.needJSON = false;
      queue.enqueue(callback);
    } else {
      await callback();
    }
  };

  const renderCardHeader = () => (
    <Layout style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
      <Icon name="alert-triangle-outline" width={23} height={23} />
      <Text category="s1" style={styles.textHeaderCard}>Сообщить о происшествии</Text>
    </Layout>
  );

  const renderCardFooter = () => (
    <Layout level="1">
      <Layout style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 10 }}>
        <Button
          appearance="filled"
          status='basic'
          onPress={handleSubmit}
          style={{ flex: 1 }}
          accessoryLeft={<Icon name='checkmark-square-outline' fill="#FFFFFF" />}
        >
          Подтвердить
        </Button>
      </Layout>
    </Layout>
  );

  return (
    <Modal
      visible={visibleAccident}
      backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onBackdropPress={onClose}
    >
      {pending && (
        <View style={styles.spinnerContainer}>
          <Spinner size="giant" />
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
        style={{ flex: 1 }}
      >
        <Card
          disabled={true}
          style={[styles.containerCards, { borderWidth: 0, width: 350, marginBottom: keyboardSize  }]}
          status='warning'
          header={renderCardHeader}
          footer={renderCardFooter}
        >
          <RadioGroup
            selectedIndex={selectedIndex}
            onChange={setSelectedIndex}
          >
            {accidents.map((option, index) => (
              <Radio key={index} style={{ paddingLeft: 10 }}>
                {option.name}
              </Radio>
            ))}
          </RadioGroup>

          {displayValue?.code === '000000001' && (
            <View style={{ padding: 10 }}>
              <Input
                multiline
                placeholder="Введите текст"
                value={text}
                onChangeText={setText}
                size='medium'
              />
            </View>
          )}
        </Card>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AccidentScreen;
