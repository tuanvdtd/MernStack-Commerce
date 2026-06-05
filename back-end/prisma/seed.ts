import { prisma } from '~/lib/prisma'
import { hashPassword } from '~/utils/password'

const SEED_PASSWORD = 'Password123!'

async function seedRoles() {
  const roles = ['USER', 'ADMIN'] as const

  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }
}

async function seedUsers(password: string) {
  const alice = await prisma.user.upsert({
    where: { email: 'alice@prisma.io' },
    update: {
      name: 'Alice',
      password,
      isActive: true,
      phone: '+84901234567',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      role: { set: [{ name: 'USER' }] },
    },
    create: {
      name: 'Alice',
      email: 'alice@prisma.io',
      password,
      isActive: true,
      phone: '+84901234567',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      role: { connect: { name: 'USER' } },
    },
    omit: { password: true },
    include: { role: true },
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@prisma.io' },
    update: {
      name: 'Admin',
      password,
      isActive: true,
      role: { set: [{ name: 'ADMIN' }, { name: 'USER' }] },
    },
    create: {
      name: 'Admin',
      email: 'admin@prisma.io',
      password,
      isActive: true,
      role: { connect: [{ name: 'ADMIN' }, { name: 'USER' }] },
    },
    omit: { password: true },
    include: { role: true },
  })

  await prisma.address.deleteMany({ where: { userId: alice.id } })
  await prisma.address.createMany({
    data: [
      { userId: alice.id, street: '123 Nguyen Hue', city: 'Ho Chi Minh City' },
      { userId: alice.id, street: '45 Le Loi', city: 'Da Nang' },
    ],
  })

  return { alice, admin }
}

async function seedOptions() {
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

  const optionValues = {
    black: await prisma.optionValue.upsert({
      where: { optionId_value: { optionId: colorOption.id, value: 'Black' } },
      update: { synonyms: ['Midnight', 'Space Black'] },
      create: {
        value: 'Black',
        synonyms: ['Midnight', 'Space Black'],
        option: { connect: { id: colorOption.id } },
      },
    }),
    white: await prisma.optionValue.upsert({
      where: { optionId_value: { optionId: colorOption.id, value: 'White' } },
      update: { synonyms: ['Starlight', 'Silver'] },
      create: {
        value: 'White',
        synonyms: ['Starlight', 'Silver'],
        option: { connect: { id: colorOption.id } },
      },
    }),
    storage128: await prisma.optionValue.upsert({
      where: { optionId_value: { optionId: storageOption.id, value: '128GB' } },
      update: { synonyms: ['128 GB'] },
      create: {
        value: '128GB',
        synonyms: ['128 GB'],
        option: { connect: { id: storageOption.id } },
      },
    }),
    storage256: await prisma.optionValue.upsert({
      where: { optionId_value: { optionId: storageOption.id, value: '256GB' } },
      update: { synonyms: ['256 GB'] },
      create: {
        value: '256GB',
        synonyms: ['256 GB'],
        option: { connect: { id: storageOption.id } },
      },
    }),
  }

  return optionValues
}

async function seedCategories() {
  const electronics = await prisma.category.upsert({
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

  const fashion = await prisma.category.upsert({
    where: { slug: 'fashion' },
    update: {
      name: 'Fashion',
      description: 'Clothing, shoes, and accessories.',
    },
    create: {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Clothing, shoes, and accessories.',
    },
  })

  return { electronics, fashion }
}

async function seedProducts(
  electronicsId: string,
  optionValues: Awaited<ReturnType<typeof seedOptions>>,
) {
  const iphone15 = await prisma.product.upsert({
    where: { slug: 'iphone-15' },
    update: {
      name: 'iPhone 15',
      brand: 'Apple',
      description: '6.1-inch display, A16 Bionic chip, USB-C, and advanced dual-camera system.',
      imgUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-black',
      isActive: true,
      category: { connect: { id: electronicsId } },
    },
    create: {
      name: 'iPhone 15',
      slug: 'iphone-15',
      brand: 'Apple',
      description: '6.1-inch display, A16 Bionic chip, USB-C, and advanced dual-camera system.',
      imgUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-black',
      isActive: true,
      category: { connect: { id: electronicsId } },
    },
  })

  const variantBlack256 = await prisma.productVariant.upsert({
    where: { sku: 'IPHONE15-BLACK-256GB' },
    update: {
      price: '999.00',
      stockQuantity: 25,
      imgUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-black',
      product: { connect: { id: iphone15.id } },
    },
    create: {
      sku: 'IPHONE15-BLACK-256GB',
      price: '999.00',
      stockQuantity: 25,
      imgUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-black',
      product: { connect: { id: iphone15.id } },
    },
  })

  const variantWhite128 = await prisma.productVariant.upsert({
    where: { sku: 'IPHONE15-WHITE-128GB' },
    update: {
      price: '899.00',
      stockQuantity: 40,
      imgUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-white',
      product: { connect: { id: iphone15.id } },
    },
    create: {
      sku: 'IPHONE15-WHITE-128GB',
      price: '899.00',
      stockQuantity: 40,
      imgUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-white',
      product: { connect: { id: iphone15.id } },
    },
  })

  const variantOptionLinks = [
    { variant: variantBlack256, values: [optionValues.black, optionValues.storage256] },
    { variant: variantWhite128, values: [optionValues.white, optionValues.storage128] },
  ]

  for (const { variant, values } of variantOptionLinks) {
    for (const optionValue of values) {
      await prisma.productVariantOptionValue.upsert({
        where: {
          productVariantId_optionValueId: {
            productVariantId: variant.id,
            optionValueId: optionValue.id,
          },
        },
        update: {},
        create: {
          productVariant: { connect: { id: variant.id } },
          optionValue: { connect: { id: optionValue.id } },
        },
      })
    }
  }

  return { iphone15, variantBlack256, variantWhite128 }
}

async function seedDiscounts(productId: string) {
  const welcomeDiscount = await prisma.discount.upsert({
    where: { code: 'WELCOME10' },
    update: {
      name: 'Welcome 10% Off',
      description: '10% off your first order, up to $100.',
      type: 'PERCENTAGE',
      value: '10.00',
      maxValue: '100.00',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      maxUses: 1000,
      maxUsesPerUser: 1,
      minOrderValue: '50.00',
      isActive: true,
      appliesTo: 'ALL',
    },
    create: {
      name: 'Welcome 10% Off',
      description: '10% off your first order, up to $100.',
      type: 'PERCENTAGE',
      value: '10.00',
      maxValue: '100.00',
      code: 'WELCOME10',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      maxUses: 1000,
      maxUsesPerUser: 1,
      minOrderValue: '50.00',
      isActive: true,
      appliesTo: 'ALL',
    },
  })

  const iphoneDiscount = await prisma.discount.upsert({
    where: { code: 'IPHONE50' },
    update: {
      name: 'iPhone $50 Off',
      description: '$50 off iPhone 15 variants.',
      type: 'FIXED_AMOUNT',
      value: '50.00',
      maxValue: '50.00',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      maxUses: 500,
      maxUsesPerUser: 2,
      minOrderValue: '500.00',
      isActive: true,
      appliesTo: 'SPECIFIC',
    },
    create: {
      name: 'iPhone $50 Off',
      description: '$50 off iPhone 15 variants.',
      type: 'FIXED_AMOUNT',
      value: '50.00',
      maxValue: '50.00',
      code: 'IPHONE50',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      maxUses: 500,
      maxUsesPerUser: 2,
      minOrderValue: '500.00',
      isActive: true,
      appliesTo: 'SPECIFIC',
    },
  })

  await prisma.discountProduct.upsert({
    where: {
      discountId_productId: {
        discountId: iphoneDiscount.id,
        productId,
      },
    },
    update: {},
    create: {
      discount: { connect: { id: iphoneDiscount.id } },
      product: { connect: { id: productId } },
    },
  })

  return { welcomeDiscount, iphoneDiscount }
}

async function seedCart(
  userId: number,
  variantId: string,
  variantName: string,
  variantPrice: string,
) {
  let cart = await prisma.cart.findFirst({
    where: { userId, state: 'ACTIVE' },
  })

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId, state: 'ACTIVE', countProduct: 1 },
    })
  } else {
    cart = await prisma.cart.update({
      where: { id: cart.id },
      data: { countProduct: 1 },
    })
  }

  await prisma.cartItem.upsert({
    where: {
      cartId_variantId: { cartId: cart.id, variantId },
    },
    update: {
      quantity: 1,
      price: variantPrice,
      name: variantName,
    },
    create: {
      cart: { connect: { id: cart.id } },
      variant: { connect: { id: variantId } },
      quantity: 1,
      price: variantPrice,
      name: variantName,
    },
  })

  return cart
}

async function main() {
  await seedRoles()

  const password = await hashPassword(SEED_PASSWORD)
  const { alice, admin } = await seedUsers(password)
  const optionValues = await seedOptions()
  await seedCategories()

  const { iphone15, variantBlack256 } = await seedProducts(
    (await prisma.category.findUniqueOrThrow({ where: { slug: 'electronics' } })).id,
    optionValues,
  )

  const discounts = await seedDiscounts(iphone15.id)
  const cart = await seedCart(
    alice.id,
    variantBlack256.id,
    'iPhone 15 - Black / 256GB',
    '999.00',
  )

  const seededProduct = await prisma.product.findUnique({
    where: { id: iphone15.id },
    include: {
      category: true,
      variants: {
        include: {
          options: {
            include: {
              optionValue: { include: { option: true } },
            },
          },
        },
      },
      discounts: { include: { discount: true } },
    },
  })

  console.log('Seed password for test users:', SEED_PASSWORD)
  console.log('Seeded users:', { alice, admin })
  console.log('Seeded discounts:', discounts)
  console.log('Seeded cart id:', cart.id)
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
