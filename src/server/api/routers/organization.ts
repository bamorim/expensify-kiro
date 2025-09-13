import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  organizationProcedure,
  adminProcedure,
  organizationInputSchema,
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

  // Organization-scoped operations using organizationProcedure
  getById: organizationProcedure
    .query(async ({ ctx, input }) => {
      const organization = await ctx.db.organization.findUnique({
        where: { id: input.organizationId },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
        },
      });

      if (!organization) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      return {
        ...organization,
        memberCount: organization._count.members,
        userRole: ctx.userRole,
      };
    }),

  // Member management operations
  listMembers: organizationProcedure
    .query(async ({ ctx, input }) => {
      const members = await ctx.db.organizationMember.findMany({
        where: {
          organizationId: input.organizationId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          joinedAt: "asc",
        },
      });

      return members.map((member) => ({
        id: member.id,
        role: member.role,
        joinedAt: member.joinedAt,
        user: member.user,
      }));
    }),

  removeMember: adminProcedure
    .input(organizationInputSchema.extend({ 
      userId: z.string().cuid() 
    }))
    .mutation(async ({ ctx, input }) => {
      const { organizationId, userId } = input;

      // Prevent removing the organization owner
      const organization = await ctx.db.organization.findUnique({
        where: { id: organizationId },
        select: { ownerId: true },
      });

      if (organization?.ownerId === userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot remove the organization owner",
        });
      }

      // Remove the member
      const deletedMember = await ctx.db.organizationMember.delete({
        where: {
          userId_organizationId: {
            userId,
            organizationId,
          },
        },
      });

      return deletedMember;
    }),
});