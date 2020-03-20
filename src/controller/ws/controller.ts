import WSControl from './wscontroller'
import {IErrorMessage} from '../../utils/types'
//криптография
import {randomStringAsBase64Url} from '../../utils/utils'

class TTask {
    MessageID: string = '';
    cmd: string = '';
    payload: any = {};
    Respond?: any = {};
    TimeOut?: number = new Date().getTime()+3000;
    callback: Function = undefined;
}

class TRespond {
    MessageID: string = '';
    cmd: string = '';
    payload: any = {};
}

class TMessage {
    ClientID: string = '';
    MessageID: string = '';
    cmd: string = '';
    payload: any = {};
}

export default class Controller {

    private TaskList: Map<string, TTask>;
    private ID: string;
    private wss: WSControl;
    private count: number = 0;
    
    constructor (host: string){
        this.wss = new WSControl(host, this.checkIncomingMessage.bind(this));
        this.TaskList = new Map<string, TTask>();
        this.controlResponds();
    }
    
    public addGetCmdToList(payload: any, callback: Function){
        console.log('addGetCmdToList');
        const task:TTask = {
            MessageID: randomStringAsBase64Url(4),
            cmd:'get',
            payload,
            TimeOut: new Date().getTime()+3000,
            callback
        }
        this.TaskList.set(task.MessageID, task);
        this.sendTask(task);
    }

    public async sendTask(Task:TTask) {
        const message: TMessage = {
            ClientID: this.ID,
            MessageID: Task.MessageID,
            cmd: Task.cmd,
            payload: Task.payload
        }
        await this.wss.send(message)
    }

    public checkIncomingMessage(msg: TMessage) {
        const respond: any = this.validationJSON(msg);
        const cmd = respond.cmd;
        const commands = {
            'id' : this.gotClientID.bind(this),
            'get': this.getCmd.bind(this),
            'default': () => {'Unknown command'}
        };
        (commands[cmd] || commands['default'])(respond);
    }

    //получен ID клиента
    private gotClientID(request: any){
        this.ID = request.payload;
    }

    private async getCmd(respond: TRespond){
        const data: any = respond.payload;
        const task:TTask = this.TaskList.get(respond.MessageID);
        if (task) {
            task.Respond = data;
            console.log(`${this.count++}: ${data.time}`);
            if (task.callback) await task.callback(task.Respond);
            this.sendTask(task);
            this.setUpdateTime(task);
        }
    }

    private setUpdateTime(task: TTask) {
        let newTime = new Date().getTime()+3000;
        task.TimeOut = newTime;
    }

    private controlResponds(){
        let Timer = setInterval(()=>{
            this.TaskList.forEach((value: TTask) => {
                const time = new Date().getTime();//текущее время
                if (time > value.TimeOut) { // не пришёл ответ за заданное время
                    this.warnTimeOut(value);
                }
            })
        }, 1000);
    }

    //сообщает о тайм-ауте
    private warnTimeOut(task: TTask) {
        console.log(`${task.MessageID} respond out of date`);
        const respond: IErrorMessage = {
            status:'Error',
            msg:'Time Out. Server not respond'
        }
        task.Respond = respond;
        //отправить команду заново (вдруг забыл)
        this.sendTask(task);
    }

    private validationJSON (data: any): any | IErrorMessage {
        try {
            return JSON.parse(data);
        } catch (e) {
            throw new Error ('Invalid JSON');
        }
    }

}