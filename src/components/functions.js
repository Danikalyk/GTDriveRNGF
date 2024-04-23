// status - Статусы
//
// Параметры:
//  	0	- не обработано	
//		1	- текущий
// 		2	- на точке
//  	3 	- завершен
//  	-1	- отказ 
//  	-2  - недоступен

export const getCardStatus = status => {
    if (status === 1) {
        return 'info';
    } else if (status === 2) {
        return 'warning';
    } else if (status === 3) {
        return 'success';
    } else {
        return 'basic';
    }
};

export const getToggleCardStatus = item => {
    let date1c = new Date(item.date).getTime();
    let dateEmpty = new Date("0001-01-01T00:00:00+00:00").getTime();

    return date1c !== dateEmpty;
};

export const getDataPostRoute = () => {
    let currentDate = new Date();
    let images = [];

    const data = {
        screen: -1,                                         // Экран
        point: -1,                                          // 
        uidOrder: "00000000-0000-0000-0000-000000000000",      // Это обрабатываемый заказ
        uid: "00000000-0000-0000-0000-000000000000",        // Это текущий МаршрутДоставки
        uidTask: "00000000-0000-0000-0000-000000000000",       // Задача
        uidPoint: "00000000-0000-0000-0000-000000000000",       // ТочкаДоставки
        type: -1,                                           // Тип 
        date: currentDate.toJSON(),                         // Дата
        images: images                                      // Изображения
    };

    return data;
}
