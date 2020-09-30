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
  let todoOrderNumber = getNextTodoId();
  let listKey = clickedElement.getAttribute('data-list-id');
  let todoContent = document
    .querySelectorAll(`[data-list-id="${listKey}"]`)[0]
    .getElementsByClassName('new-todo-content-input')[0].value;
  //  let listTitle = clickedElement.parentElement.nextElementSibling.innerHTML;
  // Call function to add new todo
  addTodo(listKey, todoContent, todoOrderNumber);
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
  let parent = listTemplate.parentNode;
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
  listsContainer.prepend(listTemplate);
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

function addTodo(listKey, todoContent, todoOrderNumber) {
  // Set up variables
  let targetList = document.querySelectorAll(
    `div.list[data-list-id="${listKey}"]`
  )[0];
  let targetTodosContainer = targetList.getElementsByClassName(
    'todos-container'
  )[0];
  let todoTemplate = document.createElement('div');
  todoTemplate.setAttribute('data-todo-order', todoOrderNumber);
  todoTemplate.setAttribute('draggable', 'true');
  todoTemplate.setAttribute('class', 'dragTodo');
  todoTemplate.addEventListener('dragstart', todoDragStart);
  todoTemplate.addEventListener('dragend', todoDragEnd);

  // Add todo in Firebase here
  const todoKey = db.ref('/lists/').child(listKey).child('items').push().key;
  var task = {
    title: todoContent,
    todoList: listKey,
    todoKey: todoKey,
    done: false,
    todoOrderNumber: todoOrderNumber,
  };

  var updates = {};
  updates[todoKey] = task;
  db.ref('lists/').child(listKey).child('items').update(updates);

  // Template new todo
  todoTemplate.innerHTML = `<div class="todo" data-todo-id="${todoKey}">
      <span class="fa fa-circle"></span><input class="completed" onclick="taskDone(this)" type="checkbox"><span class="todo-text" contenteditable="true" onclick="handleTodoEdit(this)">${todoContent}</span><span class="enterToSave">Type enter to save</span><i class='fa fa-trash' onClick="handleRemoveTodoClick(this)" data-todo-id="${todoKey}"></i>
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
        lists.push(childData);
      });
      for (let i = 0; i < lists.length; i++) {
        const list = lists[i];
        let listsContainer = document.getElementById('lists-container');
        if (list.type === 'list') {
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
              todoOrderNumber = item.todoOrderNumber;

              let todoTemplate = document.createElement('div');
              todoTemplate.setAttribute('data-todo-order', todoOrderNumber);
              todoTemplate.setAttribute('draggable', 'true');
              todoTemplate.setAttribute('class', 'dragTodo');
              todoTemplate.addEventListener('dragstart', todoDragStart);
              todoTemplate.addEventListener('dragend', todoDragEnd);

              const getList = document.getElementById(listKey);
              const targetTodosContainer = getList.querySelectorAll(
                '.todos-container'
              )[0];

              if (state === true) {
                todoTemplate.innerHTML = `<div class="todo" data-todo-id="${todoKey}"><span class="fa fa-circle"></span><input class="completed" onclick="taskDone(this)" type="checkbox" checked><span class="todo-text ${state}" contenteditable="true" onclick="handleTodoEdit(this)">${todoContent}</span><span class="enterToSave">Type enter to save</span><i class='fa fa-trash' onClick="handleRemoveTodoClick(this)" data-todo-id="${todoKey}"></i></></div>`;
              } else if (state === false) {
                todoTemplate.innerHTML = `<div class="todo" data-todo-id="${todoKey}"><span class="fa fa-circle"></span><input class="completed" onclick="taskDone(this)" type="checkbox"><span class="todo-text ${state}" contenteditable="true" onclick="handleTodoEdit(this)">${todoContent}</span><span class="enterToSave">Type enter to save</span><i class='fa fa-trash' onClick="handleRemoveTodoClick(this)" data-todo-id="${todoKey}"></i></></div>`;
              }
              targetTodosContainer.append(todoTemplate);
              setTimeout(function afterTwoSeconds() {
                moveDoneLast(todoTemplate);
              }, 1000);
            });
          }
        } else if (list.type === 'kanban') {
          let kanbanTemplate = document.createElement('div');
          // kanbanTemplate.setAttribute('data-list-order', list.listnumber);
          kanbanTemplate.setAttribute('draggable', true);
          // kanbanTemplate.setAttribute('class', 'dragKanban');
          // kanbanTemplate.addEventListener('dragstart', kanDragStart);
          // kanbanTemplate.addEventListener('dragend', kanDragEnd);
          // Template new kanban
          kanbanTemplate.setAttribute('class', 'kanban');
          kanbanTemplate.setAttribute('id', list.kbKey);
          kanbanTemplate.innerHTML = `<div data-kbKey="${list.kbKey}" class="kheader"><h3 onclick="handleEditKanbanTitle(this)" contenteditable="true">${list.title}</h3><span class="enterToSave">Type enter to save</span></div><div onclick="addColumn(this)" class="addColumn">+</div><div class="kfooter"><div onclick="removeKanban(this)" class="kanbanclose">X</div></div>`;
          listsContainer.append(kanbanTemplate);

          columns = [];
          if (list.columns) {
            // add columns here
            const columns = Object.values(list.columns);
            columns.forEach(function (column) {
              colKey = column.colKey;
              kbKey = column.kbKey;
              colTitle = column.colTitle;
              //todoOrderNumber = column.todoOrderNumber;

              const targetKanban = document.getElementById(kbKey);

              const kcolumn = document.createElement('div');
              kcolumn.setAttribute('class', 'kcolumn');
              kcolumn.setAttribute('data-colKey', colKey);
              kcolumn.innerHTML = `<div onclick="handleEditKColumnTitle(this)" contenteditable="true" class="kcolumntitle">${colTitle}</div><span class="enterToSave">Type enter to save</span><div onclick="addKItem(this)" class="addkitem">+</div><div onclick="removeKColumn(this)" class="deleteColumn">X</div></div>`;
              const addColumn = targetKanban.querySelectorAll('.addColumn')[0];
              targetKanban.insertBefore(kcolumn, addColumn);

              kitems = [];
              if (column.items) {
                const items = Object.values(column.items);
                items.forEach(function (item) {
                  itemKey = item.itemKey;
                  taskText = item.taskText;
                  const kitem = document.createElement('div');
                  const addKitem = kcolumn.querySelectorAll('.addkitem')[0];
                  kitem.setAttribute('class', 'kitem');
                  kitem.setAttribute('data-itemKey', itemKey);
                  kitem.innerHTML = `<span class="fa fa-circle"></span>
                  <span onclick="handleEditKItem(this)" contenteditable="true" class="task">${taskText}</span><span class="enterToSave">Type enter to save</span>
                  <span onclick="removeKItem(this)" class="fa fa-trash"></span>`;

                  kcolumn.insertBefore(kitem, addKitem);
                });
              }
            });
          }
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
  kanbanTemplate.innerHTML = `<div data-kbKey="${kbKey}" class="kheader"><h3 onclick="handleEditKanbanTitle(this)" contenteditable="true">Kanban Title</h3><span class="enterToSave">Type enter to save</span></div><div onclick="addColumn(this)" class="addColumn">+</div><div class="kfooter"><div onclick="removeKanban(this)" class="kanbanclose">X</div></div>`;

  listsContainer.prepend(kanbanTemplate);
}

function addColumn(clickedElement) {
  const kb = clickedElement.parentElement;
  let kbKey = kb.querySelectorAll(`div.kheader`)[0].getAttribute('data-kbKey');
  const colKey = db.ref('/lists/').child(kbKey).child('columns').push().key;

  var col = {
    kbKey: kbKey,
    colKey: colKey,
    colTitle: 'Column Title',
    items: [],
  };

  var updates = {};
  updates[colKey] = col;
  db.ref('lists/').child(kbKey).child('columns').update(updates);

  const kcolumn = document.createElement('div');
  kcolumn.setAttribute('class', 'kcolumn');
  kcolumn.setAttribute('data-colKey', colKey);
  kcolumn.innerHTML = `<div onclick="handleEditKColumnTitle(this)" contenteditable="true" class="kcolumntitle">Column Title</div><span class="enterToSave">Type enter to save</span><div onclick="addKItem(this)" class="addkitem">+</div><div onclick="removeKColumn(this)" class="deleteColumn">X</div></div>`;

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
  <span onclick="handleEditKItem(this)" contenteditable="true" class="task">Task</span><span class="enterToSave">Type enter to save</span>
  <span onclick="removeKItem(this)" class="fa fa-trash"></span>`;

  kcolumn.insertBefore(kitem, clickedElement);
}

