var W3CWebSocket = require('websocket').w3cwebsocket;

var client = new W3CWebSocket('ws://localhost:8080/', 'echo-protocol');

var key = "asd"
var message = {
  id: '01213',
  counter: 0,
  router_mac: "",
  ssid: "",
  mac : '3a:3b:a7:57:7c:7d',
  map_id : 4,
  sessionID: '',
  ssid: '',
  action:'',
  data:{

  },
};

function authenticate(){
    message.action = "request"
    message.method = "authentication"
    message.token = key

    client.send(JSON.stringify(message));
}

function parseMessage(msg){
  if(msg.action == "update"){
    if(msg.method == "location"){
      checkActions(msg.data);
    }else if(msg.method == "keepalive"){
      console.log("keepalive received")
    }
  }
}

function checkActions(data){

  console.log("check actions")
  console.log(data)
}

client.onerror = function() {
    console.log('Connection Error');
};

client.onopen = function() {
    console.log('WebSocket Client Connected');

    if (client.readyState === client.OPEN) {
      authenticate();
    }
};

client.onclose = function() {
    console.log('echo-protocol Client Closed');
};

client.onmessage = function(e) {
    if (typeof e.data === 'string') {
        console.log("Received: '" + e.data + "'");
        let msg = JSON.parse(e.data)
        parseMessage(msg)
    }
};
