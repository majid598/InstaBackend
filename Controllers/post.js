import { TryCatch } from "../Middlewares/error.js";
import { Notification } from "../Models/notification.js";
import { Post } from "../Models/post.js";
import { Reel } from "../Models/reel.js";
import { User } from "../Models/user.js";
import ErrorHandler from "../Utils/utility.js";

const newPost = TryCatch(async (req, res, next) => {
  const { userId, title, caption, attachMent } = req.body;
  if (!userId || !title || !caption || !attachMent)
    return next(new ErrorHandler("All Fields Are Rrequired", 404));
  const post = await Post.create({
    user: userId,
    title,
    caption,
    attachMent,
  });
  const user = await User.findById(userId);
  user.posts.push(post);
  await user.save();
  // const

  return res.status(200).json({
    success: true,
    message: "Post Created",
  });
});

const allPosts = TryCatch(async (req, res, next) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate("user", "username fullName profile");
  return res.status(200).json({
    success: true,
    posts,
  });
});

const singlePost = TryCatch(async (req, res, next) => {
  const post = await Reel.findById(req.params.id).populate(
    "user",
    "username fullName profile"
  );
  return res.status(200).json({
    success: true,
    post,
  });
});

const likeToPost = TryCatch(async (req, res, next) => {
  const { userId, postId } = req.body;
  if (!userId || !postId)
    return next(new ErrorHandler("Couldn't like this post", 404));
  const post = await Post.findById(postId).populate("user", "fullName");
  const liker = await User.findById(userId);
  const user = await User.findById(post.user._id);
  if (post.likes.indexOf(userId) === -1) {
    post.likes.push(userId);
    const notification = await Notification.create({
      message: `${liker.username} liked your post`,
      sender: liker._id,
      reciever: user._id,
    });
    user.notifications.push(notification);
  } else {
    post.likes.splice(post.likes.indexOf(userId), 1);
  }
  await post.save();
  await user.save();
  return res.status(200).json({
    success: true,
  });
});

const uploadReal = TryCatch(async (req, res, next) => {
  const { userId, title, caption, attachMent } = req.body;
  if (!userId || !title || !caption || !attachMent)
    return next(new ErrorHandler("All Fields Are Rrequired", 404));
  const reel = await Reel.create({
    user: userId,
    title,
    caption,
    attachMent,
  });
  const user = await User.findById(userId);
  user.reels.push(reel);
  await user.save();
  // const

  return res.status(200).json({
    success: true,
    message: "Reel Uploaded",
  });
});

const allReels = TryCatch(async (req, res, next) => {
  const reels = await Reel.find()
    .sort({ createdAt: -1 })
    .populate("user", "username fullName profile");
  return res.status(200).json({
    success: true,
    reels,
  });
});

const likeToReel = TryCatch(async (req, res, next) => {
  const { userId, reelId } = req.body;
  if (!userId || !reelId)
    return next(new ErrorHandler("Couldn't like this post", 404));
  const reel = await Reel.findById(reelId);
  const liker = await User.findById(userId);
  const user = await User.findById(reel.user._id);
  if (reel.likes.indexOf(userId) === -1) {
    reel.likes.push(userId);
    const notification = await Notification.create({
      message: `${liker.username} liked your reel`,
      sender: liker._id,
      reciever: user._id,
    });
    user.notifications.push(notification);
  } else {
    reel.likes.splice(reel.likes.indexOf(userId), 1);
  }
  await reel.save();
  await user.save();
  return res.status(200).json({
    success: true,
  });
});

const addToFavorites = TryCatch(async (req, res, next) => {
  const { reelId } = req.body;
  const userId = req.user;
  if (!reelId) return next(new ErrorHandler("Couldn't add", 404));
  const reel = await Reel.findById(reelId);
  const user = await User.findById(userId);
  if (user.favorites.indexOf(reelId) === -1) {
    user.favorites.push(reelId);
  } else {
    user.favorites.splice(user.favorites.indexOf(reelId), 1);
  }
  if (reel.favorites.indexOf(userId) === -1) {
    reel.favorites.push(userId);
  } else {
    reel.favorites.splice(reel.favorites.indexOf(userId), 1);
  }
  await reel.save();
  await user.save();
  return res.status(200).json({
    success: true,
  });
});

const viewsPlus = TryCatch(async (req, res, next) => {
  const reelId = req.params.id;
  const { userId } = req.body;

  const reel = await Reel.findById(reelId);
  if (!reel) return next("Reel not found", 404);

  if (!reel.viewsByUser.includes(userId)) {
    reel.views++;
    reel.viewsByUser.push(userId);
    await reel.save();
  }

  res.status(200).json({ message: "View count incremented successfully" });
});

const addComment = TryCatch(async (req, res, next) => {
  const { reelId, userId, comment } = req.body;
  if (!reelId || !userId || !comment)
    return next(new ErrorHandler("alladf", 404));
  const user = await User.findById(userId);
  const reel = await Reel.findById(reelId);
  const newComment = {
    comment,
    user: {
      _id: userId,
      username: user.username,
      profile: user.profile,
    },
    createdAt: new Date(),
  };
  reel.comments.push(newComment);
  await reel.save();
  return res.status(200).json({
    success: true,
    message: "Commented",
  });
});

const singleReel = TryCatch(async (req, res, next) => {
  const reel = await Reel.findById(req.params.id).populate(
    "user",
    "username fullName profile"
  );
  return res.status(200).json({
    success: true,
    reel,
  });
});

export {
  newPost,
  allPosts,
  likeToPost,
  uploadReal,
  allReels,
  likeToReel,
  singlePost,
  viewsPlus,
  addComment,
  singleReel,
  addToFavorites,
};
