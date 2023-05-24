
var message = {
  counter: 0,
  to: null,
  uid: "",
  session: '',
  topic:'',
  data:{},
};

var token = "";

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

  set_token : (ws_token)=>{
    token = ws_token;
  },

  isConnected : ()=>{
    return is_connected;
  },

  has_connection : ()=>{
    is_connected = true;
  },

  lost_connection : ()=>{
    is_connected = false;
  },

  authenticate : (client,version,env)=>{

    message.counter++;
    message.to = null;
    message.topic = "authenticate"
    message.data = {
      token : token,
      type: "controller",
      version: version,
      env: env,
      map_id : null
    }

    //console.log(message)
    sendMessage(client,message);
  },

  authResponse : (data)=>{

    if(data.authenticated){
      console.log("[WS] authenticated")
      message.session = data.session;
      return data.map_id;
    }else console.log("[WS] failed auth");
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
