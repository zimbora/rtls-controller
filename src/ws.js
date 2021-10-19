
var token = "qwe"
var map_id = 4;
var uid = "rtl-controller"  // get mac from device

var message = {
  counter: 0,
  to: null,
  uid: uid,
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

  has_connection : ()=>{
    is_connected = true;
  },

  lost_connection : ()=>{
    is_connected = false;
  },

  authenticate : (client)=>{

    message.counter++;
    message.to = null;
    message.topic = "authenticate"
    message.data = {
      token : token,
      map_id : map_id
    }

    sendMessage(client,message);
  },

  authResponse : (data)=>{

    if(data.authenticated){
      console.log("authenticated")
      message.session = data.session;
    }else console.log("failed auth")
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

  /*
  // to arg is the destination session
  answer : (client,to,topic,data){

    let index = topic.lastIndexOf("/")
    topic = topic.substr(0,index);
    message.counter++;
    message.to = to;
    message.topic = "update/sensor/value";
    message.data = {
      id:id,
      value:value
    };
    sendMessage(client,message);
  }
  */
}
