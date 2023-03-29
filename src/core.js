const wifi = require('node-wifi');
const network = require("node-network-manager");

var W3CWebSocket = require('websocket').w3cwebsocket;

var Settings = require("../config/settings");
var System = require('../src/system')

var https = require('https');
const http = require('http')
var async = require('async')
const mqtt = require('mqtt')


var ws = require("./ws.js");
var Map = require("./map");
var Automation = require("./automation");

var client = null;
var mqtt_client  = null;
var settings = null;
var tries = 0;
var iface = null;
var router_macAddress = "00:00:00:00:00:00";

var self = module.exports = {

  network_init : ()=>{
    network
      .getConnectionProfilesList(false)
      .then((data) => {
        //console.log(data)
        const ethernet = data.find((item) => item.TYPE === "ethernet");
        const wifi = data.find((item) => item.TYPE === "wifi");
        network
          .getDeviceInfoIPDetail(ethernet.DEVICE)
          .then((data) => console.log("ethernet interface found"))
          .catch((error) => console.log("ethernet",error));
        network
          .getDeviceInfoIPDetail(wifi.DEVICE)
          .then((data) => console.log("wifi interface found"))
          .catch((error) => console.log("wifi",error));
      })
      .catch((error) => console.log(error));
  },

  init : ()=>{
    Settings.boot((err)=>{
      Settings.load((data)=>{
        settings = data;
        console.log("settings:",settings)
        wifi.init({
          iface:settings.iface // network interface, choose a random wifi interface if set to null
        });
        self.checkConnections();
        Map.set_token(settings.api_token);
        System.wifi.macAddress = settings.uid;
        Map.getWSToken(settings.uid,(error,token)=>{
          if(!error){
            System.api.connected = true;
            ws.set_uid(settings.uid);
            ws.set_token(token);
            self.ws_connect();
          }else console.log("error getting ws token:",error)
        })
        //System.wifi.macAddress = settings.uid;
      });
    });
  },

  checkConnections : ()=>{
    // List the current wifi connections
    wifi.getCurrentConnections((error, connections) => {
      if (error) {
        console.log(error);
      } else {
        if(connections.length == 0){
          console.log("wifi is disconnected..");
          Settings.save(()=>{});
          // Connect to a network
          if(tries%2 != 0){
            wifi.connect({ ssid: settings.network[1].ssid, password: settings.network[1].password }, () => {
              console.log('Connecting to',settings.network[1].ssid);
              wifi.getCurrentConnections((error, connections) => {
                if(!error && connections.length > 0){
                  router_macAddress = connections[0].mac;
                }
              });
            });
          }else{
            wifi.connect({ ssid: settings.network[0].ssid, password: settings.network[0].password }, () => {
              console.log('Connecting to',settings.network[0].ssid);
              wifi.getCurrentConnections((error, connections) => {
                if(!error && connections.length > 0){
                  router_macAddress = connections[0].mac;
                }
              });
            });
          }
          tries++;
        }else if(connections.length > 0){
          const {
            networkInterfaces
          } = require('os');

          const nets = networkInterfaces();
          const results = Object.create(null);

          for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
              if (net.family === 'IPv4' && !net.internal) {
                System.wifi.ip = net.address;
              }
            }
          }
          console.log("wifi is connected to:",connections[0].ssid,connections[0].mac,connections[0].channel,connections[0].signal_level);
          System.wifi.ssid = connections[0].ssid;
          System.wifi.router_macAddress = connections[0].mac;
          router_macAddress = connections[0].mac;
          Settings.setIface(connections[0].iface);
          Settings.save(()=>{});
          ws.reportNetworkStatus(client,connections);
          if(connections.length > 1)
            console.log("wifi has multiple connections..");
        }
      }
    });
  },

  syncMap : (cb)=>{

    Map.getRooms((error,res)=>{
      if(error){
        console.log("error getting rooms:",error)
        return cb;
      }else if(res != null && res.length > 0){
        try{
          //rooms = JSON.parse(res[0].rooms);
          rooms = res[0].rooms;
        }catch(e){
          console.log("!! error:",e);
        }
        Automation.actuator = {};
        Automation.sensor = {};
        // updating devices automation
        async.eachOfSeries(rooms,(sector,key,next)=>{
          if(sector.name != null){
            Map.getItemsBySector(sector.name,(error,items)=>{
              if(items != null && items.length > 0){
                items.forEach((item)=>{

                  let data = {}
                  try{
                    //data = JSON.parse(item.data);
                    data = item.data;
                  }catch(e){
                    console.log("error:",e)
                    return cb;
                  }

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
        },()=>{cb()});
      }else{
        console.log("no rooms found !!")
        return cb;
      }
    })
  },

  readSensors : ()=>{

    async.forEachOf(Automation.sensor,(s,key,next)=>{
      Automation.getSensorValue(key,(response)=>{
        Automation.sensor[key].value = response.data;
        if(!response.error)
          ws.reportSensor(client,key,response.data)
        else console.log(response)
        next();
      });
    });
  },

  readActuators : ()=>{

    async.forEachOf(Automation.actuator,(a,key,next)=>{
      Automation.getState(key,(response)=>{
        try{
          Automation.actuator[key].value = response.data;
          if(!response.error)
            ws.reportActuatorState(client,key,response.data)
          else console.log(response)
        }catch(error){
          console.log(error)
        }
        next();
      });
    });
  },

  refresh : (cb)=>{
    Settings.load((data)=>{
      settings = data;
      console.log(settings)
      cb();
    });
  },

  ws_connect : ()=>{
    console.log(settings.ws_domain);
    client = new W3CWebSocket(
      settings.ws_domain,
      ['Bearer', 'xxx'],
      undefined,
      undefined,
      { agent: new https.Agent({rejectUnauthorized: false}) }
    );

    client.onerror = function(error) {
        console.log('Connection Error:',error);
        System.ws.connected = false;
        client.close();
    };

    client.onopen = function() {
        console.log('WebSocket Client Connected');
        if (client.readyState === client.OPEN) {
          ws.has_connection();
          ws.authenticate(client,settings.version,process.env);
        }

    };

    client.onclose = function() {
        //console.log('WebSocket Client Closed');
        ws.lost_connection();
        System.ws.connected = false;
        setTimeout(function() {
          self.ws_connect();
        }, 5000);
    };

    client.onmessage = function(e) {
        if (typeof e.data === 'string') {
            //console.log("Received: '" + e.data + "'");
            let msg = JSON.parse(e.data)
            parseMessage(msg)
        }
    };
  },

  mqtt_connect : (config)=>{

    if(config == null || config.host == null || config.user == null)
      return;

    //console.log(config)
    mqtt_client = mqtt.connect({
      host: config.host,
      port:config.port,
      username:config.user,
      password:config.password,
      will:{
        topic:"map/"+Map.get_map_id()+"/rtls-controller/"+router_macAddress+"/status",
        payload:"offline",
        qos:0,
        retain:true
      }

    });

    mqtt_client.on('connect', function () {
      System.mqtt.connected = true;
      console.log("MQTT connected successfully");

      mqtt_client.subscribe('#', function (err) {
        if(err) console.log(err);
        else{
          mqtt_client.publish("map/"+Map.get_map_id()+"/rtls-controller/"+router_macAddress+"/status","online")
          //mqtt_client.publish("map/"+Map.get_map_id()+"/rtls-controller/"+router_macAddress+"/status",JSON.stringify({version:process.env.NODE_VERSION}))
        }
      })

    })

    mqtt_client.on('message', function (topic, message) {
      topic = String(topic);
      message = String(message);
      if(!topic.startsWith("map/"+Map.get_map_id()+"pos")){
        Automation.parseMqttMessages(topic,message);
      }

    })

    mqtt_client.on('error', function (error) {
      System.mqtt.connected = false;
      console.log(error)
      //MQTT.parse(topic,message);
    })

    mqtt_client.on('close', function (error) {
      System.mqtt.connected = false;
      console.log(error)
      //MQTT.parse(topic,message);
    })
  },

  checkActions : (data)=>{

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
    //}
  },
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

parseMessage = (msg)=>{

  if(msg.hasOwnProperty("error")){
    console.log(msg.error)
    client.close();
    return;
  }

  if(!msg.hasOwnProperty("topic"))
    return;

  if(msg.topic.endsWith("authenticate")){

    System.ws.connected = true;
    Map.set_map_id(ws.authResponse(msg.data));

    Map.getWiFiCredentials((err,res)=>{
      if(!err && res != null){
        if(res.length > 0 && res[0].ssid != "" && res[0].password != ""){
          console.log("wifi credentials:",res[0]);
          Settings.setNetwork(res[0].ssid,res[0].password,(err)=>{
            if(System.wifi.ssid != Settings.getSSID()){
              wifi.init({
                iface:settings.iface // network interface, choose a random wifi interface if set to null
              });
              wifi.disconnect(error => {
                if (error) {
                  console.log(error);
                } else {
                  console.log('Disconnected');
                  wifi.connect({ ssid: res[0].ssid, password: res[0].password }, () => {
                    console.log('Connecting to',res[0].ssid,res[0].password);
                  });
                }
              });
            }
          });
        }
      }else if(res == null)
        console.log("no wifi credentials retrieved");
      else console.log("Error getting wifi credentials..",err);
    })

    Map.getInfo((error,res)=>{
      if(!error && res != null && res.length > 0){
        Settings.setMapInfo(Map.get_map_id(),res[0].name,res[0].level,()=>{
          Settings.save(()=>{});
        })
      }else if(res != null && res.length == 0) console.log("Map info not found");
      else console.log("error:",error);
    })
    console.log("map id: "+Map.get_map_id());

    self.syncMap(()=>{
      console.log("map synced")
      Map.getMqttConfig((err,res)=>{
        console.log("mqtt",res)
        self.readSensors();
        if(err) console.log(err)
        else{
          try{
            //let config = JSON.parse(res);
            let config = res;
            self.mqtt_connect(config);
          }catch(e){
            console.log("mqtt JSON parse error",e);
          }
        }
      })
    });


  }else if(msg.topic.endsWith("update/keepalive"))
    console.log("keepalive received")
  else if(msg.topic.endsWith("update/location"))
    checkActions(msg.data);
  else if(msg.topic.endsWith("automation/refresh")){
    console.log("update sensors and actuators");
    self.syncMap(()=>{});
  }else if(msg.topic.endsWith("automation/report")){
    console.log("reporting automation state")
    async.forEachOf(Automation.sensor,(s,key,next)=>{
      ws.reportSensor(client,key,s.value)
      next();
    });
    async.forEachOf(Automation.actuator,(a,key,next)=>{
      ws.reportActuatorState(client,key,a.value)
      next();
    });
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
    console.log("level: "+msg.level)
    if(msg.level > 1){
      Automation.setState(msg.data.id,(response)=>{
        if(response.error){
          ws.reportActuatorState(client,msg.data.id,response.data)
          console.log(response)
        }
      });
    }
  }else if(msg.topic.endsWith("network/set")){
    console.log("network set:",msg.data)
    Settings.setNetwork(msg.data.ssid,msg.data.password,(err)=>{
      if(System.wifi.ssid != Settings.getSSID()){
        wifi.init({
          iface:settings.iface // network interface, choose a random wifi interface if set to null
        });
        wifi.disconnect(error => {
          if (error) {
            console.log(error);
          } else {
            console.log('Disconnected');
            wifi.connect({ ssid: msg.data.ssid, password: msg.data.password }, () => {
              console.log('Connecting to',msg.data.ssid,msg.data.password);
            });
          }
        });
      }
    });

  }else{
    //if( !(msg.topic.endsWith("/state") || msg.topic.endsWith("/value")) )
    console.log(msg.topic, msg.data)
  }
}


/*
network
  .getConnectionProfilesList()
  .then((data) => console.log(data))
  .catch((error) => console.log(error));

network // interfaces list
  .deviceStatus()
  .then((result) => console.log(result))
  .catch((error) => console.log(error));


network
  .getWifiStatus()
  .then((data) => console.log("wifi status:",data))
  .catch((error) => console.log(error));

network
  .wifiCredentials("wlo1")
  .then((data) => {
    console.log("ssid:",data.SSID)
    console.log("password:",data.Password)
  })
  .catch((error) => console.log(error));
*/
