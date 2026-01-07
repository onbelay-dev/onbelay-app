import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET": {
        const users = await prisma.user.findMany({
          include: {
            belayerProfile: true,
            climberProfile: true,
          },
        });

        return res.status(200).json(users);
      }

      case "POST": {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
          return res.status(400).json({
            error: "Missing required fields",
          });
        }

        const user = await prisma.user.create({
          data: {
            name,
            email,
            password, // plaintext for now (OK for MVP)
            role,
          },
        });

        return res.status(201).json(user);
      }

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
