const mqtt = require('mqtt')

var Map = require('./map');
var Settings = require('./system');

var mqtt_client;
var uid = "";

var self = module.exports = {

  hello : "hello",
  
  set_uid : (macAddress)=>{
    uid = macAddress;
  },

  mqtt_connect : (config,ssid,pwd)=>{

    if(config == null || config.host == null || config.user == null){
      console.log("Invalid config")
      return;
    }

    //console.log(config)
    mqtt_client = mqtt.connect({
      host: config.host,
      port:config.port,
      username:config.user,
      password:config.password,
      will:{
        topic:"map/"+Map.id()+"/"+uid+"/controller/status",
        payload:"offline",
        qos:2,
        retain:true
      }
    });

    mqtt_client.on('connect', function () {
      console.log("MQTT connected successfully");
      Settings.cloud.connected = true;
      mqtt_client.subscribe("map/"+Map.id()+"/"+uid+"/#", function (err) {
        if(err)
          console.log(err);
        else
          self.publish("/status","online")
      })

      setInterval( ()=>{
        self.publish("/keepalive",String(Math.round(Date.now()/1000)));
      },30000);
    })

    mqtt_client.on('message', function (topic, payload) {
      topic = String(topic);
      payload = String(payload);
      parseMessage(topic,payload)
    })

    mqtt_client.on('error', function (error) {
      //System.mqtt.connected = false;
      console.log(error)
      Settings.cloud.connected = false;
      //MQTT.parse(topic,message);
    })

    mqtt_client.on('close', function (error) {
      //System.mqtt.connected = false;
      console.log(error)
      Settings.cloud.connected = false;
      //MQTT.parse(topic,message);
    })
  },

  publish : (topic, payload)=>{
    mqtt_client.publish("map/"+Map.id()+"/"+uid+"/controller"+topic,payload)
  },

  publish_collector : (topic, payload)=>{
    mqtt_client.publish("map/"+Map.id()+"/"+uid+"/collector"+topic,payload)
  }
}

function parseMessage(topic, payload){

  try{
    payload = JSON.parse(payload);
  }catch(e){

  }


}
