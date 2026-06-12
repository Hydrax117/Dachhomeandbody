import { defineConfig } from "prisma/config"
import * as fs from "fs"
import * as path from "path"

// Load .env manually since Prisma config skips automatic env loading
const envPath = path.resolve(process.cwd(), ".env")
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIdx = trimmed.indexOf("=")
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "")
    if (!(key in process.env)) process.env[key] = val
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
})
