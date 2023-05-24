
module.exports = {
  test : process.env.test || true,
  map_id : process.env.map_id || null,
  debug:{
    level: process.env.debug || "debug"
  },
  wifi:{
    ssid: process.env.ssid || "Inloc",
    password: process.env.pwd || "inloc123456789"
  },
  mqtt : {
    host     : process.env.mqtt_host || "my.dev.inloc.cloud",
    port     : process.env.mqtt_port || 1883,
    user     : process.env.mqtt_user || "admin",
    password : process.env.mqtt_pwd || "inloc",
    will     : {
      topic : "",
      payload : "offline",
      qos : 2,
      retain : true
    }
  },
  domain: process.env.domain || "my.dev.inloc.cloud",
  ws_domain: process.env.ws_domain || "wss://api.dev.inloc.cloud",
  web_port: process.env.port || 20080,
  public_path:  process.env.public_path || './server/public',
  jwtSecret: process.env.jwtSecret || 'my-local-app-secret',
  jwtDuration: process.env.jwtDuration || '2 hours'
};
