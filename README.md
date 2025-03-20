# GTDriveNext

Мобильное приложение GTDriveNext, разработанное с использованием React Native. Приложение предназначено для отслеживания геолокации и управления данными в реальном времени.

## 🚀 Возможности

- Отслеживание геолокации в фоновом режиме
- Чат и коммуникации
- Управление файлами и изображениями
- Безопасное хранение данных
- Адаптивный пользовательский интерфейс
- Поддержка офлайн-режима
- Автоматическое обновление приложения

## 🛠 Технологии

- React Native 0.71.8
- TypeScript
- UI Kitten (Eva Design System)
- React Navigation
- SWR для управления состоянием
- React Native Background Geolocation
- React Native Gifted Chat
- React Native File System
- И другие современные библиотеки

## 📋 Предварительные требования

- Node.js (версия указана в .node-version)
- Yarn или npm
- React Native CLI
- Android Studio (для Android)
- Xcode (для iOS)
- Ruby (для iOS)

## 🔧 Установка

1. Клонируйте репозиторий:
```bash
git clone github.com/Danikalyk/GTDriveRNGF
cd GTDriveRGNF
```

2. Установите зависимости:
```bash
yarn install
# или
npm install
```

3. Для iOS установите зависимости через CocoaPods:
```bash
cd ios
pod install
cd ..
```

## 🚀 Запуск

### Android
```bash
 npx react-native run-android
```

### iOS
```bash
yarn ios
# или
npm run ios
```

### Запуск Metro сервера
```bash
yarn start
# или
npm start
```

## 📝 Скрипты

- `yarn android` - запуск приложения на Android
- `yarn ios` - запуск приложения на iOS
- `yarn start` - запуск Metro сервера
- `yarn test` - запуск тестов
- `yarn lint` - проверка кода с помощью ESLint
- `yarn prettier` - форматирование кода с помощью Prettier

## 🏗 Структура проекта

```
GTDriveNext/
├── android/         # Нативные файлы Android
├── ios/             # Нативные файлы iOS
├── src/             # Исходный код приложения
├── __tests__/       # Тесты
├── App.tsx          # Корневой компонент
└── package.json     # Зависимости и скрипты
```

## 🔒 Безопасность

- Использование Encrypted Storage для хранения чувствительных данных
- Безопасная работа с файлами
- Проверка состояния сети
- Оптимизация батареи

## 📱 Поддерживаемые платформы

- Android
- iOS

## 🤝 Вклад в проект

1. Создайте форк проекта
2. Создайте ветку для вашей функции (`git checkout -b feature/AmazingFeature`)
3. Зафиксируйте изменения (`git commit -m 'Add some AmazingFeature'`)
4. Отправьте изменения в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект является приватным и защищен авторским правом.
