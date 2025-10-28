import { type User, type InsertUser, type Reflection, users, reflections } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createReflection(userId: string, reflection: Omit<Reflection, "id" | "userId" | "createdAt">): Promise<Reflection>;
  getReflections(userId: string): Promise<Reflection[]>;
  deleteReflection(userId: string, id: string): Promise<boolean>;
  deleteAllReflections(userId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private reflections: Map<string, Reflection>;

  constructor() {
    this.users = new Map();
    this.reflections = new Map();
    
    const defaultUser: User = {
      id: "default-user",
      createdAt: new Date(),
      plan: "free",
      settings: null,
    };
    this.users.set(defaultUser.id, defaultUser);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      createdAt: new Date(),
      plan: insertUser.plan || "free",
      settings: insertUser.settings || null,
    };
    this.users.set(id, user);
    return user;
  }

  async createReflection(
    userId: string,
    reflection: Omit<Reflection, "id" | "userId" | "createdAt">
  ): Promise<Reflection> {
    const id = randomUUID();
    const newReflection: Reflection = {
      ...reflection,
      id,
      userId,
      createdAt: new Date(),
    };
    this.reflections.set(id, newReflection);
    return newReflection;
  }

  async getReflections(userId: string): Promise<Reflection[]> {
    return Array.from(this.reflections.values())
      .filter((r) => r.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async deleteReflection(userId: string, id: string): Promise<boolean> {
    const reflection = this.reflections.get(id);
    if (!reflection || reflection.userId !== userId) {
      return false;
    }
    return this.reflections.delete(id);
  }

  async deleteAllReflections(userId: string): Promise<boolean> {
    const userReflections = Array.from(this.reflections.entries())
      .filter(([, r]) => r.userId === userId);
    
    userReflections.forEach(([id]) => {
      this.reflections.delete(id);
    });
    
    return true;
  }
}

export class PgStorage implements IStorage {
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
      .where(and(eq(reflections.id, id), eq(reflections.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async deleteAllReflections(userId: string): Promise<boolean> {
    await db.delete(reflections).where(eq(reflections.userId, userId));
    return true;
  }

  async initialize() {
    try {
      const existingUser = await this.getUser("default-user");
      if (!existingUser) {
        await db.insert(users).values({
          id: "default-user",
          plan: "free",
        });
      }
    } catch (error) {
      // Ignore duplicate key errors - user already exists
      if (error.code !== '23505') {
        throw error;
      }
    }
  }
}

export const storage = new PgStorage();

// Initialize storage immediately
storage.initialize().catch(err => {
  console.error("Failed to initialize storage:", err);
});