function handleEditKanbanTitle(clickedElement) {
  const alert = clickedElement.nextElementSibling;
  alert.className = 'enterToSave show';
  clickedElement.addEventListener('keydown', function (e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      // Add new list title to Firebase
      const title = clickedElement.innerHTML;
      const kanban = clickedElement.parentElement;
      const kbKey = kanban.getAttribute('data-kbkey');
      db.ref('lists/').child(kbKey).child('title').set(title);
      clickedElement.blur();
      alert.className = 'enterToSave hide';
    }
  });
}

function handleEditKColumnTitle(clickedElement) {
  const alert = clickedElement.nextElementSibling;
  alert.className = 'enterToSave show';
  clickedElement.addEventListener('keydown', function (e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      // Add new list title to Firebase
      const colTitle = clickedElement.innerHTML;
      const kanban = clickedElement.parentElement.previousElementSibling;
      const kbKey = kanban.getAttribute('data-kbkey');
      const colKey = clickedElement.parentElement.getAttribute('data-colkey');
      db.ref('lists/')
        .child(kbKey)
        .child('columns')
        .child(colKey)
        .child('colTitle')
        .set(colTitle);
      clickedElement.blur();
      alert.className = 'enterToSave hide';
    }
  });
}

function removeKanban(clickedElement) {
  const kbkey = clickedElement.parentElement.parentElement.firstElementChild.getAttribute(
    'data-kbkey'
  );
  // Remove from Firebase
  task_to_remove = db.ref('/lists/').child(kbkey);
  task_to_remove.remove();
  clickedElement.parentElement.parentElement.remove();
}

