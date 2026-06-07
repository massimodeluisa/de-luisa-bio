import { pbkdf2, randomSaltHex } from './src/crypto'

const [user, slug, password] = process.argv.slice(2)
if (!user || !slug || !password) {
  console.error('usage: bun worker/hash-password.ts <user> <slug> <password>')
  process.exit(1)
}

const salt = randomSaltHex()
const passHash = await pbkdf2(password, salt)
console.log(JSON.stringify({ user, slug, salt, passHash }))
