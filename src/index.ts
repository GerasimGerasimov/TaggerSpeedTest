import Controller from './controller/controller'

const host: string = "http://localhost:5004/v1/devices/";

const request = {
    U1:{
        'RAM':'ALL',
        'CD':'ALL',
        'FLASH':'ALL',
    }
}

var startedTime: number = new Date().getTime();
var tempTime: number;
var count: number = 0;
async function cycle () {
    while (true) {
        try {
            const respond = await Controller.getData(host, request);
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