const express = require("express");
const mongoose = require('mongoose');
const mqtt = require('mqtt');
const ejs = require('ejs');
const path = require('path');
const keys = require('./config/keys');
require('./models/device');
const Device = mongoose.model('device');
let data = null;


// Connect to mongoose database
mongoose.connect(keys.mongoURI)
    .then((res) => {
        console.log("Connected to mongodb")
        //Get the default connection
        const db = mongoose.connection;
        //Bind connection to error event (to get notification of connection errors)
        db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    })
    .catch((err) => {console.log("Failed to connect\n", err)});
// query mongodb, if valid entry is found: return that data in template
// else: return placeholder data
setInterval(function() {
    Device.find().sort({ _id: -1 }).limit(10).then((query) => {
        console.log(query);
        data = query;
    });
}, 5000) ;

// create mqtt client
const mqtt_client = mqtt.connect(keys.mqttURI);
// mqtt client will subscribe to topic `device` upon sucessfully connecting
// to mqtt broker. Here we are adding an event handler for `connect`
// by using the .on() method.
mqtt_client.on('connect', function() {
    mqtt_client.subscribe('device', function(err) {
        if (err) {
            console.log('Failed to susbscribe to `device` topic.' + err);
        } else {
            console.log('Connected to mqtt broker');
        }
    })
})
// mqtt client will update the mongo database upon receiving a message from the 
// mqtt broker. 
mqtt_client.on('message', function (topic, message) {
    let mqtt_msg = message.toString(); 
    const mqtt_json =JSON.parse(mqtt_msg);
    console.log(mqtt_msg);
    console.log(mqtt_json);
    console.log(mqtt_json.time);

    // Create new entry instance for database
    let new_entry = new Device({
        deviceTemp: mqtt_json.temperature,
        deviceHumidity: mqtt_json.humidity,
        deviceMessage: mqtt_json.message,
        deviceTime: mqtt_json.time,
    });

    // Save the new entry to the database.
    new_entry.save(function (err) {
        if (err) {
            console.log(err);
            return handleError(err);
        } else {
            console.log('Successfully added entry to db')
        }
    })
    
})

const app = express();

// Set 'views' directory for any views being rendered res.render()
app.use(express.static(path.join(__dirname + 'views')));
// Require static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));
// set the view engine to ejs
app.set('view engine', 'ejs');


app.get("/", function(req, res) {
    // res.sendFile(__dirname + "/index.html");
    
    if (!(data === null || data.length == 0)) {
        
        let newest_entry = data[0]; 
        let deviceTemp = newest_entry.deviceTemp;
        let deviceHumidty = newest_entry.deviceHumidity;
        let deviceMessage = newest_entry.deviceMessage;
        let deviceTime = newest_entry.deviceTime;

        res.render('index', {
            temperature: deviceTemp,
            humidity: deviceHumidty,
            time: deviceTime,
            message: deviceMessage,
        })
    } else {
        res.render('index', {
            temperature: '-1',
            humidity: '-1',
            time: '-1',
            message: 'no data obtained from database',
        })
    }
    
});

var server = app.listen(80, function() {
    console.log("Server listening on " + server.address().port);
})