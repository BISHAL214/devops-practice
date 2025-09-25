import logger from '#config/logger.js';
import bcrypt from 'bcrypt';
import { db } from '#config/database.js';
import { eq } from 'drizzle-orm';
import { Users } from '#models/user.model.js';

export const hashPassword = async password => {
  // Simulate password hashing
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw new Error('Password hashing failed');
  }
};
export const verifyPassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    logger.error('Error verifying password:', error);
    throw new Error('Password verification failed');
  }
};
export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    const existingUser = await db
      .select()
      .from(Users)
      .where(eq(Users.email, email))
      .limit(1);
    if (existingUser.length > 0) {
      throw new Error('Users email already exists');
    }
    const hashedPassword = await hashPassword(password);
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date(),
    };
    const [createdUser] = await db.insert(Users).values(newUser).returning({
      id: Users.id,
      name: Users.name,
      email: Users.email,
      role: Users.role,
      created_at: Users.createdAt,
    });
    logger.info(`User created with email: ${email}, role: ${role}`);
    return createdUser;
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
};
export const authenticateUser = async ({ email, password }) => {
  try {
    const user = await db
      .select()
      .from(Users)
      .where(eq(Users.email, email))
      .limit(1);
    if (user.length === 0) {
      throw new Error('User not found');
    }
    const isValidPassword = await verifyPassword(password, user[0].password);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }
    return user[0];
  } catch (error) {
    logger.error('Error authenticating user:', error);
    throw error;
  }
};
