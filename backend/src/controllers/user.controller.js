const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const emailService = require('../services/email.service');

const prisma = new PrismaClient();

const listUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true, company: true, applications: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
};

const createUser = async (req, res) => {
  const { name, email, password, role, company, applications } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (exists) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: role === 'ADMIN' ? 'ADMIN' : 'USER',
      company: company || null,
      applications: applications || [],
    },
    select: { id: true, name: true, email: true, role: true, isActive: true, company: true, applications: true, createdAt: true },
  });

  emailService.sendCredentials(user, password).catch(() => {});

  res.status(201).json(user);
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, isActive, role } = req.body;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(isActive !== undefined && { isActive }),
      ...(role !== undefined && { role }),
    },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });

  res.json(updated);
};

const resetPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id }, data: { password: hashed } });

  emailService.sendCredentials(user, newPassword).catch(() => {});

  res.json({ message: 'Password reset successfully' });
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) {
    return res.status(400).json({ message: 'Cannot delete yourself' });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: { _count: { select: { tickets: true } } },
  });
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (user._count.tickets > 0) {
    return res.status(400).json({
      message: `Cannot delete a user with existing tickets (${user._count.tickets}). Deactivate them instead.`,
    });
  }

  await prisma.user.delete({ where: { id } });
  res.json({ message: 'User deleted' });
};

module.exports = { listUsers, createUser, updateUser, resetPassword, deleteUser };
