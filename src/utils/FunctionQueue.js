import {Alert} from 'react-native';

// FunctionQueue.js
class FunctionQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.delay = 500; // Задержка между функциями в миллисекундах
  }

  // Метод для добавления функции в очередь
  enqueue(fn, ...args) {
    console.log('enqueue', fn, args);

    this.queue.push(() => fn(...args));

    console.log('queue', this.queue);
    // this.processQueue();
  }

  // Функция для задержки (sleep)
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Метод для обработки очереди
  async processQueue() {
    //console.log('Обработка очереди', this);

    if (this.isProcessing) return; // Если уже обрабатывается, выходим
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const currentFunction = this.queue.shift();
      try {
        console.log('currentFunction', currentFunction);
        await currentFunction(); // Выполняем текущую функцию
      } catch (error) {
        console.error('Ошибка при выполнении функции:', error);
      }

      // Добавляем задержку между функциями
      await this.sleep(this.delay);
    }

    this.isProcessing = false; // Устанавливаем статус обработки
  }
}

export default FunctionQueue;
