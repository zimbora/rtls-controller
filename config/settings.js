const wifi = require('node-wifi');
const getmac = require('getmac')
var async = require('async')

fs = require('fs');
var filename = process.env.DATA_PATH || "./settings.txt";

var settings = {
  iface : "",
  ws_domain : "wss://api.dev.inloc.cloud",
  api : "my.dev.inloc.cloud",
  map : {
    id : null,
    name : "NA",
    level : null
  },
  network : [{
    ssid:"Inloc",
    password : "inloc123456789"
  }],
  api_token : "get it from my.inloc.cloud/map/:id/edit-settings"
}

module.exports = {
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
    if(settings.uid == null)
      settings.uid = getmac.default();
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
  setNetwork : (ssid,pass,cb)=>{
    let network = {
      ssid:ssid,
      password:pass
    };
    if(settings.network.length == 1){
      settings.network.push(network);
      return cb(true);
    }else{
      if(settings.network[1].ssid == ssid && settings.network[1].pasword == pass)
        return cb(false);
      else return cb(true);
    }
  },
  setIface : (iface)=>{
    settings.iface = iface;
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
  }

};
