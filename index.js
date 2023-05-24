
const web = require('./src/web')
var core = require("./src/core.js");
var config = require('./config/index.js')

web.listen(config.web_port  , () => {

  console.log('Web Server started and listening on port: ' +config.web_port);
});


//console.log("version:",process.env.NODE_VERSION)
//console.log("hostname:",process.env.HOSTNAME)
core.network_init();
core.init(config);

setInterval(core.readSensors,30000);
setInterval(core.readActuators,60000);
setInterval(()=>{core.checkConnections(()=>{})},30000);
