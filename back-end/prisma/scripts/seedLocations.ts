// back-end/prisma/scripts/seedLocations.ts
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import { prisma } from '~/lib/prisma'

type WardData = { code: string; name: string }
type ProvinceData = { code: string; name: string; wards: WardData[] }

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, '../data/vn-locations.sample.json')

async function seedLocations() {
  const provinces: ProvinceData[] = JSON.parse(readFileSync(DATA_FILE, 'utf-8'))

  let provinceCount = 0
  let wardCount = 0

  for (const province of provinces) {
    await prisma.province.upsert({
      where: { code: province.code },
      update: { name: province.name },
      create: { code: province.code, name: province.name },
    })
    provinceCount++

    for (const ward of province.wards) {
      await prisma.ward.upsert({
        where: { code: ward.code },
        update: { name: ward.name, provinceCode: province.code },
        create: { code: ward.code, name: ward.name, provinceCode: province.code },
      })
      wardCount++
    }
  }

  console.log(`Seeded ${provinceCount} provinces, ${wardCount} wards (sample dataset).`)
}

seedLocations()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
