// FunctionQueue.js
class FunctionQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  // Метод для добавления функции в очередь
  enqueue(fn, ...args) {
    this.queue.push(() => fn(...args));
    this.processQueue();
  }

  // Метод для обработки очереди
  async processQueue() {
    if (this.isProcessing) return; // Если уже обрабатывается, выходим
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const currentFunction = this.queue.shift();
      try {
        await currentFunction(); // Выполняем текущую функцию
      } catch (error) {
        console.error('Ошибка при выполнении функции:', error);
      }
    }

    this.isProcessing = false; // Устанавливаем статус обработки
  }
}

export default FunctionQueue;
