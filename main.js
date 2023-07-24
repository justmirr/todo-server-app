const addTodoNode = document.getElementById("add");
const userInputNode = document.getElementById("inputTask");
const todoListNode = document.getElementById("tasks");
let todoData = [];

function fetchTodoData() {
  fetch("/api/todo-data")
    .then(function (response) {
      if (response.status === 200) {
        return response.json();
      } else {
        alert("something weird happened");
      }
    })
    .then(function (todos) {
      todoData = todos;
      todoData.forEach(function (todo) {
        showTodoInUI(todo);
      });
    });
}

function updateTodoData(newTodoData) {
  todoData = newTodoData;
}

addTodoNode.addEventListener("click", function () {
  
  const todoText = userInputNode.value;
  userInputNode.value = "";

  if (!todoText) {
    alert("please enter a task!");
    return;
  }

  const todo = {
    todoText,
    completed: false,
  };

  fetch("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  })
    .then(function (response) {
      if (response.status === 201) {
        return response.json();
      } else {
        throw new Error("failed to add task.");
      }
    })
    .then(function (newTask) {
      showTodoInUI(newTask);
    })
    .catch(function (error) {
      console.error("error adding task:", error);
      alert("failed to add task as something went wrong.");
    });
});

function showTodoInUI(todo) {
  const todoNode = document.createElement("div");
  todoNode.className = "todo-item";

  const todoTextNode = document.createElement("p");
  todoTextNode.innerText = "Task: " + todo.todoText;

  if (todo.completed) {
    todoTextNode.style.textDecoration = "line-through";
    todoTextNode.style.color = "grey";
  }

  const checkboxNode = document.createElement("input");
  checkboxNode.type = "checkbox";
  checkboxNode.className = "checkbox";
  checkboxNode.checked = todo.completed;

  const xButtonNode = document.createElement("button");
  xButtonNode.className = "xButton";
  xButtonNode.innerText = "x";
  xButtonNode.dataset.taskText = todo.todoText;

  todoNode.appendChild(todoTextNode);
  todoNode.appendChild(checkboxNode);
  todoNode.appendChild(xButtonNode);
  todoListNode.appendChild(todoNode);

  checkboxNode.addEventListener("change", checkboxChangeHandler);
}

function checkboxChangeHandler(event) {
  const checkbox = event.target;
  const todoTextNode = checkbox.parentNode.querySelector("p");
  const todoText = todoTextNode.innerText.replace("Task: ", "");
  const completed = checkbox.checked;

  fetch(`/api/edit-todo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filePath: "./store.json", property: "todoText", value: todoText, completed }),
  }).then(function (response) {
    if (response.status === 200) {
      todoTextNode.style.textDecoration = completed ? "line-through" : "none";
      todoTextNode.style.color = completed ? "grey" : "black";
      checkbox.disabled = completed;
    }
  }).catch(function (error) {
    console.error("error updating task:", error);
    alert("something weird happened");
  });
}


function deleteTask(taskText) {
  fetch("/api/delete-todo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filePath: "./store.json", property: "todoText", value: taskText }),
  })
    .then(function (response) {
      if (response.status === 200) {
        // Remove the deleted task from the local data
        const updatedData = todoData.filter((task) => task.todoText !== taskText);
        updateTodoData(updatedData);
      } else {
        alert("something weird happened");
      }
    })
    .catch(function (error) {
      console.error("error deleting task:", error);
      alert("something weird happened");
    });
}

todoListNode.addEventListener("click", function (event) {
  if (event.target.classList.contains("xButton")) {
    const taskText = event.target.dataset.taskText;
    deleteTask(taskText);
    event.target.closest(".todo-item").remove();
  }
});

fetchTodoData();
