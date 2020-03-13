import Controller from './controller/ws/controller'
/* TODO  Сервер хранит список заданий и заваливает Клиента сообщениями.
1) создать SET или МАР сообщений и их обработчиков и параметров
   MessageID, payload, callback
2) Передать скопом серверу всё что я от него хочу масив: [{ClientID, MessageID, payload}]
    Это будет setTask (передаётся массив заданий)
        У сервера будет Список Задач клиента
    Соотв. есть:
    - deleteTask({ClientID, MessageID})
    - getTasksList(ClientID) - для контроля особнно при восстановлении коннекта
3) запустить таймер на тайм-аут
4) тайм-аут (но не было disconnect) - вернуться к п.2
5) Дисконнект - попытка восстановления связи и вернуться к п.2 если connect
6) Приходит ответ (любой)
7) По MessageID передаю ответ в соответствующий callback
И пусть теперь Сервер, имея список заданий, засыпает Клиента сообщениями
Так как Клиент в 99% случаев работате как потребитель данных, нет необходимости
их каждый раз запрашивать.
*/
//const host: string = "http://localhost:5004/v1/devices/";
const host: string = "http://localhost:5004/";
const client: Controller = new Controller(host);

const task = {
        U1:{
        'RAM':'ALL',
        'CD':'ALL',
        'FLASH':'ALL'
        }
}

client.addGetCmdToList(task);

var startedTime: number = new Date().getTime();
var tempTime: number;
var count: number = 0;
var errcount: number = 0;
/*
async function cycle () {
    console.log(`Cycle started: ${request}`);
    while (true) {
        try {
            const respond = await client.getData(host, request);
            tempTime = new Date().getTime();
            let	Time = tempTime - startedTime;
            console.log(`${count++} : ${errcount} : ${((count/Time) * 1000).toFixed(2)}: ${respond.data}`);
            await delay(5);
        } catch (e) {
            errcount++;
            console.log(`Error: ${e}`);
            await delay(1000);
        } 
    }
}

function delay(ms: number) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, ms);
    });
}

cycle();
*/