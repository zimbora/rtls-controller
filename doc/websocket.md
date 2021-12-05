# WebSocket

## struct

-       var message = {
          counter: 0,
          to: null,
          uid: "",
          session: '',
          topic:'',
          data:{},
        };

## topics

### authenticate

-       message.counter++;
        message.to = null;
        message.topic = "authenticate"
        message.data = {
          token : token,
          map_id : null
        }

### auth response

-       message.data = {
          session : session,
          map_id : map_id
        }

### keepalive

-       message.to = "controller"
        message.topic = "update/keepalive"

### update automation (sensors and actuators)

-       message.to = "controller"
        message.topic = "update/automation"

### sensor get value

-       message.to = "controller"
        message.topic = "sensor/get"
        message.data.id = id

### actuator get state

-       message.to = "controller"
        message.topic = "actuator/get"
        message.data.id = id

### actuator set state

-       message.to = "controller"
        message.topic = "actuator/set"
        message.data.id = id

### network set ssid and password

-       message.to = "controller"
        message.topic = "network/set"
        message.data.ssid = ssid
        message.data.password = password

### report sensor value

-       message.counter++;
        message.to = "broadcast";
        message.topic = "update/sensor/value";
        message.data = {
          id:id,
          value:value
        };

### report actuator state

-       message.counter++;
        message.to = "broadcast";
        message.topic = "update/actuator/state"
        message.data = {
          id:id,
          value:value
        };

### report network status

-       message.counter++;
        message.to = null;
        message.topic = "update/network/state"
        message.data = status;
