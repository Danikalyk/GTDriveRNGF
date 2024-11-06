/**
 * AccidentScreen - компонент, предназначенный для отображения модального окна, в котором пользователи могут сообщать о происшествиях.
 * 
 * Основные функции:
 * - Выбор типа происшествия из списка радио-кнопок, загружаемого из локального хранилища.
 * - Возможность ввода дополнительного текста при выборе определенного типа происшествия.
 * - Отправка данных о происшествии на сервер с учетом текущего состояния подключения к интернету.
 * - Поддержка адаптивного интерфейса, который учитывает открытие клавиатуры для удобства пользователей.
 * 
 * Входные параметры:
 * - visibleAccident: Булевое значение, определяющее, отображается ли модальное окно.
 * - onClose: Функция, вызываемая для закрытия модального окна.
 * - uidPoint: Уникальный идентификатор точки, связанной с происшествием.
 * - uid: Уникальный идентификатор текущего пользователя или сессии.
 * - uidOrder: Уникальный идентификатор текущего заказа (если происшествие вызвано заказом)
 * 
 * Внутренние компоненты:
 * - renderCardHeader: Функция, отображающая заголовок карточки.
 * - renderCardFooter: Функция, отображающая подвал карточки с кнопкой подтверждения.
 * 
 */

import React, { useState, useEffect } from 'react';
import { Button, Layout, Text, Input, RadioGroup, Radio, Card, Modal, Icon, Spinner } from '@ui-kitten/components';
import { KeyboardAvoidingView, Platform, View, Keyboard, Dimensions } from 'react-native';
import { getDataPostRoute } from '../components/functions.js';
import { postRoute } from '../api/routes';
import NetInfo from '@react-native-community/netinfo';
import FunctionQueue from '../utils/FunctionQueue.js';
import { styles } from '../styles';
import localStorage from '../store/localStorage';

const queue = new FunctionQueue();

const AccidentScreen = ({ visibleAccident, onClose, uidPoint, uid, uidOrder }) => {
  const [text, setText] = useState(''); // Состояние для текстового ввода
  const [selectedIndex, setSelectedIndex] = useState(0); // Индекс выбранного радио-кнопки
  const [pending, setPending] = useState(false); // Состояние загрузки
  const [accidents, setAccidents] = useState([]); // Список происшествий
  const [keyboardSize, setKeyboardSize] = useState(0); // Высота клавиатуры

  // Получаем ширину экрана - 20 пикселей
  const screenWidth = Dimensions.get('window').width;
  const modalWidth = screenWidth - 20;

  // Слушатели событий для изменения положения модального окна при открытии клавиатуры
  useEffect(() => {
    const showListener = Keyboard.addListener("keyboardDidShow", e => setKeyboardSize(e.endCoordinates.height));
    const hideListener = Keyboard.addListener("keyboardDidHide", () => setKeyboardSize(0));

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  // Проверка подключения к интернету
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        queue.processQueue(); // Обработка очереди, если есть интернет
      }
    });

    return () => unsubscribe();
  }, []);

  // Загрузка данных о происшествиях из локального хранилища
  useEffect(() => {
    const fetchStorageKey = async () => {
      try {
        const StorageKey = await localStorage.getItem('LoginKey');
        if (StorageKey) {
          const sortedAccidents = StorageKey.parametrs.accidents.sort((a, b) =>
            b.code.localeCompare(a.code, undefined, { numeric: true })
          );
          setAccidents(sortedAccidents);
        }
      } catch (error) {
        console.error('Ошибка при получении ключа:', error);
      }
    };
    fetchStorageKey();
  }, []);

  const handleSubmit = async () => {
    setPending(true);
    let payload = accidents[selectedIndex]?.code; // Получаем код выбранного происшествия

    /*if (payload === '000000001') {
      payload = text;    
    }*/

    const data = {
      ...getDataPostRoute(),
      screen: 4,
      accident: payload,
      accidentText: text,
      uidPoint,
      uidOrder,
      uid
    };

    await updateData(data); // Обновляем данные
  };

  const updateData = async (data) => {
    const netInfo = await NetInfo.fetch();
    const callback = async () => {
      await postRoute(uid, JSON.stringify(data)); // Отправка данных на сервер
      setPending(false);
      onClose(); // Закрытие модального окна
    };

    if (!netInfo.isConnected) {
      data.needJSON = false;
      queue.enqueue(callback); // Добавление в очередь, если нет подключения
    } else {
      await callback();
    }
  };

  // Заголовок карточки
  const renderCardHeader = () => (
    <Layout style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
      <Icon name="alert-triangle-outline" width={23} height={23} />
      <Text category="s1" style={styles.textHeaderCard}>Сообщить о происшествии</Text>
    </Layout>
  );

  // Подвал карточки с кнопкой подтверждения
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

  // Основная разметка модального окна
  return (
    <Modal
      visible={visibleAccident}
      backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onBackdropPress={onClose}
    >
      {pending && (
        <View style={styles.spinnerContainer}>
          <Spinner size="giant" status='basic' />
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
        style={{ flex: 1 }}
      >
        <Card
          disabled={true}
          style={[styles.containerCards, { borderWidth: 0, width: modalWidth, marginBottom: keyboardSize }]}
          status='basic'
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

          {accidents[selectedIndex]?.code === '000000001' && (
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