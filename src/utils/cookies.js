export const cookies = {
  getOptions: () => {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    };
  },
  set: (res, name, value, options = {}) => {
    options = { ...cookies.getOptions(), ...options };
    res.cookie(name, value, options);
  },
  clear: (res, name, options = {}) => {
    options = { ...cookies.getOptions(), ...options };
    res.clearCookie(name, options);
  },
  get: (req, name) => {
    return req.cookies[name];
  },
};
