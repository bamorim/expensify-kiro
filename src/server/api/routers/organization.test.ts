import { describe, it, expect, vi, beforeEach } from "vitest";
import { organizationRouter, createOrganizationSchema } from "./organization";
import { db } from "~/server/db";
import { faker } from "@faker-js/faker";

// Mock the database to use the transactional testing wrapper
vi.mock("~/server/db");

// Mock the auth module
vi.mock("~/server/auth", () => ({
  auth: vi.fn(),
}));

describe("OrganizationRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Input Validation Schemas", () => {
    describe("createOrganizationSchema", () => {
      it("should validate valid organization data", () => {
        const validData = {
          name: "Test Organization",
          description: "A test organization",
        };

        const result = createOrganizationSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it("should validate organization without description", () => {
        const validData = {
          name: "Test Organization",
        };

        const result = createOrganizationSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it("should reject empty name", () => {
        const invalidData = {
          name: "",
          description: "A test organization",
        };

        const result = createOrganizationSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.message).toBe("Organization name is required");
      });

      it("should reject name longer than 100 characters", () => {
        const invalidData = {
          name: "a".repeat(101),
          description: "A test organization",
        };

        const result = createOrganizationSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.message).toBe("Organization name must be less than 100 characters");
      });

      it("should reject description longer than 500 characters", () => {
        const invalidData = {
          name: "Test Organization",
          description: "a".repeat(501),
        };

        const result = createOrganizationSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.message).toBe("Description must be less than 500 characters");
      });
    });
  });

  describe("create", () => {
    it("should create an organization successfully", async () => {
      const user = await db.user.create({
        data: {
          name: "Test User",
          email: faker.internet.email(),
        },
      });

      const mockSession = {
        user,
        expires: "2030-12-31T23:59:59.999Z",
      };

      const caller = organizationRouter.createCaller({
        db: db,
        session: mockSession,
        headers: new Headers(),
      });

      const organizationData = {
        name: "Test Organization",
        description: "A test organization for unit testing",
      };

      const result = await caller.create(organizationData);

      expect(result.name).toEqual(organizationData.name);
      expect(result.description).toEqual(organizationData.description);
      expect(result.ownerId).toEqual(user.id);

      // Verify organization was created in database
      const organization = await db.organization.findUnique({
        where: { id: result.id },
        include: { members: true },
      });

      expect(organization).toBeDefined();
      expect(organization?.members).toHaveLength(1);
      expect(organization?.members[0]?.userId).toEqual(user.id);
      expect(organization?.members[0]?.role).toEqual("ADMIN");
    });

    it("should create an organization without description", async () => {
      const user = await db.user.create({
        data: {
          name: "Test User",
          email: faker.internet.email(),
        },
      });

      const mockSession = {
        user,
        expires: "2030-12-31T23:59:59.999Z",
      };

      const caller = organizationRouter.createCaller({
        db: db,
        session: mockSession,
        headers: new Headers(),
      });

      const organizationData = {
        name: "Test Organization",
      };

      const result = await caller.create(organizationData);

      expect(result.name).toEqual(organizationData.name);
      expect(result.description).toBeNull();
      expect(result.ownerId).toEqual(user.id);
    });
  });

  describe("listByUser", () => {
    it("should return organizations where user is a member", async () => {
      const user = await db.user.create({
        data: {
          name: "Test User",
          email: faker.internet.email(),
        },
      });

      const owner = await db.user.create({
        data: {
          name: "Owner User",
          email: faker.internet.email(),
        },
      });

      // Create organizations
      const org1 = await db.organization.create({
        data: {
          name: "Organization 1",
          description: "First organization",
          ownerId: owner.id,
        },
      });

      const org2 = await db.organization.create({
        data: {
          name: "Organization 2",
          ownerId: user.id,
        },
      });

      // Add user as member to org1 and admin to org2
      await db.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: org1.id,
          role: "MEMBER",
        },
      });

      await db.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: org2.id,
          role: "ADMIN",
        },
      });

      const mockSession = {
        user,
        expires: "2030-12-31T23:59:59.999Z",
      };

      const caller = organizationRouter.createCaller({
        db: db,
        session: mockSession,
        headers: new Headers(),
      });

      const result = await caller.listByUser();

      expect(result).toHaveLength(2);
      
      // Should be ordered by createdAt desc (org2 created after org1)
      expect(result[0]?.name).toEqual("Organization 2");
      expect(result[0]?.userRole).toEqual("ADMIN");
      expect(result[0]?.memberCount).toEqual(1);

      expect(result[1]?.name).toEqual("Organization 1");
      expect(result[1]?.userRole).toEqual("MEMBER");
      expect(result[1]?.memberCount).toEqual(1);
    });

    it("should return empty array when user is not a member of any organization", async () => {
      const user = await db.user.create({
        data: {
          name: "Test User",
          email: faker.internet.email(),
        },
      });

      const mockSession = {
        user,
        expires: "2030-12-31T23:59:59.999Z",
      };

      const caller = organizationRouter.createCaller({
        db: db,
        session: mockSession,
        headers: new Headers(),
      });

      const result = await caller.listByUser();

      expect(result).toHaveLength(0);
    });

    it("should include member count correctly", async () => {
      const user = await db.user.create({
        data: {
          name: "Test User",
          email: faker.internet.email(),
        },
      });

      const otherUser = await db.user.create({
        data: {
          name: "Other User",
          email: faker.internet.email(),
        },
      });

      const organization = await db.organization.create({
        data: {
          name: "Test Organization",
          ownerId: user.id,
        },
      });

      // Add both users as members
      await db.organizationMember.createMany({
        data: [
          {
            userId: user.id,
            organizationId: organization.id,
            role: "ADMIN",
          },
          {
            userId: otherUser.id,
            organizationId: organization.id,
            role: "MEMBER",
          },
        ],
      });

      const mockSession = {
        user,
        expires: "2030-12-31T23:59:59.999Z",
      };

      const caller = organizationRouter.createCaller({
        db: db,
        session: mockSession,
        headers: new Headers(),
      });

      const result = await caller.listByUser();

      expect(result).toHaveLength(1);
      expect(result[0]?.memberCount).toEqual(2);
    });
  });
});

