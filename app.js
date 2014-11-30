var express = require('express');
var mongo = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
 
var app = express();
app.enable("jsonp callback");

var port = 1337;
var Server = mongo.Server;
var Db = mongo.Db;
var BSON = mongo.BSONPure;

var server = new Server('localhost',27017,{auto_reconnect:true});
var db = new Db('test',server);
var collection = db.collection('images');

db.open(function(err,db) {
    if(!err) {
        console.log('Connected to db');
    }
});

//GET

//Get a random image from the data set
app.get('/images/random', function(req,res) {
    console.log("Getting a random image");
    var resultString = ""
    collection.count(function(err,documentCount) {
        var skipNum = Math.floor(Math.random()*(documentCount-1));
        var options = {
            "limit":1,
            "skip":skipNum
        }
        collection.findOne({},{},options,function(err,doc) {
            res.json(doc);
        });
    });
});

//Get an image by ID
app.get('/images/:id', function(req,res) {
    console.log("Getting image with ID:"+req.params.id);
    collection.findOne({"_id":new ObjectId(req.params.id)},function(err,doc) {
        res.json(doc);
    });
});

//Get the value of a tag for a given image
app.get('/images/:id/:tag', function(req,res) {
    var id = req.params.id;
    var tag = req.params.tag;
    console.log("Getting value of tag '" + tag + "' for image with id:" + id);
    res.send("");
})

//PUT

//Update the value of a tag for a given image
app.get('/images/:id/:tag', function(req,res) {
    var id = req.params.id;
    var tag = req.params.tag;
    console.log("Updating value of tag '" + tag + "' for image with id:" + id);

})



function randRange(value) {
    return Math.floor(Math.random()*(value+1));
}

app.listen(port);
console.log('Listening on port ' + port + '...');