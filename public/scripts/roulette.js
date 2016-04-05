//This will add the listInput into the List of Tasks, assigning it a random number of points
function addToList(){
  listInput = $('#listInput').val();
  points = Math.floor(Math.random()*50);
  liString = listInput+" | "+points+"  ";
  if(listInput != '') {
    $('#taskList').append("<li>"+liString+"<button onclick='deleteFromList(this)'>Remove</button></li>");
    $('#listInput').val('');
  }
  else {
    alert('Nothing entered into Input');
  }
}

//This will delete a task from the list
function deleteFromList(element){
  if(confirm('Would you like to delete this item?') == 1){
    $(element).parent().remove();
  }
}
// This will begin the roulette
function startRoulette(){
  if($('#currentTask').text()=='') {
    allTasks = $('#taskList').children();
    taskToDoIndex = Math.floor(Math.random()*allTasks.length);
    task = $('li').get(taskToDoIndex).innerHTML;
    task = task.substr(0,task.length-55).split('|');
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
  $('#completedTasks').append('<li>'+taskCompleted[1]+'</li>');
  $('#currentTask').text('');
  $('#pointsAvailable').text('');

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
