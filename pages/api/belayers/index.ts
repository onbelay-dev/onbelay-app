import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      const { location, availability, certifiedLead, certifiedTopRope } = req.query;

      const andConditions: Prisma.BelayerProfileWhereInput[] = [];

      // ---------- LOCATION ----------
      if (typeof location === "string") {
        const values = location.split(",").map(v => v.trim()).filter(Boolean);
        if (values.length > 0) {
          andConditions.push({
            OR: values.map(v => ({ location: { contains: v, mode: "insensitive" } })),
          });
        }
      }

      // ---------- AVAILABILITY ----------
      if (typeof availability === "string") {
        const values = availability.split(",").map(v => v.trim()).filter(Boolean);
        if (values.length > 0) {
          andConditions.push({
            OR: values.map(v => ({ availability: { contains: v, mode: "insensitive" } })),
          });
        }
      }

      // ---------- CERTIFIED LEAD ----------
      if (typeof certifiedLead === "string") {
        const boolValues = certifiedLead.split(",").map(v => v.trim() === "true");
        if (boolValues.length > 0) {
          andConditions.push({
            OR: boolValues.map(v => ({ certifiedLead: v })),
          });
        }
      }

      // ---------- CERTIFIED TOP ROPE ----------
      if (typeof certifiedTopRope === "string") {
        const boolValues = certifiedTopRope.split(",").map(v => v.trim() === "true");
        if (boolValues.length > 0) {
          andConditions.push({
            OR: boolValues.map(v => ({ certifiedTopRope: v })),
          });
        }
      }

      const where: Prisma.BelayerProfileWhereInput | undefined =
        andConditions.length > 0 ? { AND: andConditions } : undefined;

      const belayers = await prisma.belayerProfile.findMany({
        where,
        include: { user: true },
      });

      if (belayers.length === 0) {
        return res.status(200).json({ message: "No belayers found", data: [] });
      }

      return res.status(200).json(belayers);
    }

    if (req.method === "POST") {
      const { userId, bio, certifiedLead, certifiedTopRope, hourlyRate, location, availability } =
        req.body;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const belayer = await prisma.belayerProfile.create({
        data: { userId, bio, certifiedLead, certifiedTopRope, hourlyRate, location, availability },
      });

      return res.status(201).json(belayer);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
