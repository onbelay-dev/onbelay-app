import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    if (req.method === "GET") {
      // Extract query params
      const {
        bio,
        certifiedLead,
        certifiedTopRope,
        location,
        availability,
        hourlyRateMin,
        hourlyRateMax,
        ratingMin,
        ratingMax,
      } = req.query;

      // Build filters
      const belayers = await prisma.belayerProfile.findMany({
        where: {
          bio: bio
            ? { contains: String(bio), mode: "insensitive" }
            : undefined,
          certifiedLead:
            certifiedLead !== undefined
              ? certifiedLead === "true"
              : undefined,
          certifiedTopRope:
            certifiedTopRope !== undefined
              ? certifiedTopRope === "true"
              : undefined,
          location: location
            ? { contains: String(location), mode: "insensitive" }
            : undefined,
          availability: availability
            ? { contains: String(availability), mode: "insensitive" }
            : undefined,
          hourlyRate:
            hourlyRateMin || hourlyRateMax
              ? {
                  gte: hourlyRateMin ? Number(hourlyRateMin) : undefined,
                  lte: hourlyRateMax ? Number(hourlyRateMax) : undefined,
                }
              : undefined,
          rating:
            ratingMin || ratingMax
              ? {
                  gte: ratingMin ? Number(ratingMin) : undefined,
                  lte: ratingMax ? Number(ratingMax) : undefined,
                }
              : undefined,
        },
        include: {
          user: true,
        },
      });

      if (!belayers.length) {
        res.status(200).json({ message: "No belayers found matching filters" });
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
