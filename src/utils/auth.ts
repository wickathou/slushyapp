import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET;

export const hashPassword = (password: string) => bcrypt.hash(password, saltRounds);
export const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);
export const generateToken = (userId: number) => jwt.sign({ userId }, jwtSecret, { expiresIn: '1h' });
export const verifyToken = (token: string) => jwt.verify(token, jwtSecret);
