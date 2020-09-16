function dragStart() {
  this.classList.add('dragging');
}

function dragEnd() {
  this.classList.remove('dragging');
  dragUpdateNr();
}

const listsContainer = document.getElementById('lists-container');
listsContainer.addEventListener('dragover', dragOver);

function dragOver(e) {
  e.preventDefault();
  const afterElement = getDragAfterElement(this, e.clientX);
  const draglist = document.querySelector('.dragging');
  // console.log(afterElement);
  if (afterElement == null) {
    this.appendChild(draglist);
  } else {
    this.insertBefore(draglist, afterElement);
  }
}

function getDragAfterElement(container, x) {
  const draglistElements = [
    ...container.querySelectorAll('.dragList:not(.dragging)'),
  ];
  return draglistElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = x - box.left - box.width / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function dragUpdateNr() {
  let drags = document.querySelectorAll('.dragList');
  for (let i = 0; i < drags.length; i++) {
    let drag = drags[i];
    drag.setAttribute('data-list-order', i);
  }
}
