  var express = require('express');
var pgp = require('pg-promise')();
var bodyParser = require("body-parser");
var app = express();

var db = pgp(process.env.DATABASE_URL || 'postgres://abishekpuri@localhost/work-roulette');
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render('pages/index');
});

app.post('/retrieveTasks', function(req,res) {
  db.any('SELECT t_id,points,category,description,completed,actualcompletion FROM tasks WHERE ' +
  'acct=$1 order by category,description',[req.body.userID])
  .then(function(result) {
    res.send(result);
  }).catch(function(error) {
    res.send("ERROR: " + error);
  });
})

app.post('/retrieveMeetings', function(req,res) {
  db.any('SELECT m_id,category,description,completed,meeting_time FROM meetings WHERE ' +
  'acct=$1 order by category,description',[req.body.userID])
  .then(function(result) {
    res.send(result);
  }).catch(function(error) {
    res.send("ERROR: " + error);
  });
})

//This will change an uncompleted task to completed
app.post("/completedTask", function(req,res) {
  db.none("UPDATE tasks set completed = true,actualcompletion = ${act},datecompleted = now() " +
  " where t_id=${id}",req.body)
  .then(function(result) {
    res.send(result);
  }).catch(function(error) {
    res.send(error);
  });
})

app.post("/completedMeeting", function(req,res) {
  db.none("UPDATE meetings set completed = true where m_id = ${id}",req.body)
  .then(function(result) {
    res.send(result);
  }).catch(function(error) {
    res.send(error);
  })
})

//This will add a task to the task table
app.post('/addTask',function(req,res) {
  db.one('INSERT INTO tasks(category,description,points,acct,completed,estimatedcompletion) VALUES' +
         '(${category},${description},${points},${acct},false,${est}) returning t_id', req.body)
  .then(function(result){
    res.send(result);
  }).catch(function(error){
    res.send("ERROR : " + error);
  });
});

app.post('/addMeeting',function(req,res) {
  db.one('INSERT INTO meetings(category,description,acct,meeting_time,completed) VALUES' +
         '(${category},${description},${acct},${mtime},false) returning m_id', req.body)
  .then(function(result){
    res.send(result);
  }).catch(function(error){
    res.send("ERROR : " + error);
  });
});

app.post("/getTotalEstimatedTime", function(req,res) {
  db.one('SELECT SUM(estimatedcompletion) FROM tasks WHERE acct = ${id} and completed = false',req.body)
  .then(function(result) {
    console.log(result);
    res.send(result);
  }).catch(function(error) {
    console.log(error);
    res.send("ERROR " + error);
  })
})
app.post('/assignID', function(req,res) {
  db.one("INSERT INTO ACCOUNT(points) VALUES(0) returning user_id")
  .then(function(result) {
    res.send(result);
  }).catch(function(error) {
    res.send(error);
  })
})
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
