require('dotenv').config();
var app = require('express')();
var http = require('http');
var cors = require('cors');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var bodyParser =  require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({credentials: true,origin: 'http://localhost:3000'}));
io.origins('*:*');
var Twitter = require('node-tweet-stream')
    , tw = new Twitter({
    consumer_key: process.env.consumer_key,
    consumer_secret: process.env.consumer_secret,
    token: process.env.token,
    token_secret: process.env.token_secret
});

tw.on('tweet', function (tweet) {
    const data = {
        'name': tweet.user.name,
        'screen_name': tweet.user.screen_name,
        'text': tweet.text,
        'avatar': tweet.user.profile_image_url
    };
    if(!tweet.text.startsWith("RT @")){
        io.emit("tweet",data)

    }

});
server.listen(3001);

app.post("/track",function (req,res) {
    tw.untrackAll();
   tw.track(req.body.word);
    io.emit("reset","reset")
});




