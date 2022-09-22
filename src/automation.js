
var request = require('request');
var URL = require('url').URL;
var async = require('async');

var self = module.exports = {

  actuator : [],
  sensor : [],

  // not used
  makeRequest : (method,url,header,cb)=>{

    var options = {
      'method': method,
      'url': url,
      'headers': {
        header
      }
    };
    request(options, function (error, response) {
      if (error){
        console.log(error)
        return cb(null)
      }else{
        let res = JSON.parse(response.body)
        cb(res);
      }
    });
  },

  getSensorValue : (id,cb)=>{

    let sensor = self.sensor;

    if(sensor[id] == null){
      console.log("sensor id: "+id+" not found")
      return cb({error:true,msg:"id not found",data:null})
    }

    if(sensor[id].state.hasOwnProperty("protocol") && sensor[id].state.protocol == "MQTT")
      return cb({error:true,msg:"mqtt sensor",data:null})

    var options = {
      'method': sensor[id].state.get.method,
      'url': sensor[id].state.get.url,
      /*
      'headers': {
        header
      },
      */
    };

    if(sensor[id].state.get.method != 'GET'){
      options.body = sensor[id].state.get.field
    }

    if(!isValidHttpUrl(sensor[id].state.get.url))
      return cb({error:true,msg:"url not valid: "+sensor[id].state.get.url+" for id:"+id,data:null});

    request(options, function (error, response) {
      if (error){
        console.log(error)
        return cb({error:true,msg:error,data:null})
      }else{
        let res = JSON.parse(response.body)
        try{
          let value = res[sensor[id].state.get.field];
          if(value === true)
            value = "on"
          else if(value === false)
            value = "off"
          return cb({error:false,msg:"",data:value});
        }catch(e){
          return cb({error:true,msg:e,data:null});
        }
      }
    });
  },

  getState : (id,cb)=>{

    let actuator = self.actuator;

    if(actuator[id] == null){
      console.log("actuator id: "+id+" not found")
      return cb({error:true,msg:"id not found",data:null})
    }

    if(actuator[id].state.hasOwnProperty("protocol") && actuator[id].state.protocol == "MQTT")
      return cb({error:true,msg:"mqtt actuator",data:null})

    if(!isValidHttpUrl(actuator[id].state.get.url))
      return cb({error:true,msg:"url not valid: "+actuator[id].state.get.url+" for id: "+id,data:null});

    var options = {
      'method': actuator[id].state.get.method,
      'url': actuator[id].state.get.url,
      /*
      'headers': {
        header
      },
      */
    };

    if(actuator[id].state.method != 'GET'){
      options.body = actuator[id].state.get.field
    }

    request(options, function (error, response) {
      if (error){
        return cb({error:true,msg:error,data:null})
      }else{
        let res = null;
        try{
          res = JSON.parse(response.body)
        }catch(e){
          return cb({error:true,msg:e,data:null});
        }

        try{
          let value = res[actuator[id].state.get.field];
          //console.log("value:",value)
          if(value === true)
            value = "on"
          else if(value === false)
            value = "off"
          return cb({error:false,msg:"",data:value});
        }catch(e){
          return cb({error:true,msg:e,data:null});
        }
      }
    });
  },

  setState : (id,cb)=>{

    let actuator = self.actuator;

    if(actuator[id] == null){
      console.log("actuator id: "+id+" not found")
      return cb({error:true,msg:"actuator id not found",data:null});
    }

    console.log(actuator[id])
    if(actuator[id].hasOwnProperty("protocol") && actuator[id].protocol == "MQTT"){
      mqtt_client.publish(actuator[id].mqtt_change.topic,actuator[id].mqtt_change.body)
    }else{
      var options = {
        'method': actuator[id].state.change.method,
        'url': actuator[id].state.change.url,
        /*
        'headers': {
          header
        },
        */
      };

      if(actuator[id].state.change.method != 'GET'){
        options.body = actuator[id].state.change.field
      }

      request(options, function (error, response) {
        if (error){
          console.log(error)
          return cb({error:true,msg:error,data:null});
        }else{
          try{
            let res = JSON.parse(response.body)
            return cb({error:false,msg:"",data:"done"});
          }catch(e){
            return cb({error:true,msg:e,data:null});
          }
        }
      });
    }

  },

  parseMqttMessages : (topic,payload)=>{
      let sensor = self.sensor;
      let actuator = self.actuator;

      async.eachOf(sensor,(s,key,array)=>{
        if(s.protocol == "MQTT"){
          if(s.mqtt_get.topic == topic){
            try{
              payload = JSON.parse(payload)
              if(payload.hasOwnProperty(a.mqtt_get.field))
                self.sensor[key].value = payload[a.mqtt_get.field];
              else
                self.sensor[key].value = payload
            }catch(e){
              console.log(topic,payload,"notjson")
            }
            console.log(key,self.sensor[key].value)
          }
        }
      })

      async.eachOf(actuator,(a,key,array)=>{
        a = a.state;
        if(a.protocol == "MQTT"){
          if(a.mqtt_get.topic == topic){
            try{
              payload = JSON.parse(payload)
              if(payload.hasOwnProperty(a.mqtt_get.field))
                self.actuator[key].value = payload[a.mqtt_get.field];
              else
                self.actuator[key].value = payload
            }catch(e){
              console.log(topic,payload,"notjson")
            }
            console.log(key,self.actuator[key].value)
          }
        }
      })
  }
}

function isValidHttpUrl(path) {
  let url;

  try {
    url = new URL({ toString: () => path });
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}
