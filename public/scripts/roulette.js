
currentTaskPosition = 0;
currentTasks = 0
userID = -1;
//This will add the listInput into the List of Tasks, assigning it a random number of points
function addToList(){
  listInput = $('#listInput').val();
  points = (Math.floor(Math.random()*10)+1);
  liString = listInput+" | "+points+"  ";
  if(listInput != '') {
    $('#taskList').append("<li id='"+currentTasks+"'> "+liString+
    "<button onclick='specialComplete(\""+listInput+
    "\","+points+","+currentTasks+")'> Finished Task </button>"+"</li>");
    $('#listInput').val('');
    currentTasks += 1;
  }
  else {
    alert('Nothing entered into Input');
  }
}

function addToFinishedList(){
  listInput = $('#listInput').val();
  points = (Math.floor(Math.random()*10)+1);
  liString = listInput+" | "+points+"  ";
  if(listInput != '') {
    $('#taskList').append("<li>"+liString+"</li>");
    $('#listInput').val('');
  }
  else {
    alert('Nothing entered into Input');
  }
}

//This will delete a task from the list
//TO DO : Currently not being used
function deleteFromList(element){
  if(confirm('Would you like to delete this item?') == 1){
    $(element).parent().remove();
  }
}
// This will begin the roulette
function startRoulette(){
  if($('#currentTask').text()=='') {
    allTasks = $('#taskList').children('li');
    taskToDoIndex = Math.floor(Math.random()*allTasks.length);
    currentTaskPosition = taskToDoIndex;
    task = $('#taskList li').get(taskToDoIndex).innerHTML;
    task = task.split('|');
    task[1] = parseInt(task[1]);
    $('#currentTask').text('The Roulette Assigned Task Is : ' + task[0]);
    $('#pointsAvailable').text('The Number of Points Up For Grabs are : '+task[1]);
    $('#completed').show();
  }
  else {
    alert("Haven't Finished the current task yet!");
  }
}
//This will complete a task
function completedTask(){
  pointsEarned = parseInt($("#pointsAvailable").text().split(':')[1]);
  taskCompleted = $('#currentTask').text();
  taskCompleted = taskCompleted.split(':');
  $('#totalPoints').text(parseInt($('#totalPoints').text())+pointsEarned);
  $('#completedTasks').append("<li>"+taskCompleted+"</li>");
  $('#currentTask').text('');
  $('#pointsAvailable').text('');
  $('#completed').hide();
}

function specialComplete(task,points,position){
  pointsEarned = parseInt(points);
  taskCompleted = task;
  $("#"+position).remove();
  $('#totalPoints').text(parseInt($('#totalPoints').text())+pointsEarned);
  $('#completedTasks').append("<li>"+taskCompleted+"</li>");
  $('#currentTask').text('');
  $('#pointsAvailable').text('');
  $('#completed').hide();
}

//This will save all the data of the user
function saveData(){
  points = parseInt($("#totalPoints").text());
  pending = [];
  taskids = [];
  //This will create a list of all pending and completed tasks
  $('#taskList li').each(function(r){
    pending.push($('#taskList li').get(r).innerHTML);
    taskids.push($("ul li:nth-child("+(r+1)+")").attr('id'))
  });
  completed = [""];
  $('#completedTasks li').each(function(r){
    completed.push($('#completedTasks li').get(r).innerHTML);
  });
  $.post('/save',{
    'points': points,
    'id': userID,
    'completed': completed,
    'pending': pending,
    'taskids': taskids
  },function(result) {
    alert(JSON.stringify(result));
  })
}

//This will get your data back using the user id
function retrieveData(){
  userID = parseInt(prompt('What is your user ID?'));

  $.post('/retrieve',{
    'userID': userID
  },function(a) {
    $('#totalPoints').text(a.points);
    $("#taskList").empty();
    $("#completedTasks").empty();
    currentTasks = a.pendingtasks.length + 1;
    for(i = 0;i < a.pendingtasks.length;i++) {
      taskID = a.taskids[i];
      $('#taskList').append("<li id="+taskID+">"+a.pendingtasks[i]+"</li>");
    }
    for(i = 0;i < a.completedtasks.length;i++) {
      $('#completedTasks').append("<li>"+a.completedtasks[i]+"</li>");
    }
  })
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
// This allows the use of enter to submit a new task
$(document).ready(function(){
  $('#completed').hide();
  $('#dialogBox').hide();
  $('#listInput').focus();
  $( "#listInput" ).keypress(function(e) {
    if(e.which == 13) {
      addToList();
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
