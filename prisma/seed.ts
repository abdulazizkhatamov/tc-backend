import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';
import { PrismaClient, UserRole } from 'generated/prisma/client';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPER_USER_EMAIL as string;
  const password = process.env.SUPER_USER_PASSWORD as string;

  if (!email || !password) {
    console.error('❌ SUPER_USER_EMAIL or SUPER_USER_PASSWORD not set in .env');
    process.exit(1);
  }

  // Hash the password
  const hashedPassword = await argon2.hash(password);

  // Use a transaction to ensure atomicity
  await prisma.$transaction(async (tx) => {
    // Lock table to prevent race condition (PostgreSQL)
    // Note: Optional, only if using Postgres. MySQL/MariaDB needs a different approach.
    // await tx.$executeRaw`LOCK TABLE "User" IN ACCESS EXCLUSIVE MODE`;

    // Check if any super user exists
    const superUser = await tx.user.findFirst({
      where: {
        roles: { has: UserRole.ADMIN },
      },
    });

    if (!superUser) {
      await tx.user.create({
        data: {
          name: 'Super User',
          email,
          password: hashedPassword,
          roles: [UserRole.ADMIN],
        },
      });
      console.log(`✅ Super user created: ${email}`);
    } else {
      console.log(
        `ℹ️ Super user already exists with email: ${superUser.email}`,
      );
    }
  });
}

main()
  .catch((e) => {
    console.error('❌ Seed script failed:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
