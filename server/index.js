import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/AuthRoutes.js";
import contactsRoutes from "./routes/ContactRoutes.js";
import messagesRoutes from "./routes/MessagesRoutes.js";
import groupRoutes from "./routes/GroupRoutes.js";
import setupSocket from "./socket.js";
import friendRequestsRoutes from "./routes/FriendRequestsRoute.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});
<<<<<<< HEAD
app.use(cors(corsOptions));
=======
app.use(
  cors({
    origin: ["http://127.0.0.1",
      "http://54.144.222.197:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
>>>>>>> 5b70ebf (added)
);
app.options("*", cors());
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/friend-requests", friendRequestsRoutes);

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port} at http://localhost:${port}`);
});

setupSocket(server);

mongoose
  .connect(databaseURL)
  .then(() => {
    console.log("Connected to MongoDB successfully.");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
