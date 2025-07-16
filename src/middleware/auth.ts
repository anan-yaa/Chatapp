import { Request, Response, NextFunction } from "express";
import { Auth } from "../utils/auth";
import { Database } from "../utils/database";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    username: string;
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = Auth.extractTokenFromHeader(authHeader || "");

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  const decoded = Auth.verifyToken(token);
  if (!decoded) {
    res.status(403).json({ error: "Invalid or expired token" });
    return;
  }

  // Verify user still exists in database
  const user = Database.findUserById(decoded.userId);
  if (!user) {
    res.status(403).json({ error: "User not found" });
    return;
  }

  req.user = decoded;
  next();
};
