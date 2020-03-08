import Controller from './controller/ws/controller'

//const host: string = "http://localhost:5004/v1/devices/";
const host: string = "http://localhost:5004/";
const client: Controller = new Controller(host);

const request = {
    U1:{
        'RAM':'ALL',
        'CD':'ALL',
        'FLASH':'ALL',
    }
}

//передам СлотСеты реальным хостам используя API /v1/slots/put
async function waitForConnect() {
    await client.waitForConnect();
}

waitForConnect();

var startedTime: number = new Date().getTime();
var tempTime: number;
var count: number = 0;
async function cycle () {
    while (true) {
        try {
            const respond = await client.getData(host, request);
            tempTime = new Date().getTime();
            let	Time = tempTime - startedTime;
            console.log(`${count++} : ${((count/Time) * 1000).toFixed(2)}: ${respond}`);
            await delay(1);
        } catch (e) {
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