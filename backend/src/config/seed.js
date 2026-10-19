const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: 'admin@company.com' } });
  if (existing) {
    console.log('Admin already exists, skipping seed.');
    return;
  }

  const hashed = await bcrypt.hash('Admin@1234', 10);
  await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@company.com',
      password: hashed,
      role: 'ADMIN',
    },
  });

  console.log('Seeded default admin: admin@company.com / Admin@1234');
  console.log('IMPORTANT: Change the admin password after first login!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
