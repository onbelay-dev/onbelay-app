import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    if (req.method === "GET") {
      const {
        location,
        certifiedLead,
        certifiedTopRope,
        maxRate,
        availability,
      } = req.query;

      const belayers = await prisma.belayerProfile.findMany({
        where: {
          location: location
            ? { contains: String(location), mode: "insensitive" }
            : undefined,

          certifiedLead:
            certifiedLead !== undefined
              ? certifiedLead === "true"
              : undefined,

          certifiedTopRope:
            certifiedTopRope !== undefined
              ? certifiedTopRope === "true"
              : undefined,

          hourlyRate: maxRate ? { lte: Number(maxRate) } : undefined,

          availability: availability
            ? { contains: String(availability), mode: "insensitive" }
            : undefined,
        },
        include: {
          user: true,
        },
      });

      if (!belayers || belayers.length === 0) {
        res.status(200).json({ message: "No belayers found matching the criteria." });
        return;
      }

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
