'use strict';

let bleIsConnected = false;

let bleServers = null;

let bleCharacteristics = null;

// 打开网页时首先加载此函数，做初始化工作
// 声明按键的回调函数，未连接蓝牙前禁用发送按键
window.onload = function(){

  let connectBtn = document.getElementById('connectBtn');
   
  connectBtn.addEventListener('click', connectBtnClick);

  let sendBtn = document.getElementById('sendBtn');
  sendBtn.addEventListener('click', sendBtnClick);

  let clearLogBoxBtn = document.getElementById('clearLogBoxBtn');
  clearLogBoxBtn.addEventListener('click', clearLogBoxBtnClick);
  
  document.getElementById('sendBtn').disabled = true;
}

// ArrayBuffer 转换成 String
function ab2str(buf) {

  return String.fromCharCode.apply(null, new Uint8Array(buf));

}

// String 转换成 ArrayBuffer
function str2ab(str) {

  var buf = new ArrayBuffer(str.length);
  var bufView = new Uint8Array(buf);

  for (var i=0, strLen=str.length; i<strLen; i++) {

    bufView[i] = str.charCodeAt(i);

  }

  return buf;
}

// 清空 Log 文字框
function clearLogBoxBtnClick(){

  document.getElementById("logBox").textContent = "";

}

// 发送按键事件
// 读取输入框内容，转换成 ArrayBuffer。
// 通过蓝牙发送出去，并在 Log 文本框中显示，同时 Log 文本框滚动到最后一行
function sendBtnClick(){

  var toSendString = document.getElementById('sendBox').value;
  document.getElementById("logBox").textContent += 'Out(' + toSendString.length + '): ' + toSendString + '\n';

  let logBox = document.getElementById('logBox');
  logBox.scrollTop = logBox.scrollHeight;

  return bleCharacteristics.writeValue(str2ab(toSendString));
}

// 蓝牙通知事件
// 将通知中的文字读取，并转换成 String
// 在 Log 文本框中显示，同时 Log 文本框滚动到最后一行
function handleInDataCharacteristicValueChanged(event){

  let receivedString = ab2str(event.target.value.buffer);
  document.getElementById("logBox").textContent += 'In (' + receivedString.length + '): ' + receivedString + '\n';

  let logBox = document.getElementById('logBox');
  logBox.scrollTop = logBox.scrollHeight;
}

// 蓝牙连接断开事件
// 断开连接后，禁用发送按键
// 在 Log 文本框中显示，同时 Log 文本框滚动到最后一行
function onDisconnected(event) {

  document.getElementById('sendBtn').disabled = true;

  let device = event.target;
  document.getElementById("logBox").textContent += 'Device ' + device.name + ' is disconnected.\n';

  let logBox = document.getElementById('logBox');
  logBox.scrollTop = logBox.scrollHeight;
}

// 搜索蓝牙设备，过滤无关设备，最后连接具有相关服务的蓝牙设备
// 连接后将蓝牙服务存储为全局变量，方便后续使用
// 一切准备就绪后，使能发送按键
// 在 Log 文本框中显示，同时 Log 文本框滚动到最后一行
function connectBtnClick(){

  navigator.bluetooth.requestDevice({

    filters: [{ 
      name: 'SimpleSerialSocket',
    }],
    optionalServices: [ 0xC0C0 ]

  })
  .then(device => {

    document.getElementById("logBox").textContent += 'Connected to device: ' + device.name + ".\n";

    let logBox = document.getElementById('logBox');
    logBox.scrollTop = logBox.scrollHeight;

    // Set up event listener for when device gets disconnected.
    device.addEventListener('gattserverdisconnected', onDisconnected);

    // Attempts to connect to remote GATT Server.
    return device.gatt.connect();
  })
  .then(server => {

    return server.getPrimaryServices();

  })
  .then(servers =>{

    bleServers = servers;
    return servers[0].getCharacteristics();
  })
  .then(characteristics => {

    characteristics[1].startNotifications();
    characteristics[1].addEventListener('characteristicvaluechanged', handleInDataCharacteristicValueChanged);
    bleCharacteristics = characteristics[0];
  })
  .then(() => {

    document.getElementById('sendBtn').disabled = false;

    document.getElementById("logBox").textContent += 'All ready.\n';
    
    let logBox = document.getElementById('logBox');
    logBox.scrollTop = logBox.scrollHeight;
  })
  .catch(error => { console.log(error); });
}
