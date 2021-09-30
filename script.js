const FORM_ID = "form";
const INPUT_TASK_ID = "task";
const PRIORITY_CHECKBOX_ID = "priority";
const DATA_TASK_ID = "data";
const LIST_TO_DO_ID = "list-to-do";
const LIST_DONE = "list-done";
const CLEAR_ALL_BUTTON = "clear-all";

const FORM_ELEMENT_ID = document.getElementById(FORM_ID);
const INPUT_TASK_ELEMENT = document.getElementById(INPUT_TASK_ID);
const PRIORITY_CHECKBOX_ELEMENT = document.getElementById(PRIORITY_CHECKBOX_ID);
const DATA_TASK_ELEMENT = document.getElementById(DATA_TASK_ID);
const LIST_TO_DO_ELEMENT = document.getElementById(LIST_TO_DO_ID);
const LIST_DONE_ELEMENT = document.getElementById(LIST_DONE);
const CLEAR_ALL_BUTTON_ELEMENT = document.getElementById(CLEAR_ALL_BUTTON);

const todayDate = new Date().toISOString().slice(0, 10);
DATA_TASK_ELEMENT.setAttribute("value", todayDate);
DATA_TASK_ELEMENT.setAttribute("min", todayDate);

FORM_ELEMENT_ID.addEventListener("submit", handleOnSubmit);
CLEAR_ALL_BUTTON_ELEMENT.addEventListener("click", handleClearAll);

const { createStore } = Redux;
const { v4 } = uuid;

const actions = Object.freeze({
  ADD_TASK: "ADD_TASK",
  MOVE_TO_DONE_TASK: "MOVE_TO_DONE_TASK",
  DELETE_TASK: "DELETE_TASK",
  CLEAR_TASKS_LIST: "CLEAR_TASKS_LIST",
});

const store = createStore(reducer);
store.subscribe(showTasksToDoList);

function reducer(state = [], action) {
  switch (action.type) {
    case actions.ADD_TASK:
      return [...state, action.payload];
    case actions.DELETE_TASK:
      return state.filter((task) => task.id !== action.payload.id);
    case actions.MOVE_TO_DONE_TASK: {
      const doneElemnt = state.find((task) => task.id === action.payload.id);
      doneElemnt.done = true;
      doneElemnt.data = new Date().toLocaleString();

      return [...state];
    }
    case actions.CLEAR_TASKS_LIST:
      return (state = []);
    default:
      new Error("There is no actions as this sorry!");
  }
}
function addTask({ taskContent, priority, id, data, done }) {
  if (PRIORITY_CHECKBOX_ELEMENT.checked) {
    priority = true;
  } else {
    priority = false;
  }
  return {
    type: actions.ADD_TASK,
    payload: {
      taskContent,
      priority,
      id: v4(),
      data,
      done: false,
    },
  };
}
function deleteTask(id) {
  return {
    type: actions.DELETE_TASK,
    payload: {
      id,
    },
  };
}
function moveToDoneTask(id) {
  return {
    type: actions.MOVE_TO_DONE_TASK,
    payload: {
      id,
    },
  };
}
function clearAll() {
  return {
    type: actions.CLEAR_TASKS_LIST,
  };
}
function handleOnSubmit(e) {
  e.preventDefault();

  const task = {
    taskContent: INPUT_TASK_ELEMENT.value,
    priority: PRIORITY_CHECKBOX_ELEMENT.value,
    data: DATA_TASK_ELEMENT.value,
  };
  if (INPUT_TASK_ELEMENT.value === "") {
    alert("Please, provide your task!");
  } else {
    store.dispatch(addTask(task));
    INPUT_TASK_ELEMENT.value = "";
    PRIORITY_CHECKBOX_ELEMENT.checked = false;
    DATA_TASK_ELEMENT.value = todayDate;
  }
}
function deleteTaskElement(e) {
  const { id } = e.target.dataset;
  store.dispatch(deleteTask(id));
}
function moveToDoneTaskElement(e) {
  const { id } = e.target.dataset;
  store.dispatch(moveToDoneTask(id));
}
function handleClearAll() {
  store.dispatch(clearAll());
}

function showTasksToDoList() {
  while (LIST_TO_DO_ELEMENT.lastElementChild) {
    LIST_TO_DO_ELEMENT.removeChild(LIST_TO_DO_ELEMENT.lastElementChild);
  }
  while (LIST_DONE_ELEMENT.lastElementChild) {
    LIST_DONE_ELEMENT.removeChild(LIST_DONE_ELEMENT.lastElementChild);
  }

  const allTasksElements = store.getState();
  const elements = allTasksElements.map(
    ({ taskContent, id, priority, data, done }) => {
      if (!done) {
        const liElement = document.createElement("li");
        const btnDeleteElement = document.createElement("button");
        const btnDoneElement = document.createElement("button");
        const pTaskElement = document.createElement("p");
        const pDataElement = document.createElement("span");
        btnDeleteElement.addEventListener("click", deleteTaskElement);
        btnDoneElement.addEventListener("click", moveToDoneTaskElement);
        btnDoneElement.textContent = "done";
        btnDeleteElement.dataset.id = id;
        btnDoneElement.dataset.id = id;
        liElement.dataset.done = done;
        btnDeleteElement.textContent = "X";
        pTaskElement.textContent = `${taskContent}`;
        pDataElement.textContent = `Should be done by ${data}`;
        priority ? (pTaskElement.style.color = "red") : null;
        liElement.append(pTaskElement);
        liElement.append(pDataElement);
        liElement.append(btnDoneElement);
        liElement.append(btnDeleteElement);

        return liElement;
      } else {
        const liElement = document.createElement("li");
        const btnDeleteElement = document.createElement("button");
        const pTaskElement = document.createElement("p");
        const pDataElement = document.createElement("span");
        btnDeleteElement.addEventListener("click", deleteTaskElement);
        liElement.dataset.done = done;
        btnDeleteElement.dataset.id = id;
        btnDeleteElement.textContent = "X";
        pTaskElement.textContent = `${taskContent}`;
        pDataElement.textContent = `task done at: ${data}`;
        liElement.append(pTaskElement);
        liElement.append(pDataElement);
        liElement.append(btnDeleteElement);

        return liElement;
      }
    }
  );

  const elementsToDo = elements.filter(
    (element) => element.getAttribute("data-done") === "false"
  );
  LIST_TO_DO_ELEMENT.append(...elementsToDo);

  const elementsDone = elements.filter(
    (element) => element.getAttribute("data-done") === "true"
  );
  elementsDone.reverse();
  LIST_DONE_ELEMENT.append(...elementsDone);
}
