import { defineConfig } from '@prisma/config'

export default defineConfig({
  schema: 'prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: 'postgresql://imobvirtual:imobvirtual@localhost:5432/imobvirtual',
  },
})
