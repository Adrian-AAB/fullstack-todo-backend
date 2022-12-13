import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import filePath from "./filePath";
const { Client } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

dotenv.config();

const PORT_NUMBER = process.env.PORT ?? 4000;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function connectServer() {
  await client.connect();
  console.log("client connected");
}
connectServer();

//get API info page
app.get("/", (req, res) => {
  const pathToFile = filePath("../public/index.html");
  res.sendFile(pathToFile);
});

//get all tasks
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await client.query("SELECT * FROM to_do_tasks");
    res.status(201).json(tasks.rows);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.log("unexpected error", err);
    }
  }
});

//get all completed tasks

app.get("/completed", async (req, res) => {
  try {
    const completedTasks = await client.query("SELECT * FROM completed_tasks");
    res.status(201).json(completedTasks.rows);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.log("unexpected error", err);
    }
  }
});

//add a task
interface TaskItem {
  message: string;
}
app.post<{}, {}, TaskItem>("/tasks", async (req, res) => {
  try {
    console.log(req.body);
    const createTask: TaskItem = req.body;
    const createdTask = await client.query(
      "INSERT INTO to_do_tasks (task) VALUES ($1)",
      [createTask.message]
    );
    res.status(201).json(createTask);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.log("unexpected error", err);
    }
  }
});

//delete all tasks
app.delete("/tasks/reset", async (req, res) => {
  try {
    const deleteTasks = await client.query("TRUNCATE to_do_tasks");
    res.status(201).json("Tasks tab was cleared");
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.log("unexpected error", err);
    }
  }
});

//Delete a specific task
app.delete<{ id: string }>("/task/:id", async (req, res) => {
  try {
    const deleteTask = await client.query(
      "DELETE FROM to_do_tasks WHERE task_id = $1",
      [req.body.id]
    );
    res.status(201).json("Task was deleted");
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.log("unexpected error", err);
    }
  }
});

//add to completed
interface TaskItemwithID {
  id: number;
  message: string;
}
app.post<{}, {}, TaskItemwithID>("/tasks", async (req, res) => {
  try {
    console.log(req.body);
    const completeTask: TaskItemwithID = req.body;
    const createdTask = await client.query(
      "WITH deleted_rows AS (DELETE FROM to_do_tasks WHERE task_id = $1 RETURNING *) INSERT INTO completed_tasks SELECT * FROM delete_rows",
      [completeTask.id]
    );
    res.status(201).json(completeTask);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.log("unexpected error", err);
    }
  }
});

//clear all completed tasks
app.delete("/completed/reset", async (req, res) => {
  try {
    const deleteAllCompleted = await client.query("TRUNCATE completed_tasks");
  } catch (err) {
    if (err instanceof Error) {
      console.error(err);
    } else {
      console.log("unexpected error", err);
    }
  }
});

app.listen(PORT_NUMBER, () => {
  console.log("Server is listening on port ", PORT_NUMBER);
});
