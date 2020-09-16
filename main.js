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
  listNumberCounter: -1,
  todoNumberCounter: -1,
};

/*===============================================================
HELPER FUNCTIONS
===============================================================*/
function getNextListId() {
  applicationState.listNumberCounter++;
  return applicationState.listNumberCounter;
}

function getNextTodoId() {
  applicationState.todoNumberCounter++;
  return applicationState.todoNumberCounter;
}

/*===============================================================
CLICK HANDLERS
===============================================================*/
function handleAddListClick() {
  // Set up variables
  let listOrderNumber = getNextListId();

  // Call function to add new list
  addList(listOrderNumber);
}

function handleAddTodoClick(clickedElement) {
  // Set up variables
  let listKey = clickedElement.getAttribute('data-list-id');
  let todoContent = document
    .querySelectorAll(`[data-list-id="${listKey}"]`)[0]
    .getElementsByClassName('new-todo-content-input')[0].value;
  //  let listTitle = clickedElement.parentElement.nextElementSibling.innerHTML;
  // Call function to add new todo
  addTodo(listKey, todoContent);
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
  removeTodo(clickedElement, todoKey, listKey);
}

/*===============================================================
TODO MAIN FUNCTIONS
===============================================================*/
function addList(listOrderNumber) {
  // Add list to firebase
  const listKey = db.ref('/lists/').push().key;
  var list = {
    title: 'Title',
    listKey: listKey,
    items: [],
    type: 'list',
    listnumber: listOrderNumber,
  };
  var updates = {};
  updates[listKey] = list;
  db.ref('lists/').update(updates);

  // Set up variables
  let listsContainer = document.getElementById('lists-container');
  let listTemplate = document.createElement('div');
  listTemplate.setAttribute('data-list-order', listOrderNumber);
  listTemplate.setAttribute('draggable', true);
  listTemplate.setAttribute('class', 'dragList');
  listTemplate.addEventListener('dragstart', dragStart);
  listTemplate.addEventListener('dragend', dragEnd);

  // Template new list
  listTemplate.innerHTML = `<div class="list" data-list-id="${listKey}">
      <form><input class="new-todo-content-input" type="text"></input><button data-list-id="${listKey}" onClick="return handleAddTodoClick(this)">Add New Todo</button></form>
      <h3 class="title-edit" onclick="handleEditTitle(this)" contenteditable="true">Title</h3><span class="enterToSave">Type enter to save</span>
      <div class="todos-container">
        <!-- Todos will go here -->
      </div>
      <small onclick="handleRemoveListClick(this)">X</small>
    </div>`;

  // Add new list to the DOM within lists container
  listsContainer.append(listTemplate);
}

function handleEditTitle(clickedElement) {
  const alert = clickedElement.nextElementSibling;
  alert.className = 'enterToSave show';
  clickedElement.addEventListener('keydown', function (e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      // Add new list title to Firebase
      const title = clickedElement.innerHTML;
      const list = clickedElement.parentElement;
      const listKey = list.getAttribute('data-list-id');
      db.ref('lists/').child(listKey).child('title').set(title);
      clickedElement.blur();
      alert.className = 'enterToSave hide';
    }
  });
}

function handleTodoEdit(clickedElement) {
  const alert = clickedElement.nextElementSibling;
  alert.className = 'enterToSave show';
  clickedElement.addEventListener('keydown', function (e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      // Add new list title to Firebase
      const todoContent = clickedElement.innerHTML;
      const todoKey = clickedElement.parentElement.getAttribute('data-todo-id');
      const listKey = clickedElement.parentElement.parentElement.parentElement.parentElement.getAttribute(
        'data-list-id'
      );

      db.ref('lists/')
        .child(listKey)
        .child('items')
        .child(todoKey)
        .child('title')
        .set(todoContent);

      clickedElement.blur();
      alert.className = 'enterToSave hide';
    }
  });
}

function addTodo(listKey, todoContent) {
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
    done: false,
  };

  var updates = {};
  updates[todoKey] = task;
  db.ref('lists/').child(listKey).child('items').update(updates);

  // Template new todo
  todoTemplate.innerHTML = `<div class="todo" data-todo-id="${todoKey}">
      <input class="completed" onclick="taskDone(this)" type="checkbox"><span class="todo-text" contenteditable="true" onclick="handleTodoEdit(this)">${todoContent}</span><span class="enterToSave">Type enter to save</span><i class='fa fa-trash' onClick="handleRemoveTodoClick(this)" data-todo-id="${todoKey}"></i>
    </div>`;
  // Add new todo to the DOM within target container
  targetTodosContainer.append(todoTemplate);

  // Add key to data attribute on task
  todoTemplate.querySelector('span').setAttribute('data-key', todoKey);
}

