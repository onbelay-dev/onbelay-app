import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    if (req.method === "GET") {
      const { name, email, role } = req.query;

      const users = await prisma.user.findMany({
        where: {
          name: name
            ? { contains: String(name), mode: "insensitive" }
            : undefined,

          email: email
            ? { contains: String(email), mode: "insensitive" }
            : undefined,

          role:
            role && Object.values(Role).includes(role as Role)
              ? (role as Role)
              : undefined,
        },
        include: {
          belayerProfile: true,
          climberProfile: true,
        },
      });

      if (!users || users.length === 0) {
        res
          .status(200)
          .json({ message: "No users found matching the criteria." });
        return;
      }

      res.status(200).json(users);
      return;
    }

    if (req.method === "POST") {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password || !role) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password,
          role,
        },
      });

      res.status(201).json(user);
      return;
    }

    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
