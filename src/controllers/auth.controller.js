import logger from '#config/logger.js';
import { signInSchema, signUpSchema } from '#validations/auth.validations.js';
import { formatValidationError } from '#utils/format.js';
import { authenticateUser, createUser } from '#services/auth.service.js';
import { jwtToken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';

export const signUp = async (req, res, next) => {
  try {
    // Your sign-up logic here
    const validationResult = signUpSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: formatValidationError(validationResult.error),
      });
    }
    // Simulate user creation
    const { name, email, password, role } = validationResult.data;

    // call auth service to create user
    const newUser = await createUser({ name, email, password, role });
    const token = jwtToken.sign({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });
    cookies.set(res, 'token', token);
    // logger
    logger.info(`User signed up with email: ${email}, role: ${role}`);
    res
      .status(201)
      .json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    logger.error('Error in signUp controller:', error);
    if (error.message === 'Users email already exists') {
      res.status(400).json({
        message: error.message,
      });
    }
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    // Your sign-in logic here
    const validationResult = signInSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: formatValidationError(validationResult.error),
      });
    }
    // user authentication
    const { email, password } = validationResult.data;
    const user = await authenticateUser({ email, password });
    const token = jwtToken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    cookies.set(res, 'token', token);
    // logger
    logger.info(`User signed in with email: ${email}, role: ${user.role}`);

    res.status(200).json({
      message: 'Sign-in successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Error in signIn controller:', error);
    if (
      error.message === 'User not found' ||
      error.message === 'Invalid password'
    ) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    // Your sign-out logic here
    cookies.clear(res, 'token');
    logger.info('User signed out');
    res.status(200).json({ message: 'Sign-out successful' });
  } catch (error) {
    logger.error('Error in signOut controller:', error);
    next(error);
  }
};
