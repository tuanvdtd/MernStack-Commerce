import { prisma } from '~/lib/prisma'
import { hashPassword } from '~/utils/password'

const SEED_PASSWORD = 'tuan1234'

const USERS = [
  {
    email: 'chuhoi09.dt@gmail.com',
    name: 'User',
    roleName: 'USER' as const,
  },
  {
    email: 'admin.tuan@gmail.com',
    name: 'Admin',
    roleName: 'ADMIN' as const,
  },
] as const

async function seedRoles() {
  for (const name of ['USER', 'ADMIN'] as const) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }
}

async function seedUsers(password: string) {
  const seededUsers = []

  for (const account of USERS) {
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {
        name: account.name,
        password,
        isActive: true,
        role: { connect: { name: account.roleName } },
      },
      create: {
        name: account.name,
        email: account.email,
        password,
        isActive: true,
        role: { connect: { name: account.roleName } },
      },
      omit: { password: true },
      include: { role: true },
    })
    seededUsers.push(user)
  }

  return seededUsers
}

async function main() {
  await seedRoles()

  const password = await hashPassword(SEED_PASSWORD)
  const users = await seedUsers(password)

  console.log('Seed password:', SEED_PASSWORD)
  console.log('Seeded users:', users)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
