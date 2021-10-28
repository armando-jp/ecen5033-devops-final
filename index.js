const express = require("express");
const https = require("https");

const app = express();
app.use(express.static(__dirname));

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


app.listen(3000, function() {
    console.log("Server listening on 3000.")
})