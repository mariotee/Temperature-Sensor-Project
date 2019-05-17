//firebase library
const firebase = require('firebase');
//binary converter library
const BINARY = require('s-binary');
//thermometer library for part # ds18b20
const THERMO = require('ds18b20');
//this 'device id' might be different for other sensors
const DEV_ID = '28-0417520503ff';
//GPIO library to interact with RPi's IO pins
const GPIO = require('onoff').Gpio;
//assigning pins
//recall that GPIO4 is reserved for the thermometer (1-wire interface)
const READY_LED = new GPIO(16,'out');
const ERROR_LED = new GPIO(12,'out');
const BUTTON = new GPIO(11,'in','both');
const SWITCH = new GPIO(5,'in','both');
//binary LEDs
const LED6 = new GPIO(2,'out');
const LED5 = new GPIO(3,'out');
const LED4 = new GPIO(17,'out');
const LED3 = new GPIO(27,'out');
const LED2 = new GPIO(22,'out');
const LED1 = new GPIO(10,'out');
const LED0 = new GPIO(9,'out');
//create array for all the data LEDs' references to use later
const dataLeds = [LED6,LED5,LED4,LED3,LED2,LED1,LED0];
//this is only used to free resources @ interrupt
const otherGpio = [READY_LED,ERROR_LED,BUTTON,SWITCH];
//copy/pasted from the Firebase console for our project
const firebaseConfig = {
  apiKey: "KEY",
  authDomain: "PROJECT",
  databaseURL: "DB",
  projectId: "ID",
  storageBucket: "BUCKET",
  messagingSenderId: "SENDER"
};

firebase.initializeApp(firebaseConfig);
//blinks the ready light
READY_LED.writeSync(0);
msSleep(250);
READY_LED.writeSync(1);
msSleep(250);
READY_LED.writeSync(0);
msSleep(250);
READY_LED.writeSync(1);
msSleep(250);
READY_LED.writeSync(0);
ERROR_LED.writeSync(1);
//getting references to the database's specific keys (children)
const firebaseTemperatureRef = firebase.database().ref('/temperature');
const firebaseLedRef = firebase.database().ref('/ledActive');

//setting up some global variables
var display = false;
var error = false;
var currentTemperature;
var masterSwitch = SWITCH.readSync();

//master switch listener
SWITCH.watch((err,val) => {
  if( err ) {
    console.error('SWITCH error watch')
  }
  masterSwitch = val;
});
//button push listener
BUTTON.watch((err,val) => {
  if( err ) {
    console.error('BUTTON error watch')
  }

  if( val === 1 ) {
    firebaseLedRef.set(true);
  }
  else {
    firebaseLedRef.set(false);
  }
});
//listens for ledActive from firebase
firebaseLedRef.on('value', (snapshot) => {
  display = snapshot.val();
});
//set interval to call feed data every 1000 ms
setInterval(feedData,1000);
setInterval(checkDisplay,20);
//checks for display Boolean
function checkDisplay() {
  if( masterSwitch && display ) {
    const binaryString = decimalToBinary(currentTemperature);
    const binaryArray = binaryString.split('');

    for( let i = 0; i < 7; ++i ) {
      binaryArray[i] === '1'
        ? dataLeds[i].writeSync(0)
        : dataLeds[i].writeSync(1)
    }
  }
  else {
    for( let item of dataLeds ) {
      item.writeSync(1);
    }
  }
}
//feeds data from thermometer
async function feedData() {
  if( error ) {
    ERROR_LED.writeSync(0);
    setTimeout(()=>{ ERROR_LED.writeSync(1) },250);
  }

  let queue = (await firebaseTemperatureRef.once('value')).val() || [];

  THERMO.temperature(DEV_ID, (err,temperature) => {
    if(err) {
      console.error('fatal error in temperature read');
      //maybe rapidly flash red LED here
    }
    else {
      error = false;
      currentTemperature = masterSwitch ? temperature : 'nothing';
      //the ds18b20 returns boolean false if not read
      if( currentTemperature === false ) {
        error = true;
        currentTemperature = 'nothing';
      }
    }

    if( queue.push(currentTemperature) > 301 ) {
      queue.shift();
    }
    firebaseTemperatureRef.set(queue);
  });
}

//our decimal to binary parser
function decimalToBinary(input) {
  const parsed = parseFloat(input);
  const integer = Math.round(parsed);
  const isNegative = integer < 0;

  if( isNegative ) {
    const binary = BINARY.toBinary(Math.abs(integer),7);
    return BINARY.complement(binary,7);
  }
  else {
    return BINARY.toBinary(integer,7);
  }
}
//our sleep function in milliseconds
function msSleep(milliseconds) {
  const now = new Date();
  let current = null;
  do { current = new Date() }
  while( current - now < milliseconds )
}
//this is called when we do CTRL+C
process.on('SIGINT', () => {
  process.exit();
});

process.on('exit', () => {
  //free resources
  for( let item of dataLeds ) {
    item.unexport();
  }
  for( let item of otherGpio ) {
    item.unexport();
  }
});
