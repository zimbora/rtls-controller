
var map_id = null;

module.exports = {

  set_id : (id)=>{
      map_id = id;
  },

  id : ()=>{
      return map_id;
  },

}