function taskDone(clickedElement) {
  const listKey = clickedElement.parentElement.parentElement.parentElement.parentElement.getAttribute(
    'data-list-id'
  );
  const todoKey = clickedElement.parentElement.getAttribute('data-todo-id');

  const checkbox = clickedElement;
  const targetTodosContainer =
    checkbox.parentElement.parentElement.parentElement;
  const todoElement = checkbox.parentElement.parentElement;
  const todo = checkbox.nextSibling;
  if (checkbox.checked === true) {
    todo.className = 'todo-text true';
    todo.setAttribute('contentEditable', 'false');
    targetTodosContainer.append(todoElement);
    const state = true;

    db.ref('lists/')
      .child(listKey)
      .child('items')
      .child(todoKey)
      .child('done')
      .set(state);
  } else if (checkbox.checked === false) {
    todo.className = 'todo-text false';
    todo.setAttribute('contentEditable', 'true');
    targetTodosContainer.prepend(todoElement);
    const state = false;

    db.ref('lists/')
      .child(listKey)
      .child('items')
      .child(todoKey)
      .child('done')
      .set(state);
  }
}

function moveDoneLast(todoTemplate) {
  const todo = todoTemplate.getElementsByClassName('true');
  for (let i = 0; i < todo.length; i++) {
    const doneItem = todo[i].parentElement.parentElement;
    todoTemplate.parentElement.appendChild(doneItem);
  }
}

// Remove list
function removeList(clickedElement, listKey) {
  // Remove from Firebase
  task_to_remove = db.ref('/lists/').child(listKey);
  task_to_remove.remove();
  // Remove from DOM
  clickedElement.parentElement.parentElement.remove();
}

function removeTodo(clickedElement, todoKey, listKey) {
  //Set up variables
  let targetTodo = document.querySelectorAll(
    `div.todo[data-todo-id="${todoKey}"]`
  )[0];
  // Remove todo in Firebase here
  task_to_remove = db
    .ref('/lists/')
    .child(listKey)
    .child('items')
    .child(todoKey);
  task_to_remove.remove();

  // Remove todo from DOM
  targetTodo.parentElement.remove();
}

// Populate to do list with existing items in database
function loadFromDb() {
  lists = [];
  db.ref('/lists/')
    .orderByChild('listnumber')
    .once('value', function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        console.log(childData);
        lists.push(childData);
      });
      for (let i = 0; i < lists.length; i++) {
        const list = lists[i];
        if (list.type === 'list') {
          let listsContainer = document.getElementById('lists-container');
          let listTemplate = document.createElement('div');
          listTemplate.setAttribute('data-list-order', list.listnumber);
          listTemplate.setAttribute('draggable', true);
          listTemplate.setAttribute('class', 'dragList');
          listTemplate.addEventListener('dragstart', dragStart);
          listTemplate.addEventListener('dragend', dragEnd);
          // Template new list
          listTemplate.innerHTML = `<div class="list" id="${list.listKey}" data-list-id="${list.listKey}"><form><input class="new-todo-content-input" type="text"></input><button onClick="return handleAddTodoClick(this)" data-list-id="${list.listKey}">Add New Todo</button></form><h3 class="title-edit" onclick="handleEditTitle(this)" contenteditable="true">${list.title}</h3><span class="enterToSave">Type enter to save</span><div class="todos-container"></div><small onclick="handleRemoveListClick(this)">X</small></div>`;
          listsContainer.append(listTemplate);

          items = [];
          if (list.items) {
            const items = Object.values(list.items);
            items.forEach(function (item) {
              listKey = item.todoList;
              todoContent = item.title;
              todoKey = item.todoKey;
              state = item.done;

              let todoTemplate = document.createElement('div');
              const getList = document.getElementById(listKey);
              const targetTodosContainer = getList.querySelectorAll(
                '.todos-container'
              )[0];

              if (state === true) {
                todoTemplate.innerHTML = `<div class="todo" data-todo-id="${todoKey}"><input class="completed" onclick="taskDone(this)" type="checkbox" checked><span class="todo-text ${state}" contenteditable="true" onclick="handleTodoEdit(this)">${todoContent}</span><span class="enterToSave">Type enter to save</span><i class='fa fa-trash' onClick="handleRemoveTodoClick(this)" data-todo-id="${todoKey}"></i></></div>`;
              } else if (state === false) {
                todoTemplate.innerHTML = `<div class="todo" data-todo-id="${todoKey}"><input class="completed" onclick="taskDone(this)" type="checkbox"><span class="todo-text ${state}" contenteditable="true" onclick="handleTodoEdit(this)">${todoContent}</span><span class="enterToSave">Type enter to save</span><i class='fa fa-trash' onClick="handleRemoveTodoClick(this)" data-todo-id="${todoKey}"></i></></div>`;
              }
              targetTodosContainer.append(todoTemplate);
              setTimeout(function afterTwoSeconds() {
                moveDoneLast(todoTemplate);
              }, 1000);
            });
          }
        } else if (list.type === 'kanban') {
          // console.log('you have kanban');
        }
      }
    });
}

/*===============================================================
---------------------
KANBAN MAIN FUNCTIONS
---------------------
===============================================================*/

function addKanban() {
  // Add list to firebase
  const kbKey = db.ref('/lists/').push().key;
  var kb = {
    title: 'Title',
    kbKey: kbKey,
    columns: [],
    type: 'kanban',
  };
  var updates = {};
  updates[kbKey] = kb;
  db.ref('lists/').update(updates);

  let listsContainer = document.getElementById('lists-container');
  let kanbanTemplate = document.createElement('div');
  kanbanTemplate.setAttribute('class', 'kanban');
  kanbanTemplate.innerHTML = `<div onclick="handleEditKanbanTitle(this)" data-kbKey="${kbKey}" class="kheader"><h3>Kanban Title</h3></div><div onclick="addColumn(this)" class="addColumn">+</div><div class="kfooter"><div onclick="removeKanban(this)" class="kanbanclose">X</div></div>`;

  listsContainer.append(kanbanTemplate);
}

function addColumn(clickedElement) {
  const kb = clickedElement.parentElement;
  let kbKey = kb.querySelectorAll(`div.kheader`)[0].getAttribute('data-kbKey');
  const colKey = db.ref('/lists/').child(kbKey).child('columns').push().key;

  var col = {
    kbKey: kbKey,
    colKey: colKey,
    items: [],
  };

  var updates = {};
  updates[colKey] = col;
  db.ref('lists/').child(kbKey).child('columns').update(updates);

  const kcolumn = document.createElement('div');
  kcolumn.setAttribute('class', 'kcolumn');
  kcolumn.setAttribute('data-colKey', colKey);
  kcolumn.innerHTML = `<div onclick="handleEditKColumnTitle(this)" class="kcolumntitle">Column Title</div><div onclick="addKItem(this)" class="addkitem">+</div><div onclick="removeKColumn(this)" class="deleteColumn">X</div></div>`;

  kb.insertBefore(kcolumn, clickedElement);
}

function addKItem(clickedElement) {
  const kb = clickedElement.parentElement.parentElement;
  const kcolumn = clickedElement.parentElement;
  let kbKey = kb.querySelectorAll(`div.kheader`)[0].getAttribute('data-kbkey');
  let colKey = clickedElement.parentElement.getAttribute('data-colkey');
  const itemKey = db
    .ref('/lists/')
    .child(kbKey)
    .child(colKey)
    .child('items')
    .push().key;

  var item = {
    kbKey: kbKey,
    colKey: colKey,
    itemKey: itemKey,
    taskText: 'task',
  };

  var updates = {};
  updates[itemKey] = item;
  db.ref('lists/')
    .child(kbKey)
    .child('columns')
    .child(colKey)
    .child('items')
    .update(updates);

  const kitem = document.createElement('div');
  kitem.setAttribute('class', 'kitem');
  kitem.setAttribute('data-itemKey', itemKey);
  kitem.innerHTML = `<span class="fa fa-circle"></span>
  <span onclick="handleEditKItem(this)" class="task">Task</span>
  <span onclick="removeKItem(this)" class="fa fa-trash"></span>`;

  kcolumn.insertBefore(kitem, clickedElement);
}

function handleEditKanbanTitle(clickedElement) {
  console.log(clickedElement);
}

function handleEditKColumnTitle(clickedElement) {
  console.log(clickedElement);
}

function removeKanban(clickedElement) {
  clickedElement.parentElement.parentElement.remove();
}

function handleEditKItem(clickedElement) {
  console.log(clickedElement);
}

function removeKItem(clickedElement) {
  console.log(clickedElement);
}

function removeKColumn(clickedElement) {
  console.log(clickedElement);
}

let stateCheck = setInterval(() => {
  if (document.readyState === 'complete') {
    clearInterval(stateCheck);
    loadFromDb();
  }
}, 1);

/* 

Next
* Make Lists drag and droppable
    * Populate lists in order from database
        * Think through where in the code this should happen, ask Daniel if necessary.  

* Make the kanban tasks have a data-order attribute so I can orderby number when pulling from the database
    * Add numbers to data attribute of the kanban tasks
    * Add drag and drop functionality to tasks
    * Save task number to database
    * Populate tasks in order from database

* Remove kanbans from database when appropriate X is clicked

* Later (notes)
    * Alert to ask if you're sure you want to delete lists, kanban columns. Frustrating to accidentally delete with one click
*/
