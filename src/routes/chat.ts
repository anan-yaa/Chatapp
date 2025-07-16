import { Router, Response } from "express";
import { Database } from "../utils/database";
import { AuthenticatedRequest, authenticateToken } from "../middleware/auth";

const router = Router();

// Get all users (excluding current user)
router.get(
  "/users",
  authenticateToken,
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const users = Database.getUsers();
      const currentUserId = req.user?.userId;

      const filteredUsers = users
        .filter((user) => user.id !== currentUserId)
        .map((user) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          status: user.status,
          lastSeen: user.lastSeen,
        }));

      res.json(filteredUsers);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get messages between two users
router.get(
  "/messages/:userId",
  authenticateToken,
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const currentUserId = req.user?.userId;
      const otherUserId = req.params.userId;

      if (!currentUserId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const messages = Database.getMessagesBetweenUsers(
        currentUserId,
        otherUserId
      );
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Mark messages as read
router.post(
  "/messages/:userId/read",
  authenticateToken,
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const currentUserId = req.user?.userId;
      const otherUserId = req.params.userId;

      if (!currentUserId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      Database.markMessagesAsRead(otherUserId, currentUserId);
      res.json({ success: true });
    } catch (error) {
      console.error("Mark messages as read error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get current user profile
router.get(
  "/profile",
  authenticateToken,
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const currentUserId = req.user?.userId;

      if (!currentUserId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = Database.findUserById(currentUserId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const userProfile = {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        status: user.status,
        lastSeen: user.lastSeen,
      };

      res.json(userProfile);
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
