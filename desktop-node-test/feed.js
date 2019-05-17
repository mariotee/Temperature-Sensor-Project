/*
 * node for feeding data to firebase; 
 * this would simulate the pi sending data to firebase
 */

//get firebase package
const firebase = require('firebase');

//configuration (copy/pasted from firebase console for the project we want)
const config = {}
//sets up connection
firebase.initializeApp(config);
//reference to firebase database child '/temperature'
const ref = firebase.database().ref('/temperature');
let max = 20.81;
let min = 20.30;
//defined as async function because the queue array needs to filled before feeding more data
async function feedData() {
  //get snapshot once (no listening)
  let queue = (await ref.once('value')).val() || [];
  //this is just for the random number generator  
  let read = Math.random() * (max - min) + min;
  //simulating holes in graph
  if( read.toFixed(1) === '20.2' || read.toFixed(2) === '14.5') {
    read = 'null'
  }
  //if the queue is full (Array.push returns the new size of the array),
  //then shift the array. Array.shift removes the first element of the array
  //(and returns it, but we don't really need it)  
  if( queue.push(read) > 301 ) {
    queue.shift();
  }
  //the firebase set function is async
  await ref.set(queue);
}

//fires function every interval
setInterval(feedData,1000);
//just some scheduling of changing the min and max for more complex reads
setInterval(()=>{
  max = max * 1.42;
  if( max > 25 ) max = 15.0;
  if( max < 20 ) max = 15.0;
  min = min * 1.2;  
  if( min > 18 ) min = 12.0;
  if( min < 12 ) min = 12.0;
}, 3000)
setInterval(()=> {
  max = max / 1.5;
  if( max > 25 ) max = 15.0;
  if( max < 20 ) max = 15.0;
  min = min / 1.3
  if( min > 18 ) min = 12.0;
  if( min < 12 ) min = 12.0;
}, 10000)

setTimeout(()=>{process.exit()},30000)