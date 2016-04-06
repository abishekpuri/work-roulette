
currentTaskPosition = 0;
userID = -1;
//This will add the listInput into the List of Tasks, assigning it a random number of points
function addToList(){
  listInput = $('#listInput').val();
  points = Math.floor(Math.random()*50);
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
  $('#completedTasks').append($('li').get(currentTaskPosition));
  $('#currentTask').text('');
  $('#pointsAvailable').text('');
  $('#completed').hide();
}

//This will save all the data of the user
function saveData(){
  points = parseInt($("#totalPoints").text());
  pending = [];
  //This will create a list of all pending and completed tasks
  $('#taskList li').each(function(r){
    pending.push($('#taskList li').get(r).innerHTML);
  });
  completed = [];
  $('#completedTasks li').each(function(r){
    completed.push($('#completedTasks li').get(r).innerHTML);
  });
  $.post('/save',{
    'points': points,
    'id': userID,
    'completed': completed,
    'pending': pending
  },function(result) {
    alert(JSON.stringify(result));
  })
}

//This will get your data back using the user id
function retrieveData(){
  userID = parseInt(prompt('What is your userID?'));

  $.post('/retrieve',{
    'userID': userID
  },function(a) {
    $('#totalPoints').text(a.points);
    $("#taskList").empty();
    $("#completedTasks").empty();
    for(i = 0;i < a.pendingtasks.length;i++) {
      $('#taskList').append("<li>"+a.pendingtasks[i]+"</li>");
    }
    for(i = 0;i < a.completedtasks.length;i++) {
      $('#completedTasks').append("<li>"+a.completedtasks[i]+"</li>");
    }
  })
}
// This allows the use of enter to submit a new task
$(document).ready(function(){
  $('#completed').hide();
  $('#listInput').focus();
  $( "#listInput" ).keypress(function(e) {
    if(e.which == 13) {
      addToList();
    }
  });
});
