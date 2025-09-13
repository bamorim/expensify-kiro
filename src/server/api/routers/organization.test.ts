import { describe, it, expect, vi, beforeEach } from "vitest";
import { organizationRouter, createOrganizationSchema } from "./organization";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { faker } from "@faker-js/faker";
import { TRPCError } from "@trpc/server";

// Mock the database to use the transactional testing wrapper
vi.mock("~/server/db");

// Mock the auth module
vi.mock("~/server/auth", () => ({
  auth: vi.fn(),
}));

const mockAuth = vi.mocked(auth);

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