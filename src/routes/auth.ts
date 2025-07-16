import { Router, Request, Response } from "express";
import { Auth } from "../utils/auth";
import { Database } from "../utils/database";
import { AuthRequest, RegisterRequest, AuthResponse } from "../types";

const router = Router();

// Register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, username }: RegisterRequest = req.body;

    // Validation
    if (!email || !password || !username) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existingUser = Database.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await Auth.hashPassword(password);

    // Create user
    const user = Database.createUser({
      email,
      password: hashedPassword,
      username,
      status: "offline",
      lastSeen: new Date(),
    });

    // Generate token
    const token = Auth.generateToken(user);

    const response: AuthResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        status: user.status,
        lastSeen: user.lastSeen,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password }: AuthRequest = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = Database.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await Auth.comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update user status
    Database.updateUser(user.id, { status: "online", lastSeen: new Date() });

    // Generate token
    const token = Auth.generateToken(user);

    const response: AuthResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        status: "online",
        lastSeen: new Date(),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
