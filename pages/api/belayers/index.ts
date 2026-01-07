import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    if (req.method === "GET") {
      const belayers = await prisma.belayerProfile.findMany({
        include: {
          user: true,
        },
      });

      res.status(200).json(belayers);
      return;
    }

    if (req.method === "POST") {
      const {
        userId,
        bio,
        certifiedLead,
        certifiedTopRope,
        hourlyRate,
        location,
        availability,
      } = req.body;

      if (!userId) {
        res.status(400).json({ error: "userId is required" });
        return;
      }

      const belayer = await prisma.belayerProfile.create({
        data: {
          userId,
          bio,
          certifiedLead,
          certifiedTopRope,
          hourlyRate,
          location,
          availability,
        },
      });

      res.status(201).json(belayer);
      return;
    }

    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
