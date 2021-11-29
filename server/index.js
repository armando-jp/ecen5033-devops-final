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
    Device.find().sort({ _id: -1 }).limit(5).then((query) => {
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
app.use(express.static(path.join(__dirname, 'app')));
// set the view engine to ejs
app.set('view engine', 'ejs');


app.get("/", function(req, res) {
    // res.sendFile(__dirname + "/index.html");
    
    if (!(data === null || data.length == 0)) {

        res.render('index', {
            id_0 : data[0]._id.toString(),    
            temperature_0: data[0].deviceTemp,
            humidity_0: data[0].deviceHumidity,
            time_0: data[0].deviceTime,
            message_0: data[0].deviceMessage,

            id_1 : data[1]._id.toString(),
            temperature_1: data[1].deviceTemp,
            humidity_1: data[1].deviceHumidity,
            time_1: data[1].deviceTime,
            message_1: data[1].deviceMessage,

            id_2 : data[2]._id.toString(),
            temperature_2: data[2].deviceTemp,
            humidity_2: data[2].deviceHumidity,
            time_2: data[2].deviceTime,
            message_2: data[2].deviceMessage,

            id_3 : data[3]._id.toString(),
            temperature_3: data[3].deviceTemp,
            humidity_3: data[3].deviceHumidity,
            time_3: data[3].deviceTime,
            message_3: data[3].deviceMessage,

            id_4 : data[4]._id.toString(),
            temperature_4: data[4].deviceTemp,
            humidity_4: data[4].deviceHumidity,
            time_4: data[4].deviceTime,
            message_4: data[4].deviceMessage,
        })
    } else {
        res.render('index', {
            id_0 : '-1',
            temperature_0: '-1',
            humidity_0: '-1',
            time_0: '-1',
            message_0: 'no data obtained from database',
            id_1 : '-1',
            temperature_1: '-1',
            humidity_1: '-1',
            time_1: '-1',
            message_1: 'no data obtained from database',
            id_2 : '-1',
            temperature_2: '-1',
            humidity_2: '-1',
            time_2: '-1',
            message_2: 'no data obtained from database',
            id_3 : '-1',
            temperature_3: '-1',
            humidity_3: '-1',
            time_3: '-1',
            message_3: 'no data obtained from database',
            id_4 : '-1',
            temperature_4: '-1',
            humidity_4: '-1',
            time_4: '-1',
            message_4: 'no data obtained from database',

        })
    }
    
});

var server = app.listen(80, function() {
    console.log("Server listening on " + server.address().port);
})