import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = "your_secret_key";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const generateToken = (user: { id: number; email: string; role: string }) => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "1h" });
};

export const authenticateJWT = (roles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Missing or invalid token" });
      return;
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        res.status(403).json({ message: "Invalid or expired token" });
        return;
      }

      if (roles.length && !roles.includes((user as any).role)) {
        res.status(403).json({ message: "Forbidden: insufficient rights" });
        return;
      }

      req.user = user;
      next();
    });
  };
};
