'use strict';

let bleIsConnected = false;

let bleServers = null;

let bleCharacteristics = null;

window.onload = function(){

  let connectBtn = document.getElementById('connectBtn');
   
  connectBtn.addEventListener('click', connectBtnClick);

  let sendBtn = document.getElementById('sendBtn');
  sendBtn.addEventListener('click', sendBtnClick);

  let clearLogBoxBtn = document.getElementById('clearLogBoxBtn');
  clearLogBoxBtn.addEventListener('click', clearLogBoxBtnClick);
}

function clearLogBoxBtnClick(){
  document.getElementById("logBox").textContent = "";
}

function sendBtnClick(){
  let toSendText = new ArrayBuffer;
  console.log(document.getElementById('sendBox'));
  return bleCharacteristics.writeValue(toSendText);
}

function handleInDataCharacteristicValueChanged(event){
  let receivedString = String.fromCharCode.apply(null, new Uint8Array(event.target.value.buffer));
  let receivedlen = receivedString.length;
  document.getElementById("logBox").textContent += '(' + receivedlen + ') ' + receivedString + '\n';
}

function onDisconnected(event) {
  let device = event.target;
  document.getElementById("logBox").textContent += 'Device ' + device.name + ' is disconnected.\n';
}

function connectBtnClick(){
  navigator.bluetooth.requestDevice({
    filters: [{ 
      name: 'SimpleSerialSocket',
    }],
    optionalServices: [ 0xC0C0 ] 
  })
  .then(device => {
    document.getElementById("logBox").textContent += 'Connected to device: ' + device.name + ".\n";
    // Set up event listener for when device gets disconnected.
    device.addEventListener('gattserverdisconnected', onDisconnected);
    // Attempts to connect to remote GATT Server.
    return device.gatt.connect();
  })
  .then(server => {
    // console.log(server);
    return server.getPrimaryServices();
  })
  .then(servers =>{
    // console.log(servers);
    bleServers = servers;
    return servers[0].getCharacteristics();
  })
  .then(characteristics => {
    characteristics[1].startNotifications();
    characteristics[1].addEventListener('characteristicvaluechanged', handleInDataCharacteristicValueChanged);
    // console.log(characteristics);
    bleCharacteristics = characteristics[0];
    // console.log(bleCharacteristics);
  })
  .then(() => {
    document.getElementById("logBox").textContent += 'All ready.\n';
  })
  .catch(error => { console.log(error); });
}
