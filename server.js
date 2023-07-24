const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.json());

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/main.js", function (req, res) {
  res.sendFile(path.join(__dirname, "main.js"), { headers: { "Content-Type": "application/javascript" } });
});

app.post("/api/tasks", function (req, res) {
  saveTodoInFile(req.body, function (err) {
    if (err) {
      res.status(500).send("error");
      return;
    }
    res.status(201).json(req.body);
  });
});

app.post("/api/delete-todo", function (req, res) {
  removeTodoFromFile(req.body, function (err) {
    if (err) {
      res.status(500).send("error");
    } else {
      res.status(200).send("success");
    }
  });
});

app.post("/api/edit-todo", function (req, res) {
  editTodo(req.body, function (err) {
    if (err) {
      res.status(500).send("error");
    } else {
      res.status(200).send("success");
    }
  });
});

app.get("/api/todo-data", function (req, res) {
  readAllTodos(function (err, data) {
    if (err) {
      res.status(500).send("error");
      return;
    }
    res.status(200).json(data);
  });
});

app.listen(3000, function () {
  console.log("server on port 3000");
});

function readAllTodos(callback) {
  fs.readFile("./store.json", "utf-8", function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    if (data.length === 0) {
      data = "[]";
    }

    try {
      data = JSON.parse(data);
      callback(null, data);
    } catch (err) {
      callback(err);
    }
  });
}

function saveTodoInFile(todo, callback) {
  readAllTodos(function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    data.push(todo);

    fs.writeFile("./store.json", JSON.stringify(data, null, 2), function (err) {
      if (err) {
        callback(err);
        return;
      }
      callback(null);
    });
  });
}

function editTodo(body, callback) {
  const { filePath, property, value, completed } = body;
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("error reading the file:", err);
      callback(err);
      return;
    }

    try {
      const jsonData = JSON.parse(data);
      const taskToUpdate = jsonData.find((item) => item[property] === value);

      if (taskToUpdate) {
        taskToUpdate.completed = completed;

        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), "utf8", (err) => {
          if (err) {
            console.error("error writing to the file:", err);
            callback(err);
          } else {
            console.log("data updated successfully!");
            callback(null);
          }
        });
      } else {
        console.error("task not found!");
        callback(new Error("task not found!"));
      }
    } catch (parseErr) {
      console.error("error parsing JSON:", parseErr);
      callback(parseErr);
    }
  });
}

function removeTodoFromFile(body, callback) {
  const { filePath, property, value } = body;
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("error reading the file:", err);
      callback(err);
      return;
    }

    try {
      const jsonData = JSON.parse(data);
      const filteredData = jsonData.filter((item) => item[property] !== value);
      const updatedData = JSON.stringify(filteredData, null, 2);

      fs.writeFile(filePath, updatedData, "utf8", (err) => {
        if (err) {
          console.error("error writing to the file:", err);
          callback(err);
        } else {
          console.log(`data with '${property}' equal to '${value}' removed successfully!`);
          callback(null);
        }
      });
    } catch (err) {
      console.error("error parsing JSON data:", err);
      callback(err);
    }
  });
}

