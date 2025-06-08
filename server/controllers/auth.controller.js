import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prismaClient.js';
import { logEvent } from '../utils/logEvent.js';

const SECRET = process.env.JWT_SECRET || 'beltmar_secret';

// ===== Register User =====
export const registerUser = async (req, res) => {
  const { username, email, password, role = 'creator', name } = req.body;

  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
        status: 'active',
        profile: {
          create: {
            name: name || username,
            interests: [],
            socialLinks: {},
          }
        },
        roles: {
          create: [
            { role: 'platform.user' },
            { role: `role.${role}` }
          ]
        },
        sessions: {
          create: {
            device: req.headers['user-agent'] || 'unknown',
            ipAddress: req.ip,
          }
        },
        settings: {
          create: [
            { key: 'theme', value: 'light' },
            { key: 'notifications.enabled', value: 'true' }
          ]
        }
      },
      include: {
        profile: true,
        roles: true,
        sessions: true,
        settings: true
      }
    });

    await logEvent({
      userId: newUser.id,
      type: 'auth.register',
      targetId: newUser.id,
      targetType: 'User',
      metadata: {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }
    });

    res.status(201).json({ message: 'User registered successfully.', userId: newUser.id });
  } catch (error) {
    console.error('🔴 Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// ===== Login User =====
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        profile: true,
        roles: true
      }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Create session
    await prisma.userSession.create({
      data: {
        userId: user.id,
        device: req.headers['user-agent'] || 'unknown',
        ipAddress: req.ip,
      }
    });

    // Issue token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        organizationId: user.organizationId,
        roles: user.roles.map(r => r.role)
      },
      SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        profile: user.profile,
        role: user.role,
        organizationId: user.organizationId,
        roles: user.roles.map(r => r.role)
      }
    });
  } catch (error) {
    console.error('🔴 Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: true,
        roles: true,
        settings: true,
        organization: true,
      }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ user });
  } catch (error) {
    console.error('🔴 Get user error:', error);
    res.status(500).json({ message: 'Error retrieving user' });
  }
};

export const logoutUser = async (req, res) => {
  try {
    await prisma.userSession.deleteMany({
      where: {
        userId: req.user.id,
        device: req.headers['user-agent'] || undefined,
        ipAddress: req.ip || undefined,
      }
    });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('🔴 Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
};
