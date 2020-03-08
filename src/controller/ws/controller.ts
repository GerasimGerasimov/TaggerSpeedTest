import WSControl from './wscontroller'
import {IErrorMessage} from '../../utils/types'

export default class Controller {

    private  wss: WSControl;
    
    constructor (host: string){
        this.wss = new WSControl(host);
    }
    
    public async waitForConnect(){
        await this.wss.waitForConnect();
    }

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

    private validationJSON (data: any): any | IErrorMessage {
        try {
            return JSON.parse(data);
        } catch (e) {
            throw new Error ('Invalid JSON');
        }
    }
}