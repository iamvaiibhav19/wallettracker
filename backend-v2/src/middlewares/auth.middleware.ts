import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import { prisma } from "../models/prismaClient";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

/**
 * @swagger
 * /api/v2/auth/protected:
 *   get:
 *     summary: Protected route
 *     description: This is a protected route that requires authentication via Bearer token.
 *     security:
 *       - bearerAuth: []  # This indicates that the route requires Bearer token authentication.
 *     responses:
 *       200:
 *         description: Successfully accessed protected route
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome, vaibhavmagar1901@gmail.com
 *       401:
 *         description: Unauthorized, invalid or expired token
 */
export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn("No Authorization header provided");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) {
      logger.warn("Invalid session token");
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (session.expiresAt < new Date()) {
      logger.warn(`Expired session token for user: ${session.user.email}`);
      return res.status(401).json({ message: "Session expired" });
    }

    // Attach user to request object
    req.user = {
      id: session.user.id,
      email: session.user.email,
    };

    logger.info(`Authenticated user: ${session.user.email}`);
    next();
  } catch (err: any) {
    logger.error(`Auth middleware error: ${err.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
