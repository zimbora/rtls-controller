
var request = require('request');

var self = module.exports = {

  actuator : [],
  sensor : [],

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
      return;
    }

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
      return cb({error:true,msg:"url not valid",data:null});

    request(options, function (error, response) {
      if (error){
        console.log(error)
        return cb({error:true,msg:error,data:null})
      }else{
        let res = JSON.parse(response.body)
        try{
          let value = res[sensor[id].state.get.field];
          cb({error:false,msg:"",data:value});
        }catch(e){
          cb({error:true,msg:e,data:null});
        }
      }
    });
  },

  getState : (id,cb)=>{

    let actuator = self.actuator;

    if(actuator[id] == null){
      console.log("actuator id: "+id+" not found")
      return;
    }
    
    if(false && !isValidHttpUrl(actuator[id].state.get.url))
      return cb({error:true,msg:"url not valid",data:null});

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
        console.log(error)
        return cb({error:true,msg:error,data:null})
      }else{
        let res = JSON.parse(response.body)
        try{
          let value = res[actuator[id].state.get.field];
          cb({error:false,msg:"",data:value});
        }catch(e){
          cb({error:true,msg:e,data:null});
        }
      }
    });
  },

  setState : (id,cb)=>{

    let actuator = self.actuator;

    if(actuator[id] == null){
      console.log("actuator id: "+id+" not found")
      return;
    }

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
        return cb({error:true,msg:e,data:null});
      }else{
        let res = JSON.parse(response.body)
        return cb({error:false,msg:"",data:"done"});
      }
    });
  },

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
