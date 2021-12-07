#include <WiFi.h>
#include <PubSubClient.h>
#include "time.h"
#include "Adafruit_HTU21DF.h"

const char* ssid = "SSID NAME HERE";
const char* password = "PASSWORD HERE";

const char* mqtt_server = "MQTT BROKER IP/DOMAIN";

// time variables
const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = -25200;
const int   daylightOffset_sec = 3600;
char time_buf[50];

WiFiClient espClient;
PubSubClient client(espClient);
long lastMsg = 0;
char msg[200];
int value = 0;

const int ledPin = 4;

// HTU21DF sensor
Adafruit_HTU21DF htu = Adafruit_HTU21DF();

/* Helper functions*/
void setup_wifi() {
  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* message, unsigned int length) {
  Serial.print("Message arrived on topic: ");
  Serial.print(topic);
  Serial.print(". Message: ");
  String messageTemp;
  
  for (int i = 0; i < length; i++) {
    Serial.print((char)message[i]);
    messageTemp += (char)message[i];
  }
  Serial.println();

  // Feel free to add more if statements to control more GPIOs with MQTT

  // If a message is received on the topic esp32/output, you check if the message is either "on" or "off". 
  // Changes the output state according to the message
  if (String(topic) == "esp32/output") {
    Serial.print("Changing output to ");
    if(messageTemp == "on"){
      Serial.println("on");
      digitalWrite(ledPin, HIGH);
    }
    else if(messageTemp == "off"){
      Serial.println("off");
      digitalWrite(ledPin, LOW);
    }
  }
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("ESP8266Client")) {
      Serial.println("connected");
      // Subscribe
      client.subscribe("esp32/output");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void getLocalTime(){
  struct tm timeinfo;
  if(!getLocalTime(&timeinfo)){
    Serial.println("Failed to obtain time");
    return;
  }
  // Serial.println(&timeinfo, "%A, %B %d %Y %H:%M:%S");
  strftime(time_buf, sizeof(time_buf), "%A, %B %d %Y %H:%M:%S", &timeinfo);
}

// The main program loops start here **********************
void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback); 

  // Init and get the time
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  getLocalTime();

  if (!htu.begin()) {
    Serial.println("Couldn't find sensor!");
    delay(1000);
  }

}

void loop() {
  // 1 min delay
  delay(10000); 

  if (!client.connected()) {
    reconnect();
  }
  client.loop();


  // get temp + humidity
  float temp = htu.readTemperature();
  float rel_hum = htu.readHumidity();

  // get current time
  getLocalTime();
  
  // Convert the value to a char array
  sprintf(msg, "{\"temperature\":%0.2f,\"humidity\":%0.2f,\"message\":\"From ESP32\",\"time\":\"%s\"}", temp, rel_hum, time_buf);
  //sprintf(msg, "{\"temperature\":50,\"humidity\":100,\"message\":\"From ESP32\",\"time\":\"%s\"}",time_buf);
  Serial.print("Sending: ");
  Serial.println(msg);
  client.publish("device", msg);
}
