const wifi = require('node-wifi');
const getmac = require('getmac')
var async = require('async')
const crypto = require('crypto');
var config = require('../config');

fs = require('fs');
var filename = process.env.DATA_PATH || "./settings.txt";

var settings = {
  iface : "",
  ws_domain : config.ws_domain,
  api : config.domain,
  map : {
    id : null,
    name : "NA",
    level : null
  },
  network : [{
    ssid:"",
    password:""
  },{
    ssid:config.wifi.ssid,
    password : config.wifi.password
  }],
  api_token : "get it from my.inloc.cloud/map/:id/edit-settings"
}

var self = module.exports = {
  boot : (cb)=>{
    try {
      if (fs.existsSync(filename)) {
        //file exists
        return cb(false);
      }else{
        module.exports.save(()=>{
          return cb(false);
        });
      }
    } catch(err) {
      console.error(err)
      return cb(true);
    }
  },
  save : (cb)=>{

    if(settings.uid == null || settings.uid == "02:42:ac:11:00:02"){
      //settings.uid = getmac.default();
      settings.uid = crypto.randomUUID();
    }
    settings.version = process.env.VERSION || "dev";
    settings.node_version = process.env.NODE_VERSION || "dev";
    fs.writeFile(filename, JSON.stringify(settings), ["utf8"], (err)=>{
      if(err) console.log(err)
      return cb(err);
    });
  },
  load : (cb)=>{
    fs.readFile(filename,["utf8"],(err,data)=>{
      if(err){
        console.log(err);
      } else{
        try{
          settings = JSON.parse(data);
        }catch(e){
          console.log("error reading file",e)
        }
      }
      return cb(settings)
    });
  },
  reset : (cb)=>{
    fs.unlink(filename, cb);
  },
  setNetwork : (ssid,pass,cb)=>{

    settings.network[0].ssid = ssid ;
    settings.network[0].password = pass;

    self.save(cb)
  },
  setIface : (iface)=>{
    settings.iface = iface;
  },
  getAPIToken : (cb)=>{
    cb(settings.api_token);
  },
  setAPIToken : (token,cb)=>{
    settings.api_token = token;
    cb();
  },
  setMapInfo : (id,name,level,cb)=>{
    settings.map = {
      id : id,
      name : name,
      level : level
    }
    cb();
  },
  getSSID : ()=>{
    return settings.network[0].ssid;
  }
};
