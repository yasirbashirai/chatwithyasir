// Generate a bcrypt hash for your admin password:
//   node hash.js "your-strong-password"
// Then put the printed value in .env as ADMIN_PASSWORD_HASH.
import bcrypt from "bcryptjs";

const pw = process.argv[2];
if (!pw) {
  console.error('Usage: node hash.js "your-password"');
  process.exit(1);
}
console.log(bcrypt.hashSync(pw, 10));
