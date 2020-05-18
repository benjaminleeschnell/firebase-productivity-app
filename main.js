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
  box.value = '';
});

function addTask(input) {
  if (input.value.length != 0) {
    const key = firebase.database().ref().child('unfinished_key').push().key;
    var task = {
      title: input.value,
      state: false,
      key: key,
    };

    var updates = {};
    updates['/tasks/' + key] = task;
    firebase.database().ref().update(updates);
  }
}

function create_unfinished_task() {
  unfin_container = document.getElementById('unfin-container');
  unfin_container.innerHTML = '';

  task_array = [];
  firebase
    .database()
    .ref('tasks')
    .once('value', function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        task_array.push(Object.values(childData));
      });
      for (var i, i = 0; i < task_array.length; i++) {
        task_key = task_array[i][0];
        state = task_array[i][1];
        task_title = task_array[i][2];

        task_container = document.createElement('div');
        task_container.setAttribute('class', 'task_container');
        task_container.setAttribute('data-key', task_key);

        task_data = document.createElement('div');
        task_data.setAttribute('class', 'task_data');

        checkbox = document.createElement('input');
        checkbox.setAttribute('class', 'done');
        checkbox.type = 'checkbox';
        checkbox.checked = state;

        title = document.createElement('p');
        title.setAttribute('class', 'task_title');
        title.setAttribute('contenteditable', false);
        title.innerHTML = task_title;

        task_tool = document.createElement('div');
        task_tool.setAttribute('class', 'task_tool');

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
        task_data.append(checkbox);
        task_data.append(title);
        task_container.append(task_tool);
        if (state === true) {
          task_container.classList.add('finished');
        }

        task_tool.append(task_edit_button);
        task_edit_button.append(fa_edit);

        task_tool.append(task_delete_button);
        task_delete_button.append(fa_delete);
      }

      taskDone(unfin_container);
      taskEdit(unfin_container);
      taskDelete(unfin_container);
    })
    .then(() => {
      return firebase
        .database()
        .ref('tasks')
        .once('value', function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();
            task_array.push(Object.values(childData));
          });
        });
      // taskReorder(unfin_container);
    })
    .catch(console.log('error'));
}

function taskReorder(unfin_container) {
  let finished = unfin_container.getElementsByClassName('.finished');
  for (let i = 0; i < finished.length; i++) {
    console.log(finished[i]);
    finished[i].removeChild();
    unfin_container.append(finished[i]);
  }
}

function taskDone(unfin_container) {
  let done_button = unfin_container.querySelectorAll('.done');
  for (let i = 0; i < done_button.length; i++) {
    done_button[i].addEventListener('change', function (e) {
      const task_container = e.currentTarget.parentNode.parentNode;
      if (e.target.checked) {
        unfin_container.append(task_container);
        task_container.classList.add('finished');
        let key = task_container.getAttribute('data-key');
        state = task_container.childNodes[0].childNodes[0].checked;
        var task_obj = {
          title: task_container.childNodes[0].innerText,
          state: state,
          key: key,
        };
        var updates = {};
        updates['/tasks/' + key] = task_obj;
        firebase.database().ref().update(updates);
      } else {
        unfin_container.prepend(task_container);
        task_container.classList.remove('finished');
        let key = task_container.getAttribute('data-key');
        state = task_container.childNodes[0].childNodes[0].checked;
        var task_obj = {
          title: task_container.childNodes[0].innerText,
          state: state,
          key: key,
        };
        var updates = {};
        updates['/tasks/' + key] = task_obj;
        firebase.database().ref().update(updates);
      }
    });
  }
}

function taskEdit(unfin_container) {
  let edit_button = unfin_container.querySelectorAll('.task_edit_button');
  for (let i = 0; i < edit_button.length; i++) {
    edit_button[i].addEventListener('click', function (e) {
      e.preventDefault();
      e.currentTarget.style.backgroundColor = '#ffed83';
      e.currentTarget.style.color = '#fff';

      title = e.currentTarget.parentElement.previousSibling.childNodes[1];
      title.setAttribute('contenteditable', true);

      e.currentTarget.classList.add('editing');
      finishEdit(unfin_container);
    });
  }
}
function finishEdit(unfin_container) {
  let editing = unfin_container.querySelectorAll('.editing');
  for (let i = 0; i < editing.length; i++) {
    editing[i].addEventListener('click', function (e) {
      e.currentTarget.classList.remove('editing');
      e.currentTarget.style.backgroundColor = '#fff';
      e.currentTarget.style.color = '#000';
      editedTextNode =
        e.currentTarget.parentElement.previousSibling.childNodes[1];
      editedTextNode.setAttribute('contenteditable', false);
      // Change in firebase
      let key = editedTextNode.parentElement.parentElement.getAttribute(
        'data-key'
      );
      var task_obj = {
        title: editedTextNode.innerText,
        state: false,
        key: key,
      };
      var updates = {};
      updates['/tasks/' + key] = task_obj;
      firebase.database().ref().update(updates);
    });
  }
}

function taskDelete(unfin_container) {
  let edit_button = unfin_container.querySelectorAll('.task_delete_button');
  for (let i = 0; i < edit_button.length; i++) {
    edit_button[i].addEventListener('click', function (e) {
      e.preventDefault();
      key = e.currentTarget.parentElement.parentElement.getAttribute(
        'data-key'
      );
      task_to_remove = firebase.database().ref('/tasks/' + key);
      task_to_remove.remove();

      e.currentTarget.parentElement.parentElement.remove();
    });
  }
}

let stateCheck = setInterval(() => {
  if (document.readyState === 'complete') {
    clearInterval(stateCheck);
    create_unfinished_task();
  }
}, 10);

// let finished = unfin_container.getElementsByClassName('.finished');
//     for (let i = 0; i < finished.length; i++) {
//       console.log(finished[i]);
//       finished[i].removeChild();
//       unfin_container.append(finished[i]);
//     }