function handleEditKItem(clickedElement) {
  const alert = clickedElement.nextElementSibling;
  alert.className = 'enterToSave show';
  clickedElement.addEventListener('keydown', function (e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      // Add new list title to Firebase
      const taskText = clickedElement.innerHTML;
      const kanban =
        clickedElement.parentElement.parentElement.previousElementSibling;
      const kbKey = kanban.getAttribute('data-kbkey');
      const colKey = clickedElement.parentElement.parentElement.getAttribute(
        'data-colkey'
      );
      const itemkey = clickedElement.parentElement.getAttribute('data-itemkey');
      db.ref('lists/')
        .child(kbKey)
        .child('columns')
        .child(colKey)
        .child('items')
        .child('itemkey')
        .child('taskText')
        .set(taskText);
      clickedElement.blur();
      alert.className = 'enterToSave hide';
    }
  });
}

function removeKItem(clickedElement) {
  const kbkey = clickedElement.parentElement.parentElement.previousElementSibling.getAttribute(
    'data-kbkey'
  );
  const colkey = clickedElement.parentElement.parentElement.getAttribute(
    'data-colkey'
  );
  const itemkey = clickedElement.parentElement.getAttribute('data-itemkey');
  // Remove from Firebase
  task_to_remove = db
    .ref('/lists/')
    .child(kbkey)
    .child('columns')
    .child(colkey)
    .child('items')
    .child(itemkey);
  task_to_remove.remove();
  clickedElement.parentElement.remove();
}

function removeKColumn(clickedElement) {
  const kbkey = clickedElement.parentElement.parentElement.firstElementChild.getAttribute(
    'data-kbkey'
  );
  console.log(kbkey);
  const colkey = clickedElement.parentElement.getAttribute('data-colkey');
  // Remove from Firebase
  task_to_remove = db
    .ref('/lists/')
    .child(kbkey)
    .child('columns')
    .child(colkey);
  task_to_remove.remove();
  clickedElement.parentElement.remove();
}

let stateCheck = setInterval(() => {
  if (document.readyState === 'complete') {
    clearInterval(stateCheck);
    loadFromDb();
  }
}, 1);

/* 

Next 
Make Lists drag and droppable
* Make todo items drag and droppable
    * Figure out FE solution for ordering by todoOrderNumber => ask daniel

* Make the kanban tasks have a data-order attribute so I can orderby number when pulling from the database
    * Add numbers to data attribute of the kanban tasks
    * Add drag and drop functionality to tasks
    * Save task number to database
    * Populate tasks in order from database

* Remove kanbans from database when appropriate X is clicked

* Later (notes)
    * Alert to ask if you're sure you want to delete lists, kanban columns. Frustrating to accidentally delete with one click
*/
