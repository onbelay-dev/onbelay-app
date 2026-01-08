import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    if (req.method === "GET") {
      const { location, preferences } = req.query;

      const climbers = await prisma.climberProfile.findMany({
        where: {
          location: location
            ? { contains: String(location), mode: "insensitive" }
            : undefined,

          preferences: preferences
            ? { contains: String(preferences), mode: "insensitive" }
            : undefined,
        },
        include: {
          user: true,
        },
      });

      if (!climbers || climbers.length === 0) {
        res
          .status(200)
          .json({ message: "No climbers found matching the criteria." });
        return;
      }

      res.status(200).json(climbers);
      return;
    }

    if (req.method === "POST") {
      const { userId, bio, preferences, location } = req.body;

      if (!userId) {
        res.status(400).json({ error: "userId is required" });
        return;
      }

      const climber = await prisma.climberProfile.create({
        data: {
          userId,
          bio,
          preferences,
          location,
        },
      });

      res.status(201).json(climber);
      return;
    }

    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
