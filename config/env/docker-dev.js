module.exports = {
  env: 'development',
  debug:{
    level: "debug"
  },
  domain: process.env.host || 'my.dev.inloc.cloud',
  web_port: process.env.port || 20080,
  public_path:  '/opt/app/server/public',
  jwtSecret: process.env.jwtSecret || 'my-local-app-secret',
  jwtDuration: '2 hours'
};
