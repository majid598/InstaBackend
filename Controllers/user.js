import { User } from "../Models/user.js";
import { TryCatch } from "../Middlewares/error.js";
import ErrorHandler from "../Utils/utility.js";
import { cookieOptions, sendToken } from "../Utils/features.js";
import { compare } from "bcrypt";
import { Story } from "../Models/story.js";
import cron from "node-cron";
import { Notification } from "../Models/notification.js";

const newUser = TryCatch(async (req, res, next) => {
  console.log(req.body);

  const { email, fullName, username, password } = req.body;
  console.log(email, fullName, username, password);

  if (!email || !fullName || !username || !password)
    return next(new ErrorHandler("All Feilds Are Required", 404));

  const user = await User.create({
    email,
    fullName,
    username,
    password,
  });
  sendToken(res, user, 200, `Account Registration Successful`);
});

const login = TryCatch(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email, password);

  const user = await User.findOne({ email }).select("+password");

  if (!user) return next(new ErrorHandler("Invalid Email Or Password", 404));

  const isMatch = await compare(password, user.password);

  if (!isMatch) return next(new ErrorHandler("Invalid Email Or Password", 404));

  sendToken(res, user, 200, `Welcome Back Mr ${user.fullName}`);
});

const myProfile = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.user)
    .populate("followers", "username fullName profile")
    .populate("following", "username fullName profile")
    .populate("posts", "attachMent")
    .populate("favorites", "attachMent views")
    .populate("story", "attachMent caption")
    .populate("reels", "attachMent views")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    user,
  });
});

const logout = TryCatch(async (req, res, next) => {
  return res
    .status(200)
    .cookie("insta-token", "", { ...cookieOptions, maxAge: 0 })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});

const editProfile = TryCatch(async (req, res, next) => {
  const { profile, bio, websiteLink } = req.body;
  const userId = req.user;
  const user = await User.findById(userId);
  user.profile = profile ? profile : user.profile;
  user.bio = bio ? bio : user.bio;
  user.websiteLink = websiteLink ? websiteLink : user.websiteLink;
  await user.save();
  return res.status(200).json({ success: true, message: "Profile updated" });
});

const followToAuser = TryCatch(async (req, res, next) => {
  const { userId, followerId } = req.body;
  // Find the user who is removing the follower
  const user = await User.findById(userId);
  const follower = await User.findById(followerId);

  if (!user) return next(new ErrorHandler("User not found", 404));

  // Remove the follower from the user's followers list
  if (user.followers.indexOf(followerId) === -1) {
    user.followers.push(followerId);
    const notification = await Notification.create({
      message: `${follower.username} started following you`,
      sender: follower._id,
      reciever: user._id,
    });
    user.notifications.push(notification);
  } else {
    user.followers.splice(user.followers.indexOf(followerId), 1);
  }
  if (follower.following.indexOf(userId) === -1) {
    follower.following.push(userId);
  } else {
    follower.following.splice(follower.following.indexOf(userId), 1);
  }
  await user.save();
  await follower.save();
  return res.status(200).json({
    success: true,
    message: `You Followed ${user.fullName}`,
  });
});

const getOtherUser = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .populate("followers", "username fullName profile")
    .populate("following", "username fullName profile")
    .populate("posts", "attachMent");

  return res.status(200).json({
    success: true,
    user,
  });
});

const removeAFollower = TryCatch(async (req, res, next) => {
  const { userId, followerId } = req.body;

  // Find the user who is removing the follower
  const user = await User.findById(userId);
  const follower = await User.findById(followerId);

  if (!user) return next(new ErrorHandler("User not found", 404));

  // Remove the follower from the user's followers list
  user.followers.pull(followerId);
  follower.following.pull(userId);
  await user.save();
  await follower.save();

  return res.status(200).json({ success: true, message: "Follower Removed" });
});

const uploadStory = TryCatch(async (req, res, next) => {
  const { userId, caption, attachMent } = req.body;
  if (!caption || !attachMent)
    return next(new ErrorHandler("All fields Are required", 404));
  const user = await User.findById(userId);

  const story = await Story.create({ user: userId, caption, attachMent });
  user.story = story;
  await user.save();
  return res.status(200).json({
    success: true,
    message: "Story Updated",
  });
});

const stories = TryCatch(async (req, res, next) => {
  const stories = await Story.find({});

  return res.status(200).json({ success: true, stories });
});
const singleStory = TryCatch(async (req, res, next) => {
  const story = await Story.findById(req.params.id).populate(
    "user",
    "fullName username profile"
  );

  return res.status(200).json({ success: true, story });
});
const myNotifications = TryCatch(async (req, res, next) => {
  const userId = req.query.id;
  const notifications = await Notification.find({
    reciever: req.query.id,
  }).populate("sender", "fullName username profile");
  return res.status(200).json({ success: true, notifications });
});

cron.schedule("0 0 * * *", async () => {
  try {
    // Remove stories older than 24 hours
    await Story.deleteMany({
      createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    console.log("Expired stories removed.");
  } catch (error) {
    console.error("Error removing expired stories:", error);
  }
});

export {
  newUser,
  login,
  myProfile,
  logout,
  followToAuser,
  editProfile,
  getOtherUser,
  removeAFollower,
  uploadStory,
  stories,
  singleStory,
  myNotifications,
};
