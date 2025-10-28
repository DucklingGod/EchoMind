import { type User, type InsertUser, type Reflection, users, reflections } from "../shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  initialize?: () => Promise<void>;
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createReflection(userId: string, reflection: Omit<Reflection, "id" | "userId" | "createdAt">): Promise<Reflection>;
  getReflections(userId: string): Promise<Reflection[]>;
  deleteReflection(userId: string, id: string): Promise<boolean>;
  deleteAllReflections(userId: string): Promise<boolean>;
}

export class PgStorage implements IStorage {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    // Ensure default user exists
    const defaultUserId = "default-user";
    const existingUser = await this.getUser(defaultUserId);
    
    if (!existingUser) {
      await db.insert(users).values({
        id: defaultUserId,
        plan: "free",
        settings: null,
      }).onConflictDoNothing();
    }
    
    this.initialized = true;
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const result = await db.insert(users).values({
      id,
      plan: insertUser.plan || "free",
      settings: insertUser.settings || null,
    }).returning();
    return result[0];
  }

  async createReflection(
    userId: string,
    reflection: Omit<Reflection, "id" | "userId" | "createdAt">
  ): Promise<Reflection> {
    const id = randomUUID();
    const result = await db.insert(reflections).values({
      id,
      userId,
      ...reflection,
    }).returning();
    return result[0];
  }

  async getReflections(userId: string): Promise<Reflection[]> {
    return await db
      .select()
      .from(reflections)
      .where(eq(reflections.userId, userId))
      .orderBy(desc(reflections.createdAt));
  }

  async deleteReflection(userId: string, id: string): Promise<boolean> {
    const result = await db
      .delete(reflections)
      .where(eq(reflections.id, id))
      .returning();
    return result.length > 0;
  }

  async deleteAllReflections(userId: string): Promise<boolean> {
    await db.delete(reflections).where(eq(reflections.userId, userId));
    return true;
  }
}

export const storage = new PgStorage();
