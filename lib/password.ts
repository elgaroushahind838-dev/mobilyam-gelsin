import { scrypt, timingSafeEqual } from "crypto";

const SALT = "mobilyam-gelsin-login-v1";

function derive(value: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(value, SALT, 32, { N: 16384, r: 8, p: 1 }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function passwordMatches(input: string, expected: string): Promise<boolean> {
  const [left, right] = await Promise.all([derive(input), derive(expected)]);
  return timingSafeEqual(left, right);
}
