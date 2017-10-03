
currentTaskPosition = 0;
currentTasks = 0
userID = -1;
totalHours = 0;
//This will add the listInput into the List of Tasks, assign it a random number of points
function addToList(){
  if($("#activityType").val() == 'Meeting') {
    addMeeting();
  }
  else {
    addTask();
  }
}

function sortByPriority() {
  retrieveData(1);
}

function sortByCategory() {
  retrieveData(0);
}

function addTask() {
  listInput = $('#category').val()+": "+$('#task').val();
  points = (Math.floor(Math.random()*10)+1);
  console.log(parseInt($("#priority").val()))
  if(listInput != ': ') {
    $.post('/addTask', {
      'category': $('#category').val(),
      'description': $('#task').val(),
      'points': points,
      'acct': userID,
      'priority': parseInt($("#priority").val()),
      'est': parseFloat($("#hours").val())
    },function(result) {
      p = parseInt($("#priority").val());
      rgb = "style='background-color:rgb(" + (p<4 ? 255 : (5 - p) * 161)  + "," + (p > 2 ? 255 : (p - 1) * 161) + ",0)'";
      colorbox = "<div class = 'priority-display'" + rgb + "></div>  "
      $('#taskList').append("<li id='t"+result.t_id+"'> " + colorbox +listInput+
      " <button class = 'btn btn-link btn-xs' onclick='specialComplete(\""+listInput+
      "\","+points+","+result.t_id+")'> Finished Task </button> </li>");
      $('#task').val('');
      $('#category').val('');
      currentTasks += 1;
      updateEstimatedTime();
    })
  }
  else {
    alert('Nothing entered into Input');
  }
}

function addMeeting() {
  listInput = $('#category').val()+": "+$('#task').val() + " " + $("#meetingTime").val();
  if(listInput != ': ') {
    $.post('/addMeeting', {
      'category': $('#category').val(),
      'description': $('#task').val(),
      'acct': userID,
      'mtime': $("#meetingTime").val()
    },function(result) {
      $('#meetingList').append("<li id='m"+result.m_id+"'> "+listInput+
      "<button onclick='meetingComplete(\""+listInput+
      "\","+result.m_id+")'> Finished Task </button> </li>");
      $('#task').val('');
      $("#meetingTime").val('');
      $('#category').val('');
      currentTasks += 1;
    })
  }
  else {
    alert('Nothing entered into Input');
  }
}
function adjustBoxes() {
  if($("#activityType").val() == 'Meeting') {
    $("#task").attr("placeholder","Meeting Description");
    $("#hours").hide();
    $("#meetingTime").show();
  }
  else {
    $("#tasks").attr("placeholder","Task Description");
    $("#hours").show();
    $("#meetingTime").hide();
  }
}
//This will delete a task from the list
//TO DO : Currently not being used
function deleteFromList(element){
  if(confirm('Would you like to delete this item?') == 1){
    $(element).parent().remove();
  }
}

function updateEstimatedTime() {
  $.post("/getTotalEstimatedTime", {
    'id': userID
  },function(result) {
    console.log(result);
    $("#estimatedTime").text(result.sum);
  })
}
// This will begin the roulette
function startRoulette(){
  if($('#currentTask').text()=='') {
    allTasks = $('#taskList').children('li');
    taskToDoIndex = Math.floor(Math.random()*allTasks.length);
    currentTaskPosition = taskToDoIndex;
    task = $('#taskList li span').get(taskToDoIndex).innerHTML;
    $('#currentTask').text('The Roulette Assigned Task Is : ' + task);
    $('#pointsAvailable').text('The Number of Points Up For Grabs are : '+task[1]);
    $('#completed').show();
  }
  else {
    alert("Haven't Finished the current task yet!");
  }
}

function specialComplete(task,points,position){
  actualTime = parseFloat(prompt("How many hours did it take?"))
  $.post("/completedTask",{
    'id': position,
    'act': actualTime
  },function(result){
    pointsEarned = parseInt(points);
    taskCompleted = task;
    $("#t"+position).remove();
    $('#totalPoints').text(parseInt($('#totalPoints').text())+pointsEarned);
    $('#completedTasks').append("<li>"+taskCompleted+"</li>");
    $('#currentTask').text('');
    $("#hoursDone").text(parseFloat(parseFloat($("#hoursDone").text()).toFixed(2)) + parseFloat(actualTime.toFixed(2)) +  " hours Done");
    $('#pointsAvailable').text('');
    updateEstimatedTime();
  })
};

