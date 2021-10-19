var W3CWebSocket = require('websocket').w3cwebsocket;
var settings = require("./config/settings");

var https = require('https');
const http = require('http')
var async = require('async')

var ws = require("./src/ws.js");
var Map = require("./src/map");
var Automation = require("./src/automation");

var client = null;

syncMap();
ws_connect();
setInterval(readSensors,5000);
setInterval(readActuators,5000);

function parseMessage(msg){

  if(!msg.hasOwnProperty("topic"))
    return;

  if(msg.topic.endsWith("authenticate"))
    ws.authResponse(msg.data);
  else if(msg.topic.endsWith("update/keepalive"))
    console.log("keepalive received")
  else if(msg.topic.endsWith("update/location"))
    checkActions(msg.data);
  else if(msg.topic.endsWith("update/automation")){
    console.log("update sensors and actuators");
    syncMap();
  }else if(msg.topic.endsWith("sensor/get")){
    console.log("getting sensor value: "+msg.data.id)
    Automation.getSensorValue(msg.data.id,(response)=>{
      if(!response.error)
        ws.reportSensor(client,msg.data.id,response.data)
      else console.log(response)
    });
  }else if(msg.topic.endsWith("actuator/get")){
    console.log("getting actuator state: "+msg.data.id)
    if(msg.data.id == null)
      return;
    Automation.getState(msg.data.id,(response)=>{
      if(!response.error)
        ws.reportActuatorState(client,msg.data.id,response.data)
      else console.log(response)
    });
  }else if(msg.topic.endsWith("actuator/set")){
    console.log("actuator set: "+msg.data.id)
    Automation.setState(msg.data.id,(response)=>{
      if(response.error){
        ws.reportActuatorState(client,msg.data.id,response.data)
        console.log(response)
      }
    });
  }else{
    console.log(msg.topic)
  }
}

function checkActions(data){

  console.log("check actions")
  console.log(data.sector)
  //if(sector_map.has(data.sector)){
    if(data.sector == "Office"){
      var options = {
        host: '10.168.1.64',
        path: '/relay/0?turn=on'
      };
      http.request(options, callback).end();
    }
    //feedDevices(data);
  //}
}

var callback = function(response) {
  var str = '';

  //another chunk of data has been received, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been received, so we just print it out here
  response.on('end', function () {
    console.log(str);
  });
}

function feedDevices(data){

}

function syncMap(){

  Map.getRooms((res)=>{
    if(res.length > 0){
      rooms = JSON.parse(res[0].rooms);
      let i = 0;
      Automation.actuator = {};
      Automation.sensor = {};
      // updating devices automation
      async.eachOfSeries(rooms,(sector,key,next)=>{
        if(sector.name != null){
          Map.getItemsBySector(sector.name,(items)=>{
            if(items != null && items.length > 0){
              items.forEach((item)=>{
                let data = JSON.parse(item.data);
                console.log(data)
                if(data.type == "actuator"){
                  Automation.actuator[item.id] = {
                    state:data,
                  }
                }else if(data.type == "sensor"){
                  Automation.sensor[item.id] = {
                    state:data,
                  }
                }
              });
            }
            next();
          });
        }else next();
      });
    }
  })
}

function readSensors(){

  async.forEachOf(Automation.sensor,(s,key,next)=>{
    Automation.getSensorValue(key,(response)=>{
      if(!response.error)
        ws.reportSensor(client,key,response.data)
      else console.log(response)
      next();
    });
  });
}

function readActuators(){

  async.forEachOf(Automation.actuator,(a,key,next)=>{
    Automation.getState(key,(response)=>{
      if(!response.error)
        ws.reportActuatorState(client,key,response.data)
      else console.log(response)
      next();
    });
  });
}

function ws_connect() {
<<<<<<< HEAD
  client = new W3CWebSocket(
    settings.ws_domain,
    ['Bearer', 'xxx'],
    undefined,
    undefined,
    { agent: new https.Agent({rejectUnauthorized: false}) }
  );

  client.onerror = function(error) {
      console.log('Connection Error:',error);
=======
  client = new W3CWebSocket(settings.ws_domain, 'echo-protocol');

  client.onerror = function() {
      //console.log('Connection Error');
>>>>>>> 1340ae0c98ee4764665e6809d6ce4d2c5e8bc0b1
      client.close();
  };

  client.onopen = function() {
      console.log('WebSocket Client Connected');

      if (client.readyState === client.OPEN) {
        ws.has_connection();
        ws.authenticate(client);
      }

  };

<<<<<<< HEAD
  client.onclose = function(code,reason) {
      console.log('WebSocket Client Closed');
=======
  client.onclose = function() {
      //console.log('WebSocket Client Closed');
>>>>>>> 1340ae0c98ee4764665e6809d6ce4d2c5e8bc0b1
      ws.lost_connection();
      setTimeout(function() {
        ws_connect();
      }, 5000);
  };

  client.onmessage = function(e) {
      if (typeof e.data === 'string') {
          //console.log("Received: '" + e.data + "'");
          let msg = JSON.parse(e.data)
          parseMessage(msg)
      }
  };
}
