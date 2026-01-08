import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      const { location, preferences, bio } = req.query;

      const andConditions: Prisma.ClimberProfileWhereInput[] = [];

      // ---------- LOCATION ----------
      if (typeof location === "string") {
        const values = location.split(",").map(v => v.trim()).filter(Boolean);
        if (values.length > 0) {
          andConditions.push({
            OR: values.map(v => ({ location: { contains: v, mode: "insensitive" } })),
          });
        }
      }

      // ---------- PREFERENCES ----------
      if (typeof preferences === "string") {
        const values = preferences.split(",").map(v => v.trim()).filter(Boolean);
        if (values.length > 0) {
          andConditions.push({
            OR: values.map(v => ({ preferences: { contains: v, mode: "insensitive" } })),
          });
        }
      }

      // ---------- BIO ----------
      if (typeof bio === "string") {
        const values = bio.split(",").map(v => v.trim()).filter(Boolean);
        if (values.length > 0) {
          andConditions.push({
            OR: values.map(v => ({ bio: { contains: v, mode: "insensitive" } })),
          });
        }
      }

      const where: Prisma.ClimberProfileWhereInput | undefined =
        andConditions.length > 0 ? { AND: andConditions } : undefined;

      const climbers = await prisma.climberProfile.findMany({
        where,
        include: { user: true },
      });

      if (climbers.length === 0) {
        return res.status(200).json({ message: "No climbers found", data: [] });
      }

      return res.status(200).json(climbers);
    }

    if (req.method === "POST") {
      const { userId, bio, preferences, location } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const climber = await prisma.climberProfile.create({
        data: { userId, bio, preferences, location },
      });

      return res.status(201).json(climber);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
