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
export const getUserById = async id => {
  try {
    const user = await db
      .select({
        id: Users.id,
        name: Users.name,
        email: Users.email,
        role: Users.role,
        created_at: Users.createdAt,
      })
      .from(Users)
      .where(eq(Users.id, id))
      .limit(1);
    if (user.length === 0) {
      throw new Error('User not found');
    }
    return user[0];
  } catch (error) {
    logger.error('Error fetching user by ID:', error);
    throw error;
  }
};
export const getAllUsers = async () => {
  try {
    const users = await db
      .select({
        id: Users.id,
        name: Users.name,
        email: Users.email,
        role: Users.role,
        created_at: Users.createdAt,
      })
      .from(Users);
    return users;
  } catch (error) {
    logger.error('Error fetching all users:', error);
    throw error;
  }
};
export const deleteUserById = async id => {
  try {
    const deletedCount = await db
      .delete(Users)
      .where(eq(Users.id, id))
      .returning()
      .then(res => res.length);
    if (deletedCount === 0) {
      throw new Error('User not found or already deleted');
    }
    logger.info(`User with ID: ${id} deleted`);
    return deletedCount;
  } catch (error) {
    logger.error('Error deleting user by ID:', error);
    throw error;
  }
};
export const updateUserById = async (id, { name, email, password, role }) => {
  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (password) {
      updateData.password = await hashPassword(password);
    }
    const [updatedUser] = await db
      .update(Users)
      .set(updateData)
      .where(eq(Users.id, id))
      .returning({
        id: Users.id,
        name: Users.name,
        email: Users.email,
        role: Users.role,
        created_at: Users.createdAt,
      });
    if (!updatedUser) {
      throw new Error('User not found or no changes made');
    }
    logger.info(`User with ID: ${id} updated`);
    return updatedUser;
  } catch (error) {
    logger.error('Error updating user by ID:', error);
    throw error;
  }
};
