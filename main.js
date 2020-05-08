// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: 'AIzaSyAyNPBXrb1sc_TzUpIU6VCs3hGAlM9wO6A',
  authDomain: 'all-the-tools.firebaseapp.com',
  databaseURL: 'https://all-the-tools.firebaseio.com',
  projectId: 'all-the-tools',
  storageBucket: 'all-the-tools.appspot.com',
  messagingSenderId: '825917605672',
  appId: '1:825917605672:web:f156d75748072693deb21d',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// To do list
const form = document.getElementById('form');
const box = document.getElementById('input_box');
form.addEventListener('submit', function (e) {
  e.preventDefault();
  addTask(box);
  create_unfinished_task();
});

function addTask(input) {
  if (input.value.length != 0) {
    const key = firebase.database().ref().child('unfinished_key').push().key;
    var task = {
      title: input.value,
      key: key,
    };

    var updates = {};
    updates['/unfinished_task/' + key] = task;
    firebase.database().ref().update(updates);
  }
}

function create_unfinished_task() {
  unfin_container = document.getElementById('unfin-container');
  unfin_container.innerHTML = '';

  task_array = [];
  firebase
    .database()
    .ref('unfinished_task')
    .once('value', function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        task_array.push(Object.values(childData));
      });
      for (var i, i = 0; i < task_array.length; i++) {
        task_key = task_array[i][0];
        task_title = task_array[i][1];

        task_container = document.createElement('div');
        task_container.setAttribute('class', 'task_container');
        task_container.setAttribute('data-key', task_key);

        task_data = document.createElement('div');
        task_data.setAttribute('class', 'task_data');

        title = document.createElement('p');
        title.setAttribute('class', 'task_title');
        title.setAttribute('contenteditable', false);
        title.innerHTML = task_title;

        task_tool = document.createElement('div');
        task_tool.setAttribute('class', 'task_tool');

        task_done_button = document.createElement('button');
        task_done_button.setAttribute('class', 'task_done_button');

        fa_done = document.createElement('i');
        fa_done.setAttribute('class', 'fa fa-check');

        task_edit_button = document.createElement('button');
        task_edit_button.setAttribute('class', 'task_edit_button');
        fa_edit = document.createElement('i');
        fa_edit.setAttribute('class', 'fa fa-pencil');

        task_delete_button = document.createElement('button');
        task_delete_button.setAttribute('class', 'task_delete_button');
        fa_delete = document.createElement('i');
        fa_delete.setAttribute('class', 'fa fa-trash');

        unfin_container.append(task_container);
        task_container.append(task_data);
        task_data.append(title);
        task_container.append(task_tool);

        task_tool.append(task_done_button);
        task_done_button.append(fa_done);

        task_tool.append(task_edit_button);
        task_edit_button.append(fa_edit);

        task_tool.append(task_delete_button);
        task_delete_button.append(fa_delete);
      }

      taskDone(unfin_container);
      taskEdit(task_container);
      taskDelete(task_container);
    });
}

function taskDone(unfin_container) {
  let edit_button = unfin_container.querySelectorAll('.task_done_button');

  editButtonArray = Array.from(edit_button);

  for (let i = 0; i < editButtonArray.length; i++) {
    editButtonArray[i].addEventListener('click', function (e) {
      finished_task_container = document.getElementById('fin-container');
      const finishedTask = e.target.parentNode.parentNode.parentElement;
      finishedTask.remove();
      finished_task_container.append(finishedTask);

      const key = finishedTask.getAttribute('data-key');
      var task_obj = {
        title: finishedTask.childNodes[0].childNodes[0].innerHTML,
        key: key,
      };

      var updates = {};
      updates['/finished_task/' + key] = task_obj;
      firebase.database().ref().update(updates);
    });
  }
}

function loadFinishedTasks() {
  const finContainer = document.getElementById('fin-container');
  task_array = [];
  firebase
    .database()
    .ref('finished_task')
    .once('value', function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        task_array.push(Object.values(childData));
      });
      for (var i, i = 0; i < task_array.length; i++) {
        task_key = task_array[i][0];
        task_title = task_array[i][1];

        task_container = document.createElement('div');
        task_container.setAttribute('class', 'task_container');
        task_container.setAttribute('data-key', task_key);

        task_data = document.createElement('div');
        task_data.setAttribute('class', 'task_data');

        title = document.createElement('p');
        title.setAttribute('class', 'task_title');
        title.setAttribute('contenteditable', false);
        title.innerHTML = task_title;

        finContainer.append(task_container);
        task_container.append(task_data);
        task_data.append(title);
      }
    });
}

function taskEdit() {}
function taskDelete() {}

let stateCheck = setInterval(() => {
  if (document.readyState === 'complete') {
    clearInterval(stateCheck);
    create_unfinished_task();
    loadFinishedTasks();
  }
}, 100);

//// Next task
// Grab what is in fished_task on firebase and display it in the Finished task section
// And figure out why finished tasks aren't moved out of the finished task section of firebase when the "done" button is clicked
