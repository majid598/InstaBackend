import { TryCatch } from "../Middlewares/error.js";
import { Chat } from "../Models/chat.js";
import { Message } from "../Models/Message.js";
import { User } from "../Models/user.js";
import ErrorHandler from "../Utils/utility.js";

const newChat = TryCatch(async (req, res, next) => {
  const { otherUserId } = req.body;
  const userId = req.user;
  if (!otherUserId) return next(new ErrorHandler("Chat Couldn't Create", 404));
  //   const alreadyCreated = await Chat.find({ user1: userId, user2: otherUserId });
  //   if (alreadyCreated) return next(new ErrorHandler("Chat have", 404));
  const otherUser = await User.findById(otherUserId);
  const user = await User.findById(userId);
  const chat = await Chat.create({
    user1: userId,
    user2: otherUserId,
  });
  user.chats.push(chat);
  otherUser.chats.push(chat);
  await user.save();
  await otherUser.save();

  return res.status(200).json({
    success: true,
    message: "Message sent",
  });
});

const getChatList = TryCatch(async (req, res, next) => {
  const { id: userId } = req.query;
  const chats = await Chat.find({
    $or: [{ user1: userId }, { user2: userId }],
  })
    .populate("user1", "username fullName profile")
    .populate("user2", "username fullName profile");

  return res.status(200).json({ success: true, chats });
});

const getChat = TryCatch(async (req, res, next) => {
  const chat = await Chat.findById(req.params.id)
    .populate("user1", "username fullName profile")
    .populate("user2", "username fullName profile");

  return res.status(200).json({
    success: true,
    chat,
  });
});

const sendMessage = TryCatch(async (req, res, next) => {
  const { otherUserId, content, chatId } = req.body;
  const userId = req.user;
  if (!userId || !otherUserId)
    return next(new ErrorHandler("Message Couldn't Sent", 404));
  const chat = await Chat.findById(chatId);
  const message = await Message.create({
    sender: userId,
    chat: chatId,
    reciever: otherUserId,
    content,
  });
  chat.messages.push(message);
  await chat.save();

  return res.status(200).json({
    success: true,
    message: "Message sent",
  });
});

const getAllMessages = TryCatch(async (req, res, next) => {
  const chatId = req.params.id;

  const messages = await Message.find({ chat: chatId }).populate(
    "sender",
    "username profile"
  );

  return res.status(200).json({ success: true, messages });
});

export { newChat, getChat, sendMessage, getAllMessages, getChatList };
