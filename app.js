var express = require('express');
var mongo = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
 
var app = express();
app.enable("jsonp callback");

var port = process.env.PORT || 1337;
var MongoClient = mongo.MongoClient;

var client = new MongoClient();

var db;

client.connect("mongodb://heroku:hGv6EFncEtoPiE1@ds055980.mongolab.com:55980/bldata",function(err,db) {
    if(err) {
        console.log("Connection to database failed.");
    } else {
        collection = db.collection("images");
        console.log("Connection to database succeded.")
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

//Get the value of a machine learning tag for a given image
app.get('/images/:id/machine-tags/:tag', function(req,res) {
    var id = req.params.id;
    var tag = req.params.tag;
    console.log("Getting value of machine tag '" + tag + "' for image with id:" + id);
    collection.findOne({"_id":new ObjectId(id)}, function(err,doc) {
        var tags = doc.machinetags;
        var index = tagIndex(tag,tags);
        if(index<0) {
            res.json({});
        } else {
            res.json(tags[index]);
        }
    });
});

//Get the value of a crowdsourced tag for a given image
app.get('/images/:id/crowd-tags/:tag', function(req,res) {
    var id = req.params.id;
    var tag = req.params.tag;
    console.log("Getting value of crowd tag '" + tag + "' for image with id:" + id);
    collection.findOne({"_id":new ObjectId(id)}, function(err,doc) {
        var tags = doc.crowdtags;
        var index = tagIndex(tag,tags);
        if(index<0) {
            res.json({});
        } else {
            res.json(tags[index]);
        }
    });
});

//PUT

//Update the value of a machine learning tag for a given image
app.put('/images/:id/machine-tags/:tag/:value', function(req,res) {
    var status = 200;
    var id = req.params.id;
    var tag = req.params.tag;
    var value = Number(req.params.value);
    if(isNaN(value)) {
        res.sendStatus(500);
    } else {
        console.log("Updating value of machine tag '" + tag + "' with value " + value + " for image with id:" + id);
        collection.findOne({"_id":new ObjectId(id)}, function(err,doc) {
            if(err) {
                status = 500;
            } else {
                var tags = doc.machinetags;
                removeTag(tag,tags);
                var newTag = {};
                newTag.tag = tag;
                newTag.value = value;
                tags.push(newTag);
                collection.findAndModify({"_id":new ObjectId(id)},[["_id","asc"]],{$set:{machinetags:tags}},{},function(err,object) {
                    if(err) {
                        status = 500;
                    }
                    res.sendStatus(status);
                });
            }
        });
    }
});

//Update the value of a crowdsourced tag for a given image
app.put('/images/:id/crowd-tags/:tag/:value', function(req,res) {
    var status = 200;
    var id = req.params.id;
    var tag = req.params.tag;
    var value = Number(req.params.value);
    if(isNaN(value)) {
        res.sendStatus(500);
    } else {
        console.log("Updating value of crowd tag '" + tag + "' with value " + value + " for image with id:" + id);
        collection.findOne({"_id":new ObjectId(id)}, function(err,doc) {
            if(err) {
                status = 500;
            } else {
                var tags = doc.crowdtags;
                removeTag(tag,tags);
                var newTag = {};
                newTag.tag = tag;
                newTag.value = value;
                tags.push(newTag);
                collection.findAndModify({"_id":new ObjectId(id)},[["_id","asc"]],{$set:{crowdtags:tags}},{},function(err,object) {
                    if(err) {
                        status = 500;
                    }
                    res.sendStatus(status);
                });
            }
        });
    }
});

function removeTag(tag,array) {
    var index = tagIndex(tag,array);
    if(index>-1) {
        array.splice(index,1);
    }
}

function tagIndex(tag,array) {
    for(var i = 0; i<array.length; i++) {
        if(array[i].tag===tag) {
            return i;
        }
    }
    return -1;
}

app.listen(port);
console.log('Listening on port ' + port + '...');