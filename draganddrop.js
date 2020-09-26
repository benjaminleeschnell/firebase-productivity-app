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
