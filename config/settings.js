const wifi = require('node-wifi');
const getmac = require('getmac')
var async = require('async')

fs = require('fs');
var filename = "settings.txt";

var secret;
if (fs.existsSync("./config/secret.js"))
  secret = require("./secret.js")
else
  secret = require("./secret_edit.js")
  
var settings = {
  iface : "",
  ws_domain : "wss://api.dev.inloc.cloud",
  api : "my.dev.inloc.cloud",
  network : [{
    ssid:"Inloc",
    password : "inloc123456789"
  }]
}

module.exports = {
  boot : (cb)=>{
    const path = './'+filename;
    try {
      if (fs.existsSync(path)) {
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
    settings.uid = getmac.default();
    fs.writeFile(filename, JSON.stringify(settings), ["utf8"], (err)=>{
      if(err) console.log(err)
      return cb();
    });
  },
  load : (cb)=>{
    fs.readFile(filename,["utf8"],(err,data)=>{
      if(err){
        console.log(err);
      } else{
        settings = JSON.parse(data);
        settings.api_token = process.env.api_token || secret.api_token;
        settings.ws_token = process.env.ws_token || secret.ws_token;
        console.log("api token:",settings.api_token)
        console.log("ws token:",settings.ws_token)
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
  }

};
