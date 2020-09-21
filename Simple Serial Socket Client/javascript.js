'use strict';

let bleIsConnected = false;

let bleServers = null;

let ledStatus = [0, 0];

window.onload = function(){

  let connectBtn = document.getElementById('connectBtn');
  connectBtn.addEventListener('click', connectBtnClick);

  let led1Btn = document.getElementById('led1Btn');
  led1Btn.addEventListener('click', led1BtnClick);

  let led2Btn = document.getElementById('led2Btn');
  led2Btn.addEventListener('click', led2BtnClick);

  let btn1Btn = document.getElementById('btn1Btn');
  btn1Btn.addEventListener('click', btn1BtnClick);

  let btn2Btn = document.getElementById('btn2Btn');
  btn2Btn.addEventListener('click', btn2BtnClick);

}

function onDisconnected(event) {
  let device = event.target;
  document.getElementById("blep").innerHTML = 'Device ' + device.name + ' is disconnected.';
}

function handleBtn1CharacteristicValueChanged(event){
  var value = event.target.value.getUint8(0);
  document.getElementById("btn1p").innerHTML = (value == 0) ? "Btn1 up." : "Btn1 down.";
}

function handleBtn2CharacteristicValueChanged(event){
  var value = event.target.value.getUint8(0);
  document.getElementById("btn2p").innerHTML = (value == 0) ? "Btn2 up." : "Btn2 down.";
}

function btn2BtnClick(){
  return bleServers[1].getCharacteristics()
  .then(characteristics => {
    characteristics[1].startNotifications();
    characteristics[1].addEventListener('characteristicvaluechanged', handleBtn2CharacteristicValueChanged);
  });
}

function btn1BtnClick(){
  return bleServers[1].getCharacteristics()
  .then(characteristics => {
    characteristics[0].startNotifications();
    characteristics[0].addEventListener('characteristicvaluechanged', handleBtn1CharacteristicValueChanged);
  });
}

function led2BtnClick(){
  if (ledStatus[1] == 0)
  {
    ledStatus[1] = 1;
    document.getElementById("led2p").innerHTML = (ledStatus[1] == 1) ? "Led1 is on." : "Led1 is off.";
    return bleServers[0].getCharacteristics()
    .then(characteristics => {
      return characteristics[1].writeValue(Uint8Array.of(1));
    });
  } else{
    ledStatus[1] = 0;
    document.getElementById("led2p").innerHTML = (ledStatus[1] == 1) ? "Led1 is on." : "Led1 is off.";
    return bleServers[0].getCharacteristics()
    .then(characteristics => {
      return characteristics[1].writeValue(Uint8Array.of(0));
    });
  }
}

function led1BtnClick(){
  if (ledStatus[0] == 0)
  {
    ledStatus[0] = 1;
    document.getElementById("led1p").innerHTML = (ledStatus[0] == 1) ? "Led1 is on." : "Led1 is off.";
    return bleServers[0].getCharacteristics()
    .then(characteristics => {
      return characteristics[0].writeValue(Uint8Array.of(1));
    });
  } else{
    ledStatus[0] = 0;
    document.getElementById("led1p").innerHTML = (ledStatus[0] == 1) ? "Led1 is on." : "Led1 is off.";
    return bleServers[0].getCharacteristics()
    .then(characteristics => {
      return characteristics[0].writeValue(Uint8Array.of(0));
    });
  }
}

function connectBtnClick(){
  navigator.bluetooth.requestDevice({
    // acceptAllDevices: true
    filters: [{ 
      name: 'ProjectZero',
      // services: ['heart_rate']
    }],
    optionalServices: [ 0x1110, 0x1120 ] 
  })
  .then(device => {
    // console.log(device);
    document.getElementById("blep").innerHTML = 'Connected to device: ' + device.name;
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
    ledStatus[0] = characteristics[0].readValue().then(value => {value.getUint8()});
    ledStatus[1] = characteristics[1].readValue().then(value => {value.getUint8()});
  })
  .then(() => {
    document.getElementById("led1p").innerHTML = (ledStatus[0] == 1) ? "Led1 is on." : "Led1 is off.";
    document.getElementById("led2p").innerHTML = (ledStatus[1] == 1) ? "Led2 is on." : "Led2 is off.";
    console.log("all ready");
  })
  .catch(error => { console.log(error); });
}
