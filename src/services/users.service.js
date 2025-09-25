import logger from '#config/logger.js';
import { db } from '#config/database.js';
import { Users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';

export const getAllUsers = async () => {
  try {
    return await db
      .select({
        id: Users.id,
        email: Users.email,
        name: Users.name,
        role: Users.role,
        created_at: Users.createdAt,
        updated_at: Users.updatedAt,
      })
      .from(Users);
  } catch (e) {
    logger.error('Error getting users', e);
    throw e;
  }
};

export const getUserById = async id => {
  try {
    const [user] = await db
      .select({
        id: Users.id,
        email: Users.email,
        name: Users.name,
        role: Users.role,
        created_at: Users.createdAt,
        updated_at: Users.updatedAt,
      })
      .from(Users)
      .where(eq(Users.id, id))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (e) {
    logger.error(`Error getting user by id ${id}:`, e);
    throw e;
  }
};

export const updateUser = async (id, updates) => {
  try {
    // First check if user exists
    const existingUser = await getUserById(id);

    // Check if email is being updated and if it already exists
    if (updates.email && updates.email !== existingUser.email) {
      const [emailExists] = await db
        .select()
        .from(Users)
        .where(eq(Users.email, updates.email))
        .limit(1);
      if (emailExists) {
        throw new Error('Email already exists');
      }
    }

    // Add updated_at timestamp
    const updateData = {
      ...updates,
      updated_at: new Date(),
    };

    const [updatedUser] = await db
      .update(Users)
      .set(updateData)
      .where(eq(Users.id, id))
      .returning({
        id: Users.id,
        email: Users.email,
        name: Users.name,
        role: Users.role,
        created_at: Users.createdAt,
        updated_at: Users.updatedAt,
      });

    logger.info(`User ${updatedUser.email} updated successfully`);
    return updatedUser;
  } catch (e) {
    logger.error(`Error updating user ${id}:`, e);
    throw e;
  }
};

export const deleteUser = async id => {
  try {
    // First check if user exists
    await getUserById(id);

    const [deletedUser] = await db
      .delete(Users)
      .where(eq(Users.id, id))
      .returning({
        id: Users.id,
        email: Users.email,
        name: Users.name,
        role: Users.role,
      });

    logger.info(`User ${deletedUser.email} deleted successfully`);
    return deletedUser;
  } catch (e) {
    logger.error(`Error deleting user ${id}:`, e);
    throw e;
  }
};