describe("Organization Scoping - Request-based Context", () => {
    describe("getById", () => {
      it("should return organization details when user has access", async () => {
        const user = await db.user.create({
          data: {
            name: "Test User",
            email: faker.internet.email(),
          },
        });

        const organization = await db.organization.create({
          data: {
            name: "Test Organization",
            description: "Test description",
            ownerId: user.id,
          },
        });

        await db.organizationMember.create({
          data: {
            userId: user.id,
            organizationId: organization.id,
            role: "ADMIN",
          },
        });

        const mockSession = {
          user,
          expires: "2030-12-31T23:59:59.999Z",
        };

        const caller = organizationRouter.createCaller({
          db: db,
          session: mockSession,
          headers: new Headers(),
        });

        const result = await caller.getById({
          organizationId: organization.id,
        });

        expect(result.id).toBe(organization.id);
        expect(result.name).toBe("Test Organization");
        expect(result.description).toBe("Test description");
        expect(result.userRole).toBe("ADMIN");
        expect(result.memberCount).toBe(1);
      });

      it("should deny access when user is not a member", async () => {
        const owner = await db.user.create({
          data: {
            name: "Owner User",
            email: faker.internet.email(),
          },
        });

        const nonMember = await db.user.create({
          data: {
            name: "Non Member User",
            email: faker.internet.email(),
          },
        });

        const organization = await db.organization.create({
          data: {
            name: "Test Organization",
            ownerId: owner.id,
          },
        });

        await db.organizationMember.create({
          data: {
            userId: owner.id,
            organizationId: organization.id,
            role: "ADMIN",
          },
        });

        const mockSession = {
          user: nonMember,
          expires: "2030-12-31T23:59:59.999Z",
        };

        const caller = organizationRouter.createCaller({
          db: db,
          session: mockSession,
          headers: new Headers(),
        });

        await expect(caller.getById({
          organizationId: organization.id,
        })).rejects.toThrow("You do not have access to this organization");
      });
    });

    describe("listMembers", () => {
      it("should return organization members when user has access", async () => {
        const admin = await db.user.create({
          data: {
            name: "Admin User",
            email: faker.internet.email(),
          },
        });

        const member = await db.user.create({
          data: {
            name: "Member User",
            email: faker.internet.email(),
          },
        });

        const organization = await db.organization.create({
          data: {
            name: "Test Organization",
            ownerId: admin.id,
          },
        });

        await db.organizationMember.createMany({
          data: [
            {
              userId: admin.id,
              organizationId: organization.id,
              role: "ADMIN",
            },
            {
              userId: member.id,
              organizationId: organization.id,
              role: "MEMBER",
            },
          ],
        });

        const mockSession = {
          user: admin,
          expires: "2030-12-31T23:59:59.999Z",
        };

        const caller = organizationRouter.createCaller({
          db: db,
          session: mockSession,
          headers: new Headers(),
        });

        const result = await caller.listMembers({
          organizationId: organization.id,
        });

        expect(result).toHaveLength(2);
        
        const adminMember = result.find(m => m.user.id === admin.id);
        const regularMember = result.find(m => m.user.id === member.id);

        expect(adminMember?.role).toBe("ADMIN");
        expect(adminMember?.user.name).toBe("Admin User");
        
        expect(regularMember?.role).toBe("MEMBER");
        expect(regularMember?.user.name).toBe("Member User");
      });

      it("should deny access when user is not a member", async () => {
        const owner = await db.user.create({
          data: {
            name: "Owner User",
            email: faker.internet.email(),
          },
        });

        const nonMember = await db.user.create({
          data: {
            name: "Non Member User",
            email: faker.internet.email(),
          },
        });

        const organization = await db.organization.create({
          data: {
            name: "Test Organization",
            ownerId: owner.id,
          },
        });

        await db.organizationMember.create({
          data: {
            userId: owner.id,
            organizationId: organization.id,
            role: "ADMIN",
          },
        });

        const mockSession = {
          user: nonMember,
          expires: "2030-12-31T23:59:59.999Z",
        };

        const caller = organizationRouter.createCaller({
          db: db,
          session: mockSession,
          headers: new Headers(),
        });

        await expect(caller.listMembers({
          organizationId: organization.id,
        })).rejects.toThrow("You do not have access to this organization");
      });
    });

    describe("removeMember (Admin Operations)", () => {
      it("should allow admin to remove members", async () => {
        const admin = await db.user.create({
          data: {
            name: "Admin User",
            email: faker.internet.email(),
          },
        });

        const member = await db.user.create({
          data: {
            name: "Member User",
            email: faker.internet.email(),
          },
        });

        const organization = await db.organization.create({
          data: {
            name: "Test Organization",
            ownerId: admin.id,
          },
        });

        await db.organizationMember.createMany({
          data: [
            {
              userId: admin.id,
              organizationId: organization.id,
              role: "ADMIN",
            },
            {
              userId: member.id,
              organizationId: organization.id,
              role: "MEMBER",
            },
          ],
        });

        const mockSession = {
          user: admin,
          expires: "2030-12-31T23:59:59.999Z",
        };

        const caller = organizationRouter.createCaller({
          db: db,
          session: mockSession,
          headers: new Headers(),
        });

        const result = await caller.removeMember({
          organizationId: organization.id,
          userId: member.id,
        });

        expect(result.userId).toBe(member.id);
        expect(result.organizationId).toBe(organization.id);

        // Verify member was actually removed
        const remainingMembers = await db.organizationMember.findMany({
          where: { organizationId: organization.id },
        });
        expect(remainingMembers).toHaveLength(1);
        expect(remainingMembers[0]?.userId).toBe(admin.id);
      });

      it("should deny member removal for non-admin users", async () => {
        const admin = await db.user.create({
          data: {
            name: "Admin User",
            email: faker.internet.email(),
          },
        });

        const member1 = await db.user.create({
          data: {
            name: "Member User 1",
            email: faker.internet.email(),
          },
        });

        const member2 = await db.user.create({
          data: {
            name: "Member User 2",
            email: faker.internet.email(),
          },
        });

        const organization = await db.organization.create({
          data: {
            name: "Test Organization",
            ownerId: admin.id,
          },
        });

        await db.organizationMember.createMany({
          data: [
            {
              userId: admin.id,
              organizationId: organization.id,
              role: "ADMIN",
            },
            {
              userId: member1.id,
              organizationId: organization.id,
              role: "MEMBER",
            },
            {
              userId: member2.id,
              organizationId: organization.id,
              role: "MEMBER",
            },
          ],
        });

        const mockSession = {
          user: member1, // Non-admin user trying to remove another member
          expires: "2030-12-31T23:59:59.999Z",
        };

        const caller = organizationRouter.createCaller({
          db: db,
          session: mockSession,
          headers: new Headers(),
        });

        await expect(caller.removeMember({
          organizationId: organization.id,
          userId: member2.id,
        })).rejects.toThrow("Admin access required for this operation");
      });

      it("should prevent removing the organization owner", async () => {
        const owner = await db.user.create({
          data: {
            name: "Owner User",
            email: faker.internet.email(),
          },
        });

        const organization = await db.organization.create({
          data: {
            name: "Test Organization",
            ownerId: owner.id,
          },
        });

        await db.organizationMember.create({
          data: {
            userId: owner.id,
            organizationId: organization.id,
            role: "ADMIN",
          },
        });

        const mockSession = {
          user: owner,
          expires: "2030-12-31T23:59:59.999Z",
        };

        const caller = organizationRouter.createCaller({
          db: db,
          session: mockSession,
          headers: new Headers(),
        });

        await expect(caller.removeMember({
          organizationId: organization.id,
          userId: owner.id,
        })).rejects.toThrow("Cannot remove the organization owner");
      });
    });

    describe("Multi-organization Context Validation", () => {
      it("should validate access independently for different organizations", async () => {
        const user = await db.user.create({
          data: {
            name: "Test User",
            email: faker.internet.email(),
          },
        });

        const org1 = await db.organization.create({
          data: {
            name: "Organization 1",
            ownerId: user.id,
          },
        });

        const org2 = await db.organization.create({
          data: {
            name: "Organization 2",
            ownerId: user.id,
          },
        });

        // User is admin of org1, member of org2
        await db.organizationMember.createMany({
          data: [
            {
              userId: user.id,
              organizationId: org1.id,
              role: "ADMIN",
            },
            {
              userId: user.id,
              organizationId: org2.id,
              role: "MEMBER",
            },
          ],
        });

        const mockSession = {
          user,
          expires: "2030-12-31T23:59:59.999Z",
        };

        const caller = organizationRouter.createCaller({
          db: db,
          session: mockSession,
          headers: new Headers(),
        });

        // Should access org1 with ADMIN role
        const result1 = await caller.getById({
          organizationId: org1.id,
        });
        expect(result1.userRole).toBe("ADMIN");

        // Should access org2 with MEMBER role
        const result2 = await caller.getById({
          organizationId: org2.id,
        });
        expect(result2.userRole).toBe("MEMBER");

        // Each request should be independently validated
        const result1Again = await caller.getById({
          organizationId: org1.id,
        });
        expect(result1Again.userRole).toBe("ADMIN");
      });
    });
  });