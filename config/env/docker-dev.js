module.exports = {
  env: 'development',
  debug:{
    level: "debug"
  },
  domain: "my.dev.inloc.cloud",
  colector: "http://colector.dev.inloc.cloud",
  web_port: 20080,
  public_path:  '/opt/app/server/public',
  jwtSecret: 'my-local-app-secret',
  jwtDuration: '2 hours'
};
