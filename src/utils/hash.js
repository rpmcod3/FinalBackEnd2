
import bcrypt from "bcrypt";

const SALT_ROUND = 10;

export async function createHash(password) {
  const salt = await bcrypt.genSalt(SALT_ROUND); 
  return await bcrypt.hash(password, salt);
}

export async function verifyPassword(password, hash) {
  const isPasswordCorrect = await bcrypt.compare(password, hash);
  return isPasswordCorrect; 

}


