import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import Group from "../models/GroupModel.js";
import Message from "../models/MessageModel.js";
import { renameSync, unlinkSync } from "fs";

/* ---------------- CONFIG ---------------- */
const maxAge = 3 * 24 * 60 * 60 * 1000;

const adminEmail = process.env.ADMIN_EMAIL || "";
const resetLowerLimit = process.env.RESET_LOWER_LIMIT || "2000-01-01";

/* ---------------- TOKEN ---------------- */
const createToken = (email, userId) => {
  return jwt.sign(
    { email, userId },
    process.env.JWT_KEY,
    { expiresIn: "3d" }
  );
};

/* ---------------- SIGNUP ---------------- */
export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists",
      });
    }

    const pepper = process.env.PEPPER_STRING || "";

    // SAFE bcrypt usage
    const hashedPassword = await bcrypt.hash(password + pepper, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
    });

    const token = createToken(user.email, user._id);

    res.cookie("jwt", token, {
      maxAge,
      httpOnly: true,
      secure: false, // change true in production (HTTPS)
      sameSite: "lax",
    });

    return res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        profileSetup: user.profileSetup,
        isAdmin: user.email === adminEmail,
      },
      token,
    });

  } catch (error) {
    console.log("SIGNUP ERROR:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/* ---------------- LOGIN ---------------- */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    const pepper = process.env.PEPPER_STRING || "";

    const isMatch = await bcrypt.compare(
      password + pepper,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        error: "Incorrect password",
      });
    }

    const token = createToken(user.email, user._id);

    res.cookie("jwt", token, {
      maxAge,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
        isAdmin: user.email === adminEmail,
      },
      token,
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/* ---------------- USER INFO ---------------- */
export const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(200).json({
      id: user._id,
      email: user.email,
      profileSetup: user.profileSetup,
      firstName: user.firstName,
      lastName: user.lastName,
      image: user.image,
      color: user.color,
      isAdmin: user.email === adminEmail,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/* ---------------- UPDATE PROFILE ---------------- */
export const updateProfile = async (req, res) => {
  try {
    const { userId } = req;
    const { firstName, lastName, color, image } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({
        error: "First name and last name required",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        color,
        image,
        profileSetup: true,
      },
      { new: true }
    );

    return res.status(200).json(user);

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/* ---------------- LOGOUT ---------------- */
export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 1,
      httpOnly: true,
      sameSite: "lax",
    });

    return res.status(200).json({
      message: "Logged out successfully",
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/* ---------------- RESET APP (FIXED EXPORT) ---------------- */
export const resetApp = async (req, res) => {
  try {
    const { resetDate } = req.body;

    if (!resetDate) {
      return res.status(400).json({
        error: "Reset date required",
      });
    }

    return res.status(200).json({
      message: "Reset endpoint active (safe mode)",
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
