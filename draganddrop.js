// Lists Drag Code
function dragStart() {
  this.classList.add('dragging');
  this.parentElement.addEventListener('dragover', dragOver);
}

function dragEnd() {
  this.classList.remove('dragging');
  dragUpdateNr();
}

function dragOver(e) {
  e.preventDefault();
  const afterElement = getDragAfterElement(this, e);
  const draggable = document.querySelector('.dragging');
  if (afterElement == null) {
    this.appendChild(draggable);
  } else {
    this.insertBefore(draggable, afterElement);
  }
}

function getDragAfterElement(container, event) {
  const draggableElements = [
    ...container.querySelectorAll('.dragList:not(.dragging)'),
  ];

  const elementsWithinRow = draggableElements.filter((element) => {
    const elementBounds = element.getBoundingClientRect();
    const y = event.clientY;
    return elementBounds.top < y && y < elementBounds.bottom ? true : false;
  });

  // If drop is on left side of element, return element itself
  // If drop is on right side of element, return next element

  const elementBeingDroppedOn = elementsWithinRow.find((element) => {
    const elementBounds = element.getBoundingClientRect();
    const x = event.clientX;
    return elementBounds.left < x && x < elementBounds.right ? true : false;
  });

  const elementCenter =
    (elementBeingDroppedOn.getBoundingClientRect().left +
      elementBeingDroppedOn.getBoundingClientRect().right) /
    2;

  if (event.clientX < elementCenter) return elementBeingDroppedOn;
  if (event.clientX > elementCenter)
    return elementBeingDroppedOn.nextElementSibling;
}

function dragUpdateNr() {
  let drags = document.querySelectorAll('.dragList');
  for (let i = 0; i < drags.length; i++) {
    let drag = drags[i];
    drag.setAttribute('data-list-order', i);

    //update firebase
    setTimeout(() => {
      let listKey = drags[i].firstElementChild.getAttribute('data-list-id');
      let listnumber = drags[i].getAttribute('data-list-order');
      db.ref('lists/').child(listKey).child('listnumber').set(listnumber);
    }, 0);
  }
}

// Todo Drag Code
function todoDragStart(e) {
  e.stopPropagation();
  this.classList.add('dragging');
  this.parentElement.addEventListener('dragover', todoDragOver);
}

function todoDragEnd() {
  this.classList.remove('dragging');
  todoDragUpdateNr();
}

function todoDragOver(e) {
  e.preventDefault();
  const afterElement = todoGetDragAfterElement(this, e);
  const draggable = document.querySelector('.dragging');
  if (afterElement == null) {
    this.appendChild(draggable);
  } else {
    this.insertBefore(draggable, afterElement);
  }
}

function todoGetDragAfterElement(container, event) {
  const draggableElements = [
    ...container.querySelectorAll('.dragTodo:not(.dragging)'),
  ];

  // If drop is on left side of element, return element itself
  // If drop is on right side of element, return next element

  const elementBeingDroppedOn = draggableElements.find((element) => {
    const elementBounds = element.getBoundingClientRect();
    const x = event.clientY;
    return elementBounds.top < x && x < elementBounds.bottom ? true : false;
  });

  const elementCenter =
    (elementBeingDroppedOn.getBoundingClientRect().top +
      elementBeingDroppedOn.getBoundingClientRect().bottom) /
    2;

  if (event.clientY < elementCenter) return elementBeingDroppedOn;
  if (event.clientY > elementCenter)
    return elementBeingDroppedOn.nextElementSibling;
}

function todoDragUpdateNr() {
  let drags = document.querySelectorAll('.dragTodo');
  for (let i = 0; i < drags.length; i++) {
    let drag = drags[i];
    drag.setAttribute('data-todo-order', i);

    //update firebase
    setTimeout(() => {
      let listKey = drags[i].parentElement.parentElement.getAttribute(
        'data-list-id'
      );
      let todokey = drags[i].firstElementChild.getAttribute('data-todo-id');
      // item todo order
      let todoOrderNumber = drags[i].getAttribute('data-todo-order');
      db.ref('lists/')
        .child(listKey)
        .child('items')
        .child(todokey)
        .child('todoOrderNumber')
        .set(todoOrderNumber);
    }, 0);
  }
}
