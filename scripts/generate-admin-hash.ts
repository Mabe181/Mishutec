import { hashPassword } from "../src/lib/auth/password";

const password = process.argv[2] || "Mishutec2026!Admin";
const hash = hashPassword(password);

console.log("================================================================================");
console.log("            GENERADOR DE HASH ADMINISTRATIVO PARA .env.local                   ");
console.log("================================================================================");
console.log(`Contraseña de entrada: "${password}"`);
console.log(`Hash generado (scrypt con salt):`);
console.log(`\nADMIN_PASSWORD_HASH=${hash}\n`);
console.log("Copie y pegue esta línea en su archivo .env.local junto con:");
console.log("ADMIN_USERNAME=admin");
console.log(`AUTH_SESSION_SECRET=${require("crypto").randomBytes(32).toString("hex")}`);
console.log("================================================================================");
