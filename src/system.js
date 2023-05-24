
var self = module.exports = {

  wifi : {
    ip                : "",
    macAddress        :  "",
    router_macAddress :  "",
    ssid              :  "",
    password          :  "",
    available         : [],
  },
  api : {
    connected : false
  },
  ws : {
    connected : false
  },
  mqtt : {
    host      : "",
    port      : "",
    connected : false
  },
  cloud : {
    connected : false
  }
}
