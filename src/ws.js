
var message = {
  counter: 0,
  to: null,
  uid: "",
  session: '',
  topic:'',
  data:{},
};

var is_connected = false;

function sendMessage (client,message){

  if(!is_connected){
    return;
  }

  try{
    client.send(JSON.stringify(message));
  }catch (e) {
    console.log("error sending message to WS client");
    is_connected = false;
  }
}

var self = module.exports = {

  set_uid : (macAddress)=>{
    message.uid = macAddress;
  },

  has_connection : ()=>{
    is_connected = true;
  },

  lost_connection : ()=>{
    is_connected = false;
  },

  authenticate : (client,token)=>{

    message.counter++;
    message.to = null;
    message.topic = "authenticate"
    message.data = {
      token : token,
      map_id : null
    }

    sendMessage(client,message);
  },

  authResponse : (data)=>{

    if(data.authenticated){
      console.log("authenticated")
      message.session = data.session;
      return data.map_id;
    }else console.log("failed auth");
    return false;
  },

  reportSensor : (client,id,value)=>{

    message.counter++;
    message.to = "broadcast";
    message.topic = "update/sensor/value";
    message.data = {
      id:id,
      value:value
    };
    sendMessage(client,message);
  },

  reportActuatorState : (client,id,value)=>{

    message.counter++;
    message.to = "broadcast";
    message.topic = "update/actuator/state"
    message.data = {
      id:id,
      value:value
    };
    sendMessage(client,message);
  },

  reportNetworkStatus : (client,status)=>{
    message.counter++;
    message.to = null;
    message.topic = "update/network/state"
    message.data = status;
    sendMessage(client,message);
  },

}
