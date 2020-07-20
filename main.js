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
CLICK HANDLERS
===============================================================*/
function handleAddTodoClick(clickedElement) {
  // Set up variables
  let listKey = clickedElement.getAttribute('data-list-id');
  let todoContent = document
    .querySelectorAll(`[data-list-id="${listKey}"]`)[0]
    .getElementsByClassName('new-todo-content-input')[0].value;
  let listTitle = clickedElement.parentElement.nextElementSibling.innerHTML;
  // Call function to add new todo
  addTodo(listKey, todoContent, listTitle);
  // return input to blank
  clickedElement.previousSibling.value = '';
  return false;
}

function handleRemoveListClick(clickedElement) {
  const listKey = clickedElement.parentElement.getAttribute('data-list-id');
  removeList(clickedElement, listKey);
}

function handleRemoveTodoClick(clickedElement) {
  // Set up variables
  let todoKey = clickedElement.getAttribute('data-todo-id');
  let listKey = clickedElement.parentElement.parentElement.parentElement.parentElement.getAttribute(
    'data-list-id'
  );
  // console.log(clickedElement.parentElement.parentElement.parentElement);
  removeTodo(clickedElement, todoKey, listKey);
}

/*===============================================================
MAIN FUNCTIONS
===============================================================*/
function addList() {
  // Add list to firebase
  const listKey = db.ref('/lists/').push().key;
  var list = {
    title: 'Title',
    listKey: listKey,
    items: 'items',
  };
  var updates = {};
  updates[listKey] = list;
  // console.log(updates);
  db.ref('lists/').update(updates);

  // Set up variables
  let listsContainer = document.getElementById('lists-container');
  let listTemplate = document.createElement('div');

  // Template new list
  listTemplate.innerHTML = `<div class="list" data-list-id="${listKey}">
      <form><input class="new-todo-content-input" type="text"></input><button data-list-id="${listKey}" onClick="return handleAddTodoClick(this)">Add New Todo</button></form>
      <h3 class="title-edit" onclick="handleEditTitle(this)" contenteditable="true">Title</h3>
      <div class="todos-container">
        <!-- Todos will go here -->
      </div>
      <small onclick="handleRemoveListClick(this)">X</small>
    </div>`;

  // Add new list to the DOM within lists container
  listsContainer.append(listTemplate);
}

function handleEditTitle(clickedElement) {
  clickedElement.addEventListener('keydown', function (e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      // Add new list title to Firebase
      const title = clickedElement.innerHTML;
      const list = clickedElement.parentElement;
      const listKey = list.getAttribute('data-list-id');
      db.ref('lists/').child(listKey).child('title').update(title);
    }
  });
}

function handleTodoEdit(clickedElement) {
  clickedElement.addEventListener('keydown', function (e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      // console.log('pressed');
      // Add new list title to Firebase
      const todoContent = clickedElement.innerHTML;
      const todoKey = clickedElement.getAttribute('data-key');
      const listKey = clickedElement.parentElement.parentElement.parentElement.parentElement.getAttribute(
        'data-list-id'
      );
      const listTitle =
        clickedElement.parentElement.parentElement.parentElement
          .previousElementSibling.textContent;
      var task = {
        title: todoContent,
        todoList: listKey,
        todoKey: todoKey,
        listTitle: listTitle,
      };
      var updates = {};
      updates[todoKey] = task;
      db.ref('lists/').child(listKey).child('items').update(updates);
    }
  });
}

function addTodo(listKey, todoContent, listTitle) {
  // Set up variables
  let targetList = document.querySelectorAll(
    `div.list[data-list-id="${listKey}"]`
  )[0];
  let targetTodosContainer = targetList.getElementsByClassName(
    'todos-container'
  )[0];
  let todoTemplate = document.createElement('div');

  // Add todo in Firebase here
  const todoKey = db.ref('/lists/').child(listKey).child('items').push().key;
  var task = {
    title: todoContent,
    todoList: listKey,
    todoKey: todoKey,
    listTitle: listTitle,
  };

  var updates = {};
  updates[todoKey] = task;
  db.ref('lists/').child(listKey).child('items').update(updates);

  // Template new todo
  todoTemplate.innerHTML = `<div class="todo" data-todo-id="${todoKey}">
      <span class="todo-text" contenteditable="true" onclick="handleTodoEdit(this)">${todoContent}</span><i class="fa fa-check" onclick="taskDone(this)"></i><i class='fa fa-trash' onClick="handleRemoveTodoClick(this)" data-todo-id="${todoKey}"></i>
    </div>`;
  // Add new todo to the DOM within target container
  targetTodosContainer.append(todoTemplate);

  // Add key to data attribute on task
  todoTemplate.querySelector('span').setAttribute('data-key', todoKey);
}

