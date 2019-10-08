require('dotenv').config();
var app = require('express')();
var http = require('http');
var cors = require('cors');
var server = http.createServer(app);
var io = require('socket.io').listen(server,{
    log: false,
    agent: false,
    origins: '*:*',
    transports: ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling', 'polling']
});
var allowedOrigins = ['https://mytweetstream.herokuapp.com',
    'https://mytweetstream.herokuapp.com/track'];
app.use(cors({
    origin: function(origin, callback){
        // allow requests with no origin
        // (like mobile apps or curl requests)
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));
var bodyParser =  require("body-parser");
app.use((req, res, next) => {
    // Website you wish to allow to connect
    res.header('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow

    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', false);

    // Pass to next layer of middleware
    next();
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
server.listen(process.env.PORT ||3000);

app.post("/track",function (req,res) {
    tw.untrackAll();
   tw.track(req.body.word);
    io.emit("reset","reset")
});




