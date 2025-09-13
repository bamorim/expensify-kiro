import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

// Input validation schemas
export const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(100, "Organization name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
});

export const organizationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createOrganizationSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Create organization and add creator as admin member in a transaction
      const organization = await ctx.db.$transaction(async (tx) => {
        const org = await tx.organization.create({
          data: {
            name: input.name,
            description: input.description,
            ownerId: userId,
          },
        });

        // Add the creator as an admin member
        await tx.organizationMember.create({
          data: {
            userId: userId,
            organizationId: org.id,
            role: "ADMIN",
          },
        });

        return org;
      });

      return organization;
    }),

  listByUser: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      const organizations = await ctx.db.organization.findMany({
        where: {
          members: {
            some: {
              userId: userId,
            },
          },
        },
        include: {
          members: {
            where: {
              userId: userId,
            },
            select: {
              role: true,
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Transform the data to include user's role directly
      return organizations.map((org) => ({
        id: org.id,
        name: org.name,
        description: org.description,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
        memberCount: org._count.members,
        userRole: org.members[0]?.role ?? "MEMBER",
      }));
    }),
});