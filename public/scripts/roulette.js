
currentTaskPosition = 0;
currentTasks = 0
userID = -1;
//This will add the listInput into the List of Tasks, assigning it a random number of points
function addToList(){
  listInput = $('#category').val()+": "+$('#task').val();
  points = (Math.floor(Math.random()*10)+1);
  if(listInput != '') {
    $.post('/addTask', {
      'category': $('#category').val(),
      'description': $('#task').val(),
      'points': points,
      'acct': userID
    },function(result) {
      $('#taskList').append("<li id='"+result.t_id+"'> "+listInput+
      "<button onclick='specialComplete(\""+listInput+
      "\","+points+","+result.t_id+")'> Finished Task </button>"+"</li>");
      $('#task').val('');
      $('#category').val('');
      currentTasks += 1;
    })
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
  $.post("/completedTask",{
    'id': position
  },function(result){
    pointsEarned = parseInt(points);
    taskCompleted = task;
    $("#"+position).remove();
    $('#totalPoints').text(parseInt($('#totalPoints').text())+pointsEarned);
    $('#completedTasks').append("<li>"+taskCompleted+"</li>");
    $('#currentTask').text('');
    $('#pointsAvailable').text('');
    $('#completed').hide();
  })
};

//This will get your data back using the user id
function retrieveData(){
  $("#taskList").empty();
  $("#completedTasks").empty();
  if(userID == -1) {
    userID = parseInt(prompt("What is your account number?"));
  }
  $.post('/retrieve',{
    'userID': userID
  },function(a) {
    points = a.reduce(function(a,b){
      if (b.completed == true) {
        return a + b.points;
      }
      else {
        return a;
      }
    },0);
    $('#totalPoints').text(points);
    for(i = 0;i < a.length;i++) {
      if(a[i].completed == false) {
        $('#taskList').append("<li id="+a[i].t_id+">"+a[i].category+": "+a[i].description+" <button " +
        "onclick='specialComplete(\""+a[i].category+": "+a[i].description+"\","+a[i].points+","+a[i].t_id+")'> Finished Task </button>"
        +"</li>");
      }
      else {
        $('#completedTasks').append("<li>"+a[i].category+": "+a[i].description+"</li>");
      }
    }
  })
}

//This will assign the user an ID at the beginning of his session
function assignID(){
  $.post('/assignID',{},function(a){
    userID = a.user_id;
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
// This allows the use of enter to submit a new task
$(document).ready(function(){
  $('#completed').hide();
  $('#dialogBox').hide();
  $('#listInput').focus();
  existinguser = confirm("Do you already have an account?");
  if(!existinguser) {
    assignID();
  } else {
    retrieveData();
  }
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
