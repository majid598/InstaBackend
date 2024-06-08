import express from "express";
import {
  getAllMessages,
  getChat,
  getChatList,
  newChat,
  sendMessage,
} from "../Controllers/chat.js";
import { isAuthenticated } from "../Middlewares/auth.js";
const router = express.Router();

router.post("/new", isAuthenticated, newChat);

router.get("/:id", isAuthenticated, getChat);

router.get("/my/all", isAuthenticated, getChatList);

router.post("/send/message", isAuthenticated, sendMessage);

router.get("/messages/:id", isAuthenticated, getAllMessages);

export default router;
