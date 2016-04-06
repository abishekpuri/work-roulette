var express = require('express');
var pgp = require('pg-promise')();
var bodyParser = require("body-parser");
var app = express();

var db = pgp(process.env.DATABASE_URL);
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render('pages/index');
});

app.post('/retrieve', function(req,res) {
  db.one('SELECT * FROM userinfo WHERE user_id=$1',[req.body.userID])
  .catch(function(err){
    res.send("ERROR : "+error);
  }).then(function(result){
    res.send(result);
  });
});

//This will save the data of the user, completed and pending tasks stored as
// '{"task 1","task 2"}' form
app.post('/save',function(req,res) {
  if(req.body.id == -1) {
    console.log("request", JSON.stringify(req.body));
    db.one('INSERT INTO userinfo(points,completedtasks,pendingtasks) VALUES'+
    '(${points},${completed},${pending}) returning user_id', req.body)
    .catch(function(error){
      res.send("ERROR : "+error);
    }).then(function(result){
      res.send(result);
    })
  }
  else {
    db.one('UPDATE userinfo SET points = ${points}, completedtasks = ${completed}, pendingtasks = ${pending}'+
    ' WHERE user_id = ${id} returning user_id', req.body)
    .catch(function(error){
      res.send("ERROR : "+error);
    }).then(function(result){
      res.send(result);
    })
  }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
