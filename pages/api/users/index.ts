import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { Role, Prisma } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { name, email, role } = req.query;

    const andConditions: Prisma.UserWhereInput[] = [];

    /* ---------- NAME (OR within field) ---------- */
    if (typeof name === "string") {
      const values = name.split(",").map(v => v.trim()).filter(Boolean);

      if (values.length > 0) {
        andConditions.push({
          OR: values.map(value => ({
            name: { contains: value, mode: "insensitive" },
          })),
        });
      }
    }

    /* ---------- EMAIL (OR within field) ---------- */
    if (typeof email === "string") {
      const values = email.split(",").map(v => v.trim()).filter(Boolean);

      if (values.length > 0) {
        andConditions.push({
          OR: values.map(value => ({
            email: { contains: value, mode: "insensitive" },
          })),
        });
      }
    }

    /* ---------- ROLE (OR within field, exact match) ---------- */
    if (typeof role === "string") {
      const roles = role
        .split(",")
        .map(v => v.trim())
        .filter((r): r is Role =>
          Object.values(Role).includes(r as Role)
        );

      if (roles.length > 0) {
        andConditions.push({
          OR: roles.map(r => ({ role: r })),
        });
      }
    }

    const where: Prisma.UserWhereInput | undefined =
      andConditions.length > 0 ? { AND: andConditions } : undefined;

    const users = await prisma.user.findMany({
      where,
      include: {
        belayerProfile: true,
        climberProfile: true,
      },
    });

    if (users.length === 0) {
      return res.status(200).json({
        message: "No users found matching criteria",
        data: [],
      });
    }

    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