function meetingComplete(task,position) {
  $.post("/completedMeeting",{
    'id': position
  },function(result){
    $("#m"+position).remove();
    $('#completedTasks').append("<li> Meeting "+task+"</li>");
  })
}
function taskUpdating(a) {
  points = a.reduce(function(a,b){
    if (b.completed == true) {
      totalDone += b.actualcompletion;
      return a + b.points;
    }
    else {
      return a;
    }
  },0);
  $('#totalPoints').text(points);
  $("#hoursDone").text(totalDone + " hours Done");
  for(i = 0;i < a.length;i++) {
    if(a[i].completed == false) {
      p = a[i].priority;
      rgb = "style='background-color:rgb(" + (p<4 ? 255 : (5 - p) * 161)  + "," + (p > 2 ? 255 : (p - 1) * 161) + ",0)'";
      colorbox = "<div class = 'priority-display'" + rgb + "></div>  "
      $('#taskList').append("<li "+" id=t"+a[i].t_id+">"+ colorbox + "<span>" + a[i].category+": "+a[i].description+" </span> <button class = 'btn btn-link btn-xs' " +
      "onclick='specialComplete(\""+a[i].category+": "+a[i].description+"\","+a[i].points+","+a[i].t_id+")'> Finished Task </button>"
      +"</li>");
    }
    else {
      $('#completedTasks').append("<li>"+a[i].category+": "+a[i].description+"</li>");
    }
  }
}

function meetingUpdate(a) {
  for(i = 0; i < a.length; i++) {
    if(a[i].completed == false) {
      $('#meetingList').append("<li id=m"+a[i].m_id+">"+a[i].category+": "+a[i].description+" " +
      a[i].meeting_time.split("T")[0] + " " + a[i].meeting_time.split("T")[1].split("Z")[0]
      +" <button " + "onclick='meetingComplete" +
      "(\""+a[i].category+": "+a[i].description+"\","+a[i].m_id+")'> Finished Task </button>"
      +"</li>");
    }
    else {
      $('#completedTasks').append("<li> Meeting "+a[i].category+": "+a[i].description+"</li>");
    }
  }
}
//This will get your data back using the user id
function retrieveData(priority){
  $("#taskList").empty();
  $("#completedTasks").empty();
  totalDone = 0;
  if(userID == -1) {
    userID = parseInt(prompt("What is your account number?"));
    $("#userID").text(userID);
    updateEstimatedTime();
  }
  if(priority) {
    $.post('/retrieveTasksPriority',{
      'userID': userID
    },taskUpdating);
  } else {
    $.post('/retrieveTasks',{
      'userID': userID
    },taskUpdating);
  }
  $.post('/retrieveMeetings', {
    'userID': userID
  },meetingUpdate)
}

//This will assign the user an ID at the beginning of his session
function assignID(){
  $.post('/assignID',{},function(a){
    userID = parseInt(a.user_id);
    $("#userID").text(userID);
    updateEstimatedTime();
  });
}

function eligibleForReward(reward) {
  if(parseInt(reward[reward.length-1]) == 1) {
    return parseInt($('#totalPoints').text()) >= 12;
  }
}

function clock(minutes,reward_val) {
  var currentSecond = 0;
  var currentMinute = minutes;
  var clock = setInterval(function(){
    $('[data-clock='+reward_val+']').text(currentMinute+ ' : '+ currentSecond);
    currentSecond -= 1;
    if(currentSecond < 0) {
      currentSecond = 59;
      currentMinute -= 1;
    }
    if(currentMinute < 0) {
      clearInterval(clock);
      $('[data-popup="' + reward_val + '"]').fadeOut(350);
      alert("Time to get back to work!");
    }
  },1000);
}

function login() {
  existinguser = confirm("Do you already have an account?");
  if(!existinguser) {
    assignID();
  } else {
    retrieveData();
  }
}
// This allows the use of enter to submit a new task
$(document).ready(function(){
  $('#completed').hide();
  $('#dialogBox').hide();
  $('#listInput').focus();
  $("#meetingTime").hide();
  login();
  $( "#task" ).keypress(function(e) {
    if(e.which == 13) {
      addToList();
      $("#category").focus();
    }
  });
  //These deal with the popup stuff
  $('[data-popup-open]').on('click', function(e)  {
          var reward_val = jQuery(this).attr('data-popup-open');
          if(eligibleForReward(reward_val)) {
            var currentPoints = parseInt($('#totalPoints').text());
            $('#totalPoints').text(currentPoints - 12);
            $('[data-popup="' + reward_val + '"]').fadeIn(350);
            var minutes = parseInt($('[data-clock='+reward_val+']').attr('data-time'));
            clock(minutes,reward_val);
          }
          else {
            alert("Need More Points for a Break!!");
          }
          e.preventDefault();
      });
  $('[data-popup-close]').on('click', function(e)  {
    var reward_val = jQuery(this).attr('data-popup-close');
    $('[data-popup="' + reward_val + '"]').fadeOut(350);
    e.preventDefault();
  });
});
