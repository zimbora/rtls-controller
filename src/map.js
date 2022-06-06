
var request = require('request');
var https = require('https');
var settings = require("../config/settings");

var agentOptions = {
  host: 'my.dev.inloc.cloud'
, port: '443'
, path: '/'
, rejectUnauthorized: false
};

agent = new https.Agent(agentOptions);
var map_id = null;
var token = null;

module.exports = {

  set_token : (hash)=>{
      token = hash;
  },

  set_map_id : (id)=>{
      map_id = id;
  },

  get_map_id : ()=>{
      return map_id;
  },

  getRooms : (callback)=>{

    var options = {
      'method': 'GET',
      'url': 'https://my.dev.inloc.cloud/api/map/'+map_id+'/rooms',
      'agent':agent,
      'headers': {
        'token': token
      }
    };
    request(options, function (error, response) {
      //throw new Error(error);
      if (!error){
        try{
          let res = JSON.parse(response.body)
          return callback(res.Result);
        }catch(e){
          return callback(null);
        }
      }else return callback(null);
    });

  },

  getItemsBySector : (sector,callback)=>{

    var options = {
      'method': 'GET',
      'url': 'https://my.dev.inloc.cloud/api/map/'+map_id+'/data/item?sector='+sector,
      'agent':agent,
      'headers': {
        'token': token
      }
    };
    request(options, function (error, response) {
      //throw new Error(error);
      if (!error){
        try{
          let res = JSON.parse(response.body)
          return callback(res.Result);
        }catch(e){
          return callback(null);
        }
      }else return callback(null);
    });

  },

  getMqttConfig : (callback)=>{

    var options = {
      'method': 'GET',
      'url': 'https://my.dev.inloc.cloud/api/map/'+map_id+'/mqtt',
      'agent':agent,
      'headers': {
        'token': token
      }
    };
    request(options, function (error, response) {
      //throw new Error(error);
      if (!error){
        try{
          let res = JSON.parse(response.body)
          return callback(null,res.Result);
        }catch(e){
          return callback(e,null);
        }
      }else return callback(error,null);
    });
  }
}
