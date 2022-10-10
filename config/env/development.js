module.exports = {
  env: 'development',
  debug:{
    level: "debug"
  },
  wifi:{
    ssid:"Inloc",
    password:"inloc123456789"
  },
  domain: "my.dev.inloc.cloud",
  ws_domain: "api.dev.inloc.cloud",
  web_port: 20080,
  public_path:  '/home/lucas/projects/inloc/local/linux/rtls-controller/app/server/public',
  jwtSecret: 'my-local-app-secret',
  jwtDuration: '2 hours'
};
