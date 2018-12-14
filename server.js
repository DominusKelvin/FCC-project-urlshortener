'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var btoa = require('btoa');
var atob = require('atob');
var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
var countersSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  count: { type: Number, default: 0 }
});

var Counter = mongoose.model('Counter', countersSchema);

var urlSchema = new mongoose.Schema({
  _id: {type: Number},
  url: '',
  created_at: ''
});

urlSchema.pre('save', function(next) {
  console.log('running pre-save');
  var doc = this;
  Counter.findByIdAndUpdate({ _id: 'url_count' }, { $inc: { count: 1 } }, function(err, counter) {
      if(err) return next(err);
      console.log(counter);
      console.log(counter.count);
      doc._id = counter.count;
      doc.created_at = new Date();
      console.log(doc);
      next();
  });
});

mongoose.connect(process.env.MONGOLAB_URI, {
  useMongoClient: true
});

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

pp.post("/api/shorturl/new", function(req, res, next) {
  
  console.log(req.body.url);
  var urlData = req.body.url;
  URL.findOne({url: urlData}, function(err, doc) {
      if(doc) {
          console.log('entry found in db');
          res.json({
              original_url: urlData,
              short_url: btoa(doc._id),
              status: 200,
              statusTxt: 'OK'
          });
      } else {
          console.log('entry NOT found in db, saving new');
          var url = new URL({
              url: urlData
          });
          url.save(function(err) {
              if(err) return console.error(err);
              res.json({
                  original_url: urlData,
                  short_url: btoa(url._id),
                  status: 200,
                  statusTxt: 'OK'
              });
          });
      }
  });

});


app.listen(port, function () {
  console.log('Node.js listening ...');
});