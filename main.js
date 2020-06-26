/*===============================================================
Your web app's Firebase configuration
===============================================================*/
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
const db = firebase.database();

/*===============================================================
GLOBAL STATE
===============================================================*/
let applicationState = {
  listIdCounter: -1,
  todoIdCounter: 0,
};

/*===============================================================
HELPER FUNCTIONS
===============================================================*/
function getNextListId() {
  applicationState.listIdCounter++;
  return applicationState.listIdCounter;
}

function getNextTodoId() {
  applicationState.todoIdCounter++;
  return applicationState.todoIdCounter;
}

/*===============================================================
CLICK HANDLERS
===============================================================*/
function handleAddListClick() {
  // Set up variables
  let listId = getNextListId();

  // Call function to add new list
  addList(listId);
}

function handleAddTodoClick(clickedElement) {
  // Set up variables
  let todoId = getNextTodoId();
  let listId = clickedElement.getAttribute('data-list-id');
  let todoContent = document
    .querySelectorAll(`[data-list-id="${listId}"]`)[0]
    .getElementsByClassName('new-todo-content-input')[0].value;

  // Call function to add new todo
  addTodo(todoId, listId, todoContent);

  // return input to blank
  clickedElement.previousSibling.value = '';
  return false;
}

function handleRemoveListClick(clickedElement) {
  const listId = clickedElement.parentElement.getAttribute('data-list-id');
  removeList(clickedElement, listId);
}

function handleRemoveTodoClick(clickedElement) {
  // Set up variables
  let todoId = clickedElement.getAttribute('data-todo-id');
  let listId = clickedElement.parentElement.parentElement.parentElement.parentElement.getAttribute(
    'data-list-id'
  );
  removeTodo(clickedElement, todoId, listId);
}

/*===============================================================
MAIN FUNCTIONS
===============================================================*/
function addList(listId) {
  // Set up variables
  let listsContainer = document.getElementById('lists-container');
  let listTemplate = document.createElement('div');

  // Template new list
  listTemplate.innerHTML = `<div class="list" data-list-id="${listId}">
      <form><input class="new-todo-content-input" type="text"></input><button onClick="return handleAddTodoClick(this)" data-list-id="${listId}">Add New Todo</button></form>
      <h3 class="title" contenteditable="true">Title</h3>
      <div class="todos-container">
        <!-- Todos will go here -->
      </div>
      <small onclick="handleRemoveListClick(this)">X</small>
    </div>`;

  // Add new list to the DOM within lists container
  // console.log(listId);
  listsContainer.append(listTemplate);
  db.ref('/lists/').set({
    listId,
  });
}

function addTodo(todoId, listId, todoContent) {
  // Set up variables
  let targetList = document.querySelectorAll(
    `div.list[data-list-id="${listId}"]`
  )[0];
  let targetTodosContainer = targetList.getElementsByClassName(
    'todos-container'
  )[0];
  let todoTemplate = document.createElement('div');

  // Template new todo
  todoTemplate.innerHTML = `<div class="todo" data-todo-id="${todoId}">
      <span class="todo-text">${todoContent}</span><button onClick="handleRemoveTodoClick(this)" data-todo-id="${todoId}">Remove</button>
    </div>`;
  // Add new todo to the DOM within target container
  targetTodosContainer.append(todoTemplate);

  // Add todo in Firebase here
  const key = db.ref('/lists/').child(listId).push().key;
  var task = {
    title: todoContent,
    todoList: listId,
    todoId: todoId,
    key: key,
  };

  var updates = {};
  updates[key] = task;
  db.ref('lists/').child(listId).update(updates);

  // Add key to data attribute on task
  todoTemplate.querySelector('span').setAttribute('data-key', key);
}

// Remove list
function removeList(clickedElement, listId) {
  // Remove from Firebase
  console.log(db.ref('/lists/').child(listId));
  task_to_remove = db.ref('/lists/').child(listId);
  task_to_remove.remove();
  // Remove from DOM
  clickedElement.parentElement.remove();
}

function removeTodo(clickedElement, todoId, listId) {
  //Set up variables
  let targetTodo = document.querySelectorAll(
    `div.todo[data-todo-id="${todoId}"]`
  )[0];

  // Remove todo in Firebase here
  const key = clickedElement.previousSibling.getAttribute('data-key');
  task_to_remove = db.ref('/lists/').child(listId).child(key);
  // console.log(task_to_remove);
  task_to_remove.remove();

  // Remove todo from DOM
  targetTodo.remove();
}

// Populate to do list with existing items in database
function loadFromDb() {
  list_array = [];
  db.ref('/lists/').once('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      var childKey = childSnapshot.key;
      var childData = childSnapshot.val();
      list_array.push(Object.values(childData));
    });
    if (list_array != '') {
      for (var i, i = 0; i < list_array.length; i++) {
        // console.log(list_array[0].todoList);
        listId = list_array[i][0].todoList;
        // console.log(listId);
        let listsContainer = document.getElementById('lists-container');
        let listTemplate = document.createElement('div');

        // Template new list
        listTemplate.innerHTML = `<div class="list" id="${listId}" data-list-id="${listId}">
          <form><input class="new-todo-content-input" type="text"></input><button onClick="return handleAddTodoClick(this)" data-list-id="${listId}">Add New Todo</button></form>
          <h3 class="title" contenteditable="true">Title</h3>
          <div class="todos-container">
            
          </div>
          <small onclick="handleRemoveListClick(this)">X</small>
        </div>`;
        listsContainer.append(listTemplate);
        newArray = list_array[i];
        // console.log(list_array[i]);
        // task_array = Object.values(t_array);
        for (var j, j = 0; j < newArray.length; j++) {
          //console.log(task_array[j]);
          const task_array = Object.values(newArray[j]);
          //console.log(task_array);
          const dataKey = task_array[0];
          // console.log(task_array[0]);
          const list = document.getElementById(listId);
          const todoContent = task_array[1];
          const todoId = task_array[2];

          todoContainer = list.querySelectorAll('.todos-container')[0];
          todoFromDb = document.createElement('div');
          // Template new todo
          todoFromDb.innerHTML = `<div class="todo" data-todo-id="${todoId}">
            <span class="todo-text" data-key="${dataKey}">${todoContent}</span><button onClick="handleRemoveTodoClick(this)" data-todo-id="${todoId}">Remove</button>
          </div>`;
          todoContainer.append(todoFromDb);
        }
      }
    }
  });
}

let stateCheck = setInterval(() => {
  if (document.readyState === 'complete') {
    clearInterval(stateCheck);
    loadFromDb();
  }
}, 1);

/* Next steps

* Figure out how to add an editable title to the todo list so I know what it's about
    * Maybe do this by pushing the key when the list is created, and updating the key when the todo is created. Would require a pretty decent refactor but would be worth it.
* Make each todo item editable and save edit on enter/return key.
* Make it so I can mark an item as done.

*/
