const express = require("express");
var ejs = require('ejs');
var mongodbHandler = require('./mongodb_handler');
var mqttHandler = require('./mqtt_handler');


// create mongodb handler instance
// connect to database
var mongoClient = new mongodbHandler();
mongoClient.connect();
mongoClient.insert();

// create mqtt handler instance
// connect to MQTT broker
var mqttClient = new mqttHandler();
mqttClient.connect();

// create express app
const app = express();

// set view engine
app.set("view engine", "ejs");

// *** describe what these lines are doing ***
// app.use(express.static(__dirname));

// parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }))
// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// When a POST request is made to '/coordinates' via MQTT 
// save the latitude and longitude to variables, log to console,
// then store values in database.
app.post("/coordinates", function(req, res) {
    res.status(200).send("Message sucessfully sent to mqtt");
    // mqttClient.sendMessage(req.body.message);
    
    device_id = req.body.device_id;
    lat = req.body.lat;
    lon = req.body.lon;

    console.log("Received contents: ")
    console.log("Device ID: " + device_id);
    console.log("Latitude: " + lat);
    console.log("Longitude: " + lon);

    // TODO: STORE LAT AND LON TO DATABASE
    
})

app.get("/", function(req, res) {
    // res.sendFile(__dirname + "/index.html");

    var data =  mqttClient.getDeviceInfo;
    console.log(data);

    console.log("lat: " + data.lat);
    console.log("lon: " + data.lon);
    console.log("device id: " + data.device_id);

    // update index.ejs template with new values
    res.render("index", {
        html_device_id: data.device_id, 
        html_latitude: data.lat, 
        html_longitude: data.lon
    });
});

var server = app.listen(80, function() {
    console.log("Server listening on " + server.address().port);
})