import WSControl from './wscontroller'
import {IErrorMessage} from '../../utils/types'
//криптография
import {randomStringAsBase64Url} from '../../utils/utils'


interface handler {({}): any;}

class TTask {
    MessageID: string;
    cmd: string;
    payload: any;
}

class TMessage {
    ClientID: string;
    Task: TTask;
}

export default class Controller {

    private ID: string;
    private wss: WSControl;
    private count: number = 0;
    
    constructor (host: string){
        this.wss = new WSControl(host, this.checkIncomingMessage.bind(this));
    }
    
    public addGetCmdToList(payload: any){
        console.log('addGetCmdToList');
        const task:TTask = {
            MessageID: randomStringAsBase64Url(4),
            cmd:'get',
            payload
        }
        this.sendTask(task);
    }

    public async sendTask(Task:TTask) {
        await this.wss.waitForConnect();
        await this.wss.waitBufferRelease();
        console.log('sendTask');
        const message: TMessage = {
            ClientID: this.ID,
            Task
        }
        this.wss.send(message)
    }

    public checkIncomingMessage(msg: TMessage) {
        const respond: any = this.validationJSON(msg);
        const cmd = this.getCmdName(respond);
        const commands = {
            'id' : this.recdID.bind(this),
            'get': this.getCmd.bind(this),
            'confirm': this.confirm.bind(this),
            'default': () => {'Unknown command'}
        };
        (commands[cmd] || commands['default'])(respond);
    }

    private getCmdName(cmd: any): string {
        for (let key in cmd) {
            return key;
          }
        throw new Error ('Invalid request format');
    }

    //получен ID клиента
    private recdID(request: any){
        this.ID = request.id;
    }

    //получен ID клиента
    private getCmd(respond: any){
        const data = respond.get;
        console.log(`${this.count++}: ${data.time}`);
    }

    //подтверждения от сервера (о том что принял команду)
    private confirm(request: any) {
        console.log(request);
    }

    /*
    public async getData(host: string, data: any):Promise<any | IErrorMessage> {
        try {
            const payload: string = JSON.stringify({get:data});
            return await this.wss.send(payload)
                .then (this.validationJSON);
        } catch(e) {
            console.log(e);
            throw new Error (`Fetch Error: ${e.message}`);
        }
    }   
*/
    private validationJSON (data: any): any | IErrorMessage {
        try {
            return JSON.parse(data);
        } catch (e) {
            throw new Error ('Invalid JSON');
        }
    }
}