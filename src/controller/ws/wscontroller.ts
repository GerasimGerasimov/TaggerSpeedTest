import WebSocket = require('ws');

interface handler {({}): any;}

export default class WSControl {

    private host: string;
    private ws:WebSocket;
    private hostState: boolean = false;

    private count: number = 0;
    private onIncomingMessage: handler;

    constructor (host: string, handler: handler){
        this.host = host;
        this.onIncomingMessage = handler;
        this.initSocket();
    }

    public send(payload: any){
        this.ws.send(JSON.stringify(payload));
    }

    public async waitForConnect(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.ws.readyState === WebSocket.OPEN) return resolve();
            console.log('waitForConnect...');
            const Timer = setInterval( ()=>{
                if (this.ws.readyState === WebSocket.OPEN) { 
                    clearInterval(Timer);
                    console.log('Connected!');
                    return resolve();
                }
            }, 100);
        })
    }
 
    // Инициализация сокета и восстановление связи
    private initSocket() {
        this.ws = new WebSocket(this.host);
        this.ws.onerror = this.onError.bind(this);
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
    }

    private onOpen(event: any) {
        console.log(`Opened connection to ${this.host}`);
        this.hostState = true;
    }    

    private onError(event: any) {
        console.log(`Error of connection to ${this.host} ${event}`);
    }

    private onClose(event: any) {
        console.log(`Closed connection to ${this.host}`);
        this.hostState = false;
        setTimeout(() => {
            console.log(`Try connect to ${this.host}`);
            this.initSocket();
        }, 1000);        
    }

    private onMessage(msg: any) {
        this.onIncomingMessage(msg.data);
    }

    //чтени сокета в режиме запрос-ожидание ответа- ответ
    public async waitBufferRelease(): Promise<any> {
        return new Promise((resolve, reject) => {
            var timeOutTimer: any = undefined;
            var chekBufferTimer: any = undefined;
            if (this.ws.bufferedAmount === 0)
                return resolve('OK, buffer is empty'); //буфер чист
            //ошибка, если буфер не очистился за 1 сек 
            timeOutTimer = setTimeout( () => {
                clearTimeout(timeOutTimer);
                clearInterval(chekBufferTimer);
                reject(new Error ('Time out, buffer does not empty'))
            }, 1000);
            //постоянная проверка буфера на очистку
            chekBufferTimer = setInterval( () => {
                if (this.ws.bufferedAmount === 0) {
                    clearTimeout(timeOutTimer);
                    clearInterval(chekBufferTimer);
                    return resolve('OK, buffer is empty'); //буфер чист
                }
            }, 1);
        });
    }
}

/*
   public async send(request: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.waitForConnect();
                //console.log('wss.send');
                if (!this.hostState)
                    reject( new Error ('WebSocket is not connected to host')) 
                //отбой сразу если нет соединения
                if (this.ws.readyState !== WebSocket.OPEN) 
                    reject( new Error ('WebSocket is not connected to host'))
                //как-то надо подождать если есть не отправленные байты
                await  this.waitBufferRelease();
                //теперь отправлю сообщение и дождусь на него ответ, или тайм аут
                this.ws.send(request);
                //ошибка, если буфер не получил ответ за 1 сек 
                const timeOutTimer = setTimeout( ()=>{
                    clearTimeout(timeOutTimer);
                    reject(new Error ('time out'))
                }, 3000);
                this.ws.onmessage = (msg: any) => {
                    //clearTimeout(timeOutTimer);
                    return resolve(msg.data);
                }            
                //Ecли ошибка сокета  
                this.ws.onerror = (msg: any) => {
                        //clearTimeout(timeOutTimer);
                        reject(new Error(msg));
                }
            } catch (e) {
                return reject (new Error (e.message))
            }                      
        })
    }

*/