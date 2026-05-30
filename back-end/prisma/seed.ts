import { prisma } from '~/lib/prisma'
import { hashPassword } from '~/utils/password'

async function main() {
  await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: { name: 'USER' },
  })

  const password = await hashPassword('Password123!')
  const user = await prisma.user.upsert({
    where: { email: 'alice@prisma.io' },
    update: {
      name: 'Alice',
      password,
      isActive: true,
      role: {
        set: [{ name: 'USER' }],
      },
    },
    create: {
      name: 'Alice',
      email: 'alice@prisma.io',
      password,
      isActive: true,
      role: {
        connect: { name: 'USER' },
      },
    },
    omit: { password: true },
    include: { role: true },
  })

  const colorOption = await prisma.option.upsert({
    where: { name: 'Color' },
    update: {},
    create: { name: 'Color' },
  })

  const storageOption = await prisma.option.upsert({
    where: { name: 'Storage' },
    update: {},
    create: { name: 'Storage' },
  })

  const blackValue = await prisma.optionValue.upsert({
    where: {
      optionId_value: {
        optionId: colorOption.id,
        value: 'Black',
      },
    },
    update: {
      synonyms: ['Midnight', 'Space Black'],
    },
    create: {
      value: 'Black',
      synonyms: ['Midnight', 'Space Black'],
      option: {
        connect: { id: colorOption.id },
      },
    },
  })

  const storageValue = await prisma.optionValue.upsert({
    where: {
      optionId_value: {
        optionId: storageOption.id,
        value: '256GB',
      },
    },
    update: {
      synonyms: ['256 GB'],
    },
    create: {
      value: '256GB',
      synonyms: ['256 GB'],
      option: {
        connect: { id: storageOption.id },
      },
    },
  })

  const electronicsCategory = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {
      name: 'Electronics',
      description: 'Phones, tablets, computers, and related devices.',
    },
    create: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Phones, tablets, computers, and related devices.',
    },
  })

  const product = await prisma.product.upsert({
    where: { slug: 'iphone-15' },
    update: {
      name: 'iPhone 15',
      description: 'Sample SPU product with SKU variants.',
      category: {
        connect: { id: electronicsCategory.id },
      },
    },
    create: {
      name: 'iPhone 15',
      slug: 'iphone-15',
      description: 'Sample SPU product with SKU variants.',
      category: {
        connect: { id: electronicsCategory.id },
      },
    },
  })

  const variant = await prisma.productVariant.upsert({
    where: { sku: 'IPHONE15-BLACK-256GB' },
    update: {
      price: '999.00',
      stockQuantity: 25,
      product: {
        connect: { id: product.id },
      },
    },
    create: {
      sku: 'IPHONE15-BLACK-256GB',
      price: '999.00',
      stockQuantity: 25,
      product: {
        connect: { id: product.id },
      },
    },
  })

  await prisma.productVariantOptionValue.upsert({
    where: {
      productVariantId_optionValueId: {
        productVariantId: variant.id,
        optionValueId: blackValue.id,
      },
    },
    update: {},
    create: {
      productVariant: {
        connect: { id: variant.id },
      },
      optionValue: {
        connect: { id: blackValue.id },
      },
    },
  })

  await prisma.productVariantOptionValue.upsert({
    where: {
      productVariantId_optionValueId: {
        productVariantId: variant.id,
        optionValueId: storageValue.id,
      },
    },
    update: {},
    create: {
      productVariant: {
        connect: { id: variant.id },
      },
      optionValue: {
        connect: { id: storageValue.id },
      },
    },
  })

  const seededProduct = await prisma.product.findUnique({
    where: { id: product.id },
    include: {
      category: true,
      variants: {
        include: {
          options: {
            include: {
              optionValue: {
                include: {
                  option: true,
                },
              },
            },
          },
        },
      },
    },
  })

  console.log('Seeded user:', user)
  console.log('Seeded product:', JSON.stringify(seededProduct, null, 2))
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
