import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  addDummyDbItems,
  deleteAllItems,
  addDbItem,
  getAllDbItems,
  getDbItemById,
  DbItem,
  updateDbItemById,
  deleteDbItemById,
  addCompletedItem,
  DbItemWithId,
  deleteAllCompleted,
  getAllCompleted
} from "./db";
import filePath from "./filePath";

// loading in some dummy items into the database
// (comment out if desired, or change the number)
//addDummyDbItems(20);

const app = express();

/** Parses JSON data in a request automatically */
app.use(express.json());
/** To allow 'Cross-Origin Resource Sharing': https://en.wikipedia.org/wiki/Cross-origin_resource_sharing */
app.use(cors());

// read in contents of any environment variables in the .env file
dotenv.config();

// use the environment variable PORT, or 4000 as a fallback
const PORT_NUMBER = process.env.PORT ?? 4000;

// API info page
app.get("/", (req, res) => {
  const pathToFile = filePath("../public/index.html");
  res.sendFile(pathToFile);
});

// GET /tasks
app.get("/tasks", (req, res) => {
  const allSignatures = getAllDbItems();
  res.status(200).json(allSignatures);
});

// POST /tasks
app.post<{}, {}, DbItem>("/tasks", (req, res) => {
  // to be rigorous, ought to handle non-conforming request bodies
  // ... but omitting this as a simplification
  const postData = req.body;
  const createdSignature = addDbItem(postData);
  res.status(201).json(createdSignature);
});

// PATCH Database to empty /tasks/reset
app.delete("/tasks/reset", (req, res) => {
  deleteAllItems();
  const allTasks = getAllDbItems()
  res.status(200).json(allTasks)
})

// GET /tasks/:id
app.get<{ id: string }>("/tasks/:id", (req, res) => {
  const matchingSignature = getDbItemById(parseInt(req.params.id));
  if (matchingSignature === "not found") {
    res.status(404).json(matchingSignature);
  } else {
    res.status(200).json(matchingSignature);
  }
});

// DELETE /tasks/:id
app.delete<{ id: string }>("/task/:id", (req, res) => {
  const matchingSignature = getDbItemById(parseInt(req.params.id));
  deleteDbItemById(parseInt(req.params.id))
  if (matchingSignature === "not found") {
    res.status(404).json(matchingSignature);
  } else {
    res.status(200).json(matchingSignature);
  }
});

// PATCH /tasks/:id
app.patch<{ id: string }, {}, Partial<DbItem>>("/tasks/:id", (req, res) => {
  const matchingSignature = updateDbItemById(parseInt(req.params.id), req.body);
  if (matchingSignature === "not found") {
    res.status(404).json(matchingSignature);
  } else {
    res.status(200).json(matchingSignature);
  }
});

//handle completed tasks after all other lines of code has run

//get all completed tasks

app.get("./tasks/completed", (req, res) => {
  const allCompletedTasks = getAllCompleted()
  res.status(200).json(allCompletedTasks)
})

//add item to completed
app.post<{}, {}, DbItemWithId>("/tasks/completed", (req, res) => {
  // to be rigorous, ought to handle non-conforming request bodies
  // ... but omitting this as a simplification
  const completedTask = req.body;
  const createdSignature = addCompletedItem(completedTask);
  res.status(201).json(createdSignature);
});

//clear completed tasks list
app.delete("/tasks/completed/reset", (req, res) => {
  deleteAllCompleted();
  const allTasks = getAllDbItems()
  res.status(200).json(allTasks)
})

app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});
