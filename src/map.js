
var request = require('request');
var https = require('https');
var settings = require("../config/settings");

var agentOptions = {
  host: 'my.dev.inloc.cloud'
, port: '443'
, path: '/'
, rejectUnauthorized: false
};

agent = new https.Agent(agentOptions);

module.exports = {

    getRooms : (callback)=>{

      var options = {
        'method': 'GET',
        'url': 'https://my.dev.inloc.cloud/api/map/4/rooms',
        'agent':agent,
        'headers': {
          'token': 'zxc'
        }
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        let res = JSON.parse(response.body)
        callback(res.Result);
      });

    },

    getItemsBySector : (sector,callback)=>{

      var options = {
        'method': 'GET',
        'url': 'https://my.dev.inloc.cloud/api/map/4/data/item?sector='+sector,
        'agent':agent,
        'headers': {
          'token': 'zxc'
        }
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        let res = JSON.parse(response.body)
        callback(res.Result);
      });

    }
}
