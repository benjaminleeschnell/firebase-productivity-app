function dragTheList(draggedElement) {
  const draglists = document.querySelectorAll('.draglist');

  draglists.forEach((draglist) => {
    draglist.addEventListener('dragstart', () => {
      draglist.classList.add('dragging');
    });

    draggedElement.addEventListener('dragend', () => {
      draglist.classList.remove('dragging');
      //dragUpdateNr();
    });
  });
}

const listsContainer = document.getElementById('lists-container');
listsContainer.addEventListener('dragover', dragOver);

function dragOver(e) {
  e.preventDefault();
  const afterElement = getDragAfterElement(this, e.clientY);
  const draglist = document.querySelector('.dragging');
  console.log(draglist);
  if (afterElement == null) {
    this.appendChild(draglist);
  } else {
    // this.insertBefore(draglist, afterElement);
  }
}

function getDragAfterElement(listsContainer, y) {
  const draglistElements = [
    ...listsContainer.querySelectorAll('.draglist:not(.dragging)'),
  ];

  return draglistElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}
