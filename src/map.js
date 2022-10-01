
var request = require('request');
var https = require('https');
var settings = require("../config/settings");
var config = require('../config/env');

var agentOptions = {
  host: config.domain
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

  apiStatus : (callback)=>{

    var options = {
      'method': 'GET',
      'url': 'https://'+config.domain+'/api/api-status',
      'agent':agent,
      'headers': {
        'controllertoken': token
      }
    };
    request(options, function (error, response) {
      //throw new Error(error);
      if (!error){
        try{
          let res = JSON.parse(response.body)
          if(response.statusCode != 200)
            return callback(res.message,null);
          else
            return callback(res.Result.status == "ok");
        }catch(e){
          return callback(null);
        }
      }else return callback(null);
    });

  },

  getInfo : (callback)=>{

    var options = {
      'method': 'GET',
      'url': 'https://'+config.domain+'/api/map/'+map_id+'/info',
      'agent':agent,
      'headers': {
        'controllertoken': token
      }
    };
    request(options, function (error, response) {
      //throw new Error(error);
      if (!error){
        try{
          let res = JSON.parse(response.body)
          if(response.statusCode != 200)
            return callback(res.message,null);
          else
            return callback(res.Error,res.Result);
        }catch(e){
          return callback(e,null);
        }
      }else return callback(error,null);
    });
  },

  getRooms : (callback)=>{

    var options = {
      'method': 'GET',
      'url': 'https://'+config.domain+'/api/map/'+map_id+'/rooms',
      'agent':agent,
      'headers': {
        'controllertoken': token
      }
    };
    request(options, function (error, response) {
      //throw new Error(error);
      if (!error){
        try{
          let res = JSON.parse(response.body)
          if(response.statusCode != 200)
            return callback(res.message,null);
          else
            return callback(res.Error,res.Result);
        }catch(e){
          return callback(e,null);
        }
      }else return callback(error,null);
    });

  },

  getItemsBySector : (sector,callback)=>{

    var options = {
      'method': 'GET',
      'url': 'https://'+config.domain+'/api/map/'+map_id+'/data/item?sector='+sector,
      'agent':agent,
      'headers': {
        'controllertoken': token
      }
    };
    request(options, function (error, response) {
      //throw new Error(error);
      if (!error){
        try{
          let res = JSON.parse(response.body)
          if(response.statusCode != 200)
            return callback(res.message,null);
          else
            return callback(res.Error,res.Result);
        }catch(e){
          return callback(null);
        }
      }else return callback(null);
    });

  },

  getMqttConfig : (callback)=>{

    var options = {
      'method': 'GET',
      'url': 'https://'+config.domain+'/api/map/'+map_id+'/mqtt',
      'agent':agent,
      'headers': {
        'controllertoken': token
      }
    };
    request(options, function (error, response) {
      //throw new Error(error);
      if (!error){
        try{
          let res = JSON.parse(response.body)
          if(response.statusCode != 200)
            return callback(res.message,null);
          else
            return callback(res.Error,res.Result);
        }catch(e){
          return callback(e,null);
        }
      }else return callback(error,null);
    });
  },

  getWSToken : (uid,callback)=>{

    var options = {
      'method': 'GET',
      'url': 'https://'+config.domain+'/api/controllers/ws_token?uid='+uid,
      'agent':agent,
      'headers': {
        'controllertoken': token
      }
    };
    request(options, function (error, response) {
      //throw new Error(error);
      if (!error){
        try{
          let res = null;
          try{
            res = JSON.parse(response.body)
          }catch(e){
            console.log(e);
          }
          if(response.statusCode != 200)
            return callback(res.message,null);
          else
            return callback(res.Error,res.Result);
        }catch(e){
          return callback(e,null);
        }
      }else return callback(error,null);
    });
  }
}
