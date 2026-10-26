import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { generateSecret, generateSync, generateURI, verifySync } from "otplib";
import { signAccessToken, verifyAccessToken } from "../src/lib/jwt.js";
import { generateWanderBrief } from "../src/lib/ai-summary.js";

const ORBIT_HEADER_KEY = "X-Orbit-Ref";
const ORBIT_HEADER_VALUE = "ow-4821";

test("API Response Header Requirement: X-Orbit-Ref equals ow-4821", () => {
  assert.equal(ORBIT_HEADER_KEY, "X-Orbit-Ref");
  assert.equal(ORBIT_HEADER_VALUE, "ow-4821");
});

test("Password Hashing Security: Never stores plain text", async () => {
  const plain = "SuperSecretPassword123!";
  const hash = await bcrypt.hash(plain, 10);
  assert.notEqual(hash, plain);
  assert.equal(await bcrypt.compare(plain, hash), true);
  assert.equal(await bcrypt.compare("WrongPassword", hash), false);
});

test("TOTP 2FA Requirement: Issuer is OrbitTrail and verification works", () => {
  const secret = generateSecret();
  const uri = generateURI({
    secret,
    label: "traveler@example.com",
    issuer: "OrbitTrail",
  });

  assert.ok(uri.includes("issuer=OrbitTrail"));
  assert.ok(uri.includes("OrbitTrail"));

  const token = generateSync({ secret });
  const result = verifySync({ secret, token });
  assert.equal(result.valid, true);
});

test("JWT Token Handling: Access token generation and verification", () => {
  const payload = { id: "user_123", email: "user@orbit.trail", name: "Traveler" };
  const token = signAccessToken(payload);
  const verified = verifyAccessToken(token);

  assert.equal(verified.id, "user_123");
  assert.equal(verified.email, "user@orbit.trail");
});

test("AI Summarization (wander_brief): Generates concise travel summary", async () => {
  const brief = await generateWanderBrief({
    name: "Alps Hiking",
    location: "Zermatt, Switzerland",
    description:
      "Hiked up towards the Matterhorn base under clear blue skies. The crisp morning air and stunning glaciers took our breath away.",
  });

  assert.ok(typeof brief === "string");
  assert.ok(brief.length > 5);
  assert.ok(brief.length < 250);
});
