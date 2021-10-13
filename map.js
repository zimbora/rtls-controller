
var request = require('request');
var settings = require("./settings");

module.exports = {

    getRooms : (callback)=>{

      var options = {
        'method': 'GET',
        'url': 'https://my.dev.inloc.cloud/api/map/4/rooms',
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