function taskDone(clickedElement) {
  const targetTodosContainer =
    clickedElement.parentElement.parentElement.parentElement;
  const todoElement = clickedElement.parentElement;
  const todo = clickedElement.previousElementSibling;
  todo.classList.toggle('done');
  todo.setAttribute('contentEditable', 'false');
  targetTodosContainer.append(todoElement);
}

// Remove list
function removeList(clickedElement, listKey) {
  // Remove from Firebase
  task_to_remove = db.ref('/lists/').child(listKey);
  task_to_remove.remove();
  // Remove from DOM
  clickedElement.parentElement.remove();
}

function removeTodo(clickedElement, todoKey, listKey) {
  //Set up variables
  let targetTodo = document.querySelectorAll(
    `div.todo[data-todo-id="${todoKey}"]`
  )[0];
  // Remove todo in Firebase here
  // const key = clickedElement.previousSibling.getAttribute('data-key');
  task_to_remove = db.ref('/lists/').child(listKey).child(todoKey);
  // console.log(task_to_remove);
  task_to_remove.remove();

  // Remove todo from DOM
  targetTodo.parentElement.remove();
}

// Populate to do list with existing items in database
function loadFromDb() {
  lists = [];
  db.ref('/lists/').once('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      var childKey = childSnapshot.key;
      var childData = childSnapshot.val();
      lists.push(Object.values(childData));
    });
    for (let i = 0; i < lists.length; i++) {
      const list = lists[i];

      listKey = list[1];
      listTitle = list[2];

      let listsContainer = document.getElementById('lists-container');
      let listTemplate = document.createElement('div');
      // Template new list
      listTemplate.innerHTML = `<div class="list" id="${listKey}" data-list-id="${listKey}"><form><input class="new-todo-content-input" type="text"></input><button onClick="return handleAddTodoClick(this)" data-list-id="${listKey}">Add New Todo</button></form><h3 class="title-edit" onclick="handleEditTitle(this)" contenteditable="true">${listTitle}</h3><div class="todos-container"></div><small onclick="handleRemoveListClick(this)">X</small></div>`;
      listsContainer.append(listTemplate);

      items = [];
      items.push(Object.values(list[0]));
      console.log(items);

      /*
      for (let j = 0; i < items.length; j++) {
        const item = items[j];
        console.log(item);
      }
      */
    }

    /*
      const list = list_array[i];
      //console.log(list_array[i]);
      // console.log(list);
        listKey = list.todoList;
        todoContent = list.title;
        listTitle = list.listTitle;
        todoKey = list.todoKey;

        let listsContainer = document.getElementById('lists-container');
        let listTemplate = document.createElement('div');
        let todoTemplate = document.createElement('div');
        // Template new list
        listTemplate.innerHTML = `<div class="list" id="${listKey}" data-list-id="${listKey}"><form><input class="new-todo-content-input" type="text"></input><button onClick="return handleAddTodoClick(this)" data-list-id="${listKey}">Add New Todo</button></form><h3 class="title-edit" onclick="handleEditTitle(this)" contenteditable="true">${listTitle}</h3><div class="todos-container"></div><small onclick="handleRemoveListClick(this)">X</small></div>`;

        const targetTodosContainer = listTemplate.querySelectorAll(
          '.todos-container'
        )[0];

        todoTemplate.innerHTML = `<div class="todo" data-todo-id="${todoKey}"><span class="todo-text" contenteditable="true" onclick="handleTodoEdit(this)">${todoContent}</span><i class="fa fa-check" onclick="taskDone(this)"></i><i class='fa fa-trash' onClick="handleRemoveTodoClick(this)" data-todo-id="${todoKey}"></i></></div>`;

        targetTodosContainer.append(todoTemplate);
        listsContainer.append(listTemplate);
     
        const listKey = list_array[i][0];
        const listTitle = list_array[i][1];
        let listsContainer = document.getElementById('lists-container');
        let listTemplate = document.createElement('div');
        // Template new list
        listTemplate.innerHTML = `<div class="list" id="${listKey}" data-list-id="${listKey}"><form><input class="new-todo-content-input" type="text"></input><button onClick="return handleAddTodoClick(this)" data-list-id="${listKey}">Add New Todo</button></form><h3 class="title-edit" onclick="handleEditTitle(this)" contenteditable="true">${listTitle}</h3><div class="todos-container"></div><small onclick="handleRemoveListClick(this)">X</small></div>`;
        listsContainer.append(listTemplate);
      
    }*/
  });
}

let stateCheck = setInterval(() => {
  if (document.readyState === 'complete') {
    clearInterval(stateCheck);
    loadFromDb();
  }
}, 1);

/* Next steps
* Make it so I can mark an item as done.
* Edit list title and todo element are both broken

*/
