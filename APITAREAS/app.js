import express from "express";
import fs from "fs";

const app = express();
app.use(express.json());

const FILE_PATH = "./tareas.json";

let tareas = [];
if (fs.existsSync(FILE_PATH)) {
  const data = fs.readFileSync(FILE_PATH, "utf8");
  try {
    tareas = JSON.parse(data);
  } catch {
    tareas = [];
  }
}

const guardarTareas = () => {
  fs.writeFileSync(FILE_PATH, JSON.stringify(tareas, null, 2));
};

app.get("/tareas", (req, res) => {
  res.json(tareas);
});


app.get("/tareas/:nombre", (req, res) => {
  const { nombre } = req.params;
  const tarea = tareas.find(t => t.nombre.toLowerCase() === nombre.toLowerCase());
  
  if (!tarea) return res.status(404).json({ mensaje: "Tarea no encontrada" });
  res.json(tarea);
});


app.post("/tareas", (req, res) => {
  const { nombre, descripcion, estado } = req.body;

  if (!nombre || !descripcion || !estado)
    return res.status(400).json({ mensaje: "Faltan datos: nombre, descripcion o estado" });

  const existe = tareas.some(t => t.nombre.toLowerCase() === nombre.toLowerCase());
  if (existe)
    return res.status(400).json({ mensaje: "Ya existe una tarea con ese nombre" });

  const nuevaTarea = { nombre, descripcion, estado };
  tareas.push(nuevaTarea);
  guardarTareas(); 
  res.status(201).json({ mensaje: "Tarea agregada correctamente", tarea: nuevaTarea });
});


app.put("/tareas/:nombre", (req, res) => {
  const { nombre } = req.params;
  const { descripcion, estado } = req.body;

  const tarea = tareas.find(t => t.nombre.toLowerCase() === nombre.toLowerCase());
  if (!tarea)
    return res.status(404).json({ mensaje: "Tarea no encontrada" });

  if (descripcion) tarea.descripcion = descripcion;
  if (estado) tarea.estado = estado;
  guardarTareas(); 
  res.json({ mensaje: "Tarea actualizada", tarea });
});


app.patch("/tareas/:nombre/estado", (req, res) => {
  const { nombre } = req.params;
  const { estado } = req.body;

  const tarea = tareas.find(t => t.nombre.toLowerCase() === nombre.toLowerCase());
  if (!tarea)
    return res.status(404).json({ mensaje: "Tarea no encontrada" });

  tarea.estado = estado;
  guardarTareas();
  res.json({ mensaje: "Estado de la tarea actualizado", tarea });
});

app.delete("/tareas/:nombre", (req, res) => {
  const { nombre } = req.params;
  const indice = tareas.findIndex(t => t.nombre.toLowerCase() === nombre.toLowerCase());

  if (indice === -1)
    return res.status(404).json({ mensaje: "Tarea no encontrada" });

  tareas.splice(indice, 1);
  guardarTareas(); 
  res.json({ mensaje: "Tarea eliminada correctamente" });
});

app.get("/tareas/estado/:estado", (req, res) => {
  const { estado } = req.params;
  const filtradas = tareas.filter(t => t.estado.toLowerCase() === estado.toLowerCase());
  if (filtradas.length === 0)
    return res.status(404).json({ mensaje: "No hay tareas con ese estado" });

  res.json(filtradas);
});


app.get("/", (req, res) => {
  res.send("API Gestión de Tareas");
});

app.listen(3000, () => {
  console.log("Servidor escuchando en http://localhost:3000");
});
