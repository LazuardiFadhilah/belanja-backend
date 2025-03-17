import dotenv from "dotenv";
import express from "express";
import apiRouter from "./routes/api.js";
import connection from "./connection.js";

const env = dotenv.config().parsed;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/v1", apiRouter);

app.use((req, res) => {
  res.status(404).send("Not Found");
});

connection();

app.listen(env.APP_PORT, () => {
  console.log(`Server is running on port ${env.APP_PORT}`);
});
