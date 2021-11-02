var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt:localhost')

client.on('connect', function () {
        client.subscribe('presence', function (err) {
            if (!err) {
                client.publish('presence', 'Hello mqtt')
            }
            else {
                console.log("Error")
        }
    })
})

client.on('message', function (topic, message) {
    // message is Buffer
    console.log(message.toString())
    console.log("success!")
    client.end()
})