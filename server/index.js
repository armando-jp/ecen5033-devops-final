const express = require("express");
const { Server } = require("http");
const https = require("https");

var mqttHandler = require('./mqtt_handler');

const app = express();
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

var mqttClient = new mqttHandler();
mqttClient.connect();

// Routes
app.post("/send-mqtt", function(req, res) {
    mqttClient.sendMessage(req.body.message);
    res.status(200).send("Message sent to mqtt");
})

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

// app.get("/aboutme.html", function(req, res) {
//     res.sendFile(__dirname + "/aboutme.html");
// });

// app.get("/style.css", function(req, res) {
//     res.sendFile(__dirname + "/style.css");
// })

// app.get("/maps.js", function(req, res) {
//     res.sendFile(__dirname + "/maps.js");
// })


var server = app.listen(80, function() {
    console.log("Server listening on " + Server.address().port);
})