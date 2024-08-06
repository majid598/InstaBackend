import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./Utils/db.js";
import { errorMiddleware } from "./Middlewares/error.js";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

dotenv.config({
  path: "./.env",
});

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      process.env.CLIENT_URL,
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Server Is Working Perfectly");
});

import userRoute from "./Routes/user.js";
import postRoute from "./Routes/post.js";
import chatRoute from "./Routes/chat.js";

connectDb(process.env.MONGO_URI);

app.use("/api/v1/user", userRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/post", postRoute);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is runnig at port number ${PORT}`);
});
