import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    res.status(400).json({ error: "Invalid or missing ID" });
    return;
  }

  try {
    if (req.method === "GET") {
      const belayer = await prisma.belayerProfile.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!belayer) {
        res.status(404).json({ error: "Belayer not found" });
        return;
      }

      res.status(200).json(belayer);
      return;
    }

    if (req.method === "PUT") {
      const {
        bio,
        certifiedLead,
        certifiedTopRope,
        hourlyRate,
        location,
        availability,
      } = req.body;

      const updated = await prisma.belayerProfile.update({
        where: { id },
        data: {
          bio,
          certifiedLead,
          certifiedTopRope,
          hourlyRate,
          location,
          availability,
        },
      });

      res.status(200).json(updated);
      return;
    }

    if (req.method === "DELETE") {
      await prisma.belayerProfile.delete({ where: { id } });
      res.status(204).end();
      return;
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
