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
    /* -------------------- GET USER -------------------- */
    if (req.method === "GET") {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          climberProfile: true,
          belayerProfile: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json(user);
      return;
    }

    /* -------------------- UPDATE USER -------------------- */
    if (req.method === "PUT") {
      const {
        name,
        email,
        role,
        climberProfile,
        belayerProfile,
      } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(role && { role }),

          /* Optional nested updates */
          ...(climberProfile && {
            climberProfile: {
              update: climberProfile,
            },
          }),

          ...(belayerProfile && {
            belayerProfile: {
              update: belayerProfile,
            },
          }),
        },
        include: {
          climberProfile: true,
          belayerProfile: true,
        },
      });

      res.status(200).json(updatedUser);
      return;
    }

    /* -------------------- DELETE USER -------------------- */
    if (req.method === "DELETE") {
      await prisma.user.delete({
        where: { id },
      });

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
