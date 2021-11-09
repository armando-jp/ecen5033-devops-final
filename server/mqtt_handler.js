const mqtt = require('mqtt');

class MqttHandler {
  constructor() {
    this.mqttClient = null;
    this.host = 'mqtt://localhost';
    this.username = 'YOUR_USER'; // mqtt credentials if these are needed to connect
    this.password = 'YOUR_PASSWORD';
    this.lat = -1;
    this.lon = -1;
    this.device_id = -1;
  }
  
  connect() {
    // Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
    // this.mqttClient = mqtt.connect(this.host, { username: this.username, password: this.password });
    this.mqttClient = mqtt.connect(this.host);
    
    // Mqtt error calback
    this.mqttClient.on('error', (err) => {
      console.log(err);
      this.mqttClient.end();
    });

    // Connection callback
    this.mqttClient.on('connect', () => {
      console.log(`MQTT client connected successfully`);
    });

    // mqtt subscriptions
    this.mqttClient.subscribe('esp32_location', {qos: 0});

    // When a message arrives, console.log it
    this.mqttClient.on('message', function (topic, message) {
      let { lat, lon, device_id } = this;
      const json = JSON.parse(message);

      console.log("lat: " + json.lat);
      console.log("lon: " + json.lon);
      console.log("device id: " + json.device_id);
      
      lat = json.lat;
      lon = json.lon;
      device_id = json.device_id;
    });

    this.mqttClient.on('close', () => {
      console.log(`mqtt client disconnected`);
    });
  }

  // Sends a mqtt message to topic: mytopic
  sendMessage(message) {
    this.mqttClient.publish('mytopic', message);
  }

  // returns the most recent mqtt message for topic esp32_location
  getDeviceInfo() {
    let { lat, lon, device_id } = this;
    return lat, lon, device_id;
  }
};

module.exports = MqttHandler;