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
app.post<{}, {}, { data: { user_id: string | null } }>(
  "/alltasks",
  async (req, res) => {
    try {
      const userID = req.body.data.user_id;
      const tasks = await client.query(
        "SELECT task_id, task, complete, user_id FROM to_do_tasks WHERE user_id = $1",
        [userID]
      );
      res.status(201).json(tasks.rows);
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.log("unexpected error", err);
      }
    }
  }
);

//add a task
interface AddTask {
  task: string;
  user_id: string;
}
app.post<{}, {}, AddTask>("/tasks", async (req, res) => {
  try {
    const createTask: AddTask = req.body;
    const createdTask = await client.query(
      "INSERT INTO to_do_tasks (task, user_id) VALUES ($1, $2)",
      [createTask.task, createTask.user_id]
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

//delete all tasks from the user
interface DeleteAllTasks {
  user_id: string;
}
app.delete<{}, {}, DeleteAllTasks>("/tasks/reset", async (req, res) => {
  try {
    const deleteTasks: DeleteAllTasks = req.body;
    const deletedTasks = await client.query(
      "DELETE FROM to_do_tasks WHERE user_id = $1",
      [deleteTasks.user_id]
    );
    console.log(deletedTasks);
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
app.delete<{ id: number }>("/task/:id", async (req, res) => {
  try {
    const deleteTask = await client.query(
      "DELETE FROM to_do_tasks WHERE task_id = $1",
      [req.params.id]
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

//change complete value to true
interface CompleteTask {
  id: number;
}
app.put<{}, {}, CompleteTask>("/completed", async (req, res) => {
  try {
    const completeTask: CompleteTask = req.body;
    const completedTask = await client.query(
      "UPDATE to_do_tasks SET complete = true WHERE task_id = $1",
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

app.delete<{}, {}, { user_id: string }>(
  "/completed/reset",
  async (req, res) => {
    try {
      const userID = req.body.user_id;
      const deleteComplete = await client.query(
        "DELETE FROM to_do_tasks WHERE complete = true AND user_id = $1",
        [userID]
      );
      res.status(201).json(deleteComplete.rows);
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.log("unexpected error", err);
      }
    }
  }
);

app.listen(PORT_NUMBER, () => {
  console.log("Server is listening on port ", PORT_NUMBER);
});
