const mongoose = require('mongoose');
const { Schema } = mongoose;

const deviceSchema = new Schema({
    deviceTemp: Number,
    deviceHumidity: Number,
    deviceMessage: String,
    deviceTime: String,
});

mongoose.model('device', deviceSchema);