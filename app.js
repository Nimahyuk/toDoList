/* Importando las bibliotecas que necesitamos usar en nuestro proyecto. */
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const port = 3000;

/* Conexión a la base de datos. */
mongoose.set("strictQuery", true);
mongoose.connect("mongodb://127.0.0.1:27017/todolistTAREA");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

const today = new Date();

/* Creación de un nuevo esquema para la tarea. */
const taskSchema = new mongoose.Schema({
  name: String,
});

/* Creación de un nuevo esquema para taskWork. */
const taskWorkSchema = new mongoose.Schema({
  name: String,
});

/* Creación de un nuevo modelo para taskWork y task. */
const TaskWork = mongoose.model("taskWork", taskWorkSchema);
const Task = mongoose.model("task", taskSchema);

/* Obtener la fecha y la hora. */
var date1 = new Date();
var hora = date1.getHours();
var min = date1.getMinutes();

/* Crear un nuevo esquema para la lista y luego crear un modelo para la lista. */
const listSchema = new mongoose.Schema({
  name: String,
  items: [taskSchema],
});
const List = mongoose.model("list", listSchema);

/* Una función que se llama cuando el usuario va a la raíz del sitio web. */
app.get("/", (req, res) => {
  Task.find((error, tasks) => {
    if (!error) {
      const listas = List.find({}, (err, items) => {
        res.render("index", {
          tasks: tasks,
          title: "Home",
          buttonValue: "general",
          hora: hora,
          min: min,
          listas: items,
        });
      });
    }
  });
});

/* Controlador de la ruta work. */
app.get("/work", function (req, res) {
  TaskWork.find(function (error, taskswork) {
    if (!error) {
      const listas = List.find({}, (err, items) => {
        res.render("index", {
          title: "work",
          tasks: taskswork,
          buttonValue: "work",
          hora: hora,
          min: min,
          listas: items,
        });
      });
    }
  });
});

/* Este es un controlador de ruta. Se llama cuando el usuario va a la raíz del sitio web. */
app.get("/:listname", (req, res) => {
  const listname = req.params.listname;
  List.findOne({ name: listname }, (err, foundlist) => {
    if (!err) {
      if (!foundlist) {
        const listtask = new List({
          name: listname,
        });
        listtask.save();
        res.redirect("/" + listname);
      } else {
        const listas = List.find({}, (err, items) => {
          res.render("index", {
            title: listname,
            tasks: foundlist.items,
            buttonValue: listname,
            hora: hora,
            min: min,
            listas: items,
          });
        });
      }
    }
  });
});

/* Esta es una ruta de publicación que se llama cuando el usuario hace clic en el botón Enviar.
Comprueba el valor del botón en el que se hizo clic y luego agrega la tarea a la lista correcta. */
app.post("/task", function (req, res) {
  if (req.body.button === "general") {
    if (req.body.nuevaTarea.length === 0) {
      res.redirect("/");
    } else {
      const newTask = new Task({
        name: req.body.nuevaTarea,
      });
      newTask.save();
      res.redirect("/");
    }
  } else {
    if (req.body.button === "work") {
      if (req.body.nuevaTarea.length === 0) {
        res.redirect("/work");
      } else {
        const newTaskWork = new TaskWork({
          name: req.body.nuevaTarea,
        });
        newTaskWork.save();
        res.redirect("/work");
      }
    } else {
      List.findOne({ name: req.body.button }, (err, foundlist) => {
        const newTaskItem = new Task({
          name: req.body.nuevaTarea,
        });
        foundlist.items.push(newTaskItem);
        foundlist.save();
        res.redirect("/" + req.body.button);
      });
    }
  }
});

/* Eliminar la tarea de la base de datos. */
app.post("/delete", function (req, res) {
  const idTarea = req.body.checkbox;
  const listname = req.body.listname;
  if (listname === "general") {
    Task.deleteOne(
      {
        _id: idTarea,
      },
      function (err) {
        if (!err) {
          console.log("Eliminado.");
          res.redirect("/");
        } else {
          console.log(err);
        }
      }
    );
  } else {
    if (listname === "work") {
      TaskWork.deleteOne(
        {
          _id: idTarea,
        },
        function (err) {
          if (!err) {
            console.log("Eliminado work.");
            res.redirect("/work");
          } else {
            console.log(err);
          }
        }
      );
    } else {
      List.findOneAndUpdate(
        {
          name: listname,
        },
        {
          $pull: { items: { _id: idTarea } },
        },
        function (err) {
          if (!err) {
            console.log("Eliminado de " + listname);
            res.redirect("/" + listname);
          } else {
            console.log(err);
          }
        }
      );
    }
  }
});

/* Creando una nueva lista. */
app.post("/lista", (req, res) => {
  const page = req.body.nuevaLista;
  res.redirect("/" + page);
});

/* Representación de la página de contacto. */
app.post("/contact", function (req, res) {
  res.render("contact");
});

/* Escuchando el puerto 3000. */
app.listen(port, function () {
  console.log(`Server live in port: ${port}`);
});
