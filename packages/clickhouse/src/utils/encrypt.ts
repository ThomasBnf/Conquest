import { env } from "@conquest/env";

const ALGORITHM = "AES-GCM" as const;
const IV_LENGTH = 12;
const secretKey = env.ENCRYPTION_SECRET;

type EncryptionResult = {
  token: string;
  iv: string;
};

export const encrypt = async (token: string): Promise<EncryptionResult> => {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encodedData = new TextEncoder().encode(JSON.stringify(token));

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secretKey),
    ALGORITHM,
    false,
    ["encrypt"],
  );

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encodedData,
  );

  const encryptedData = btoa(
    String.fromCharCode(...new Uint8Array(encryptedBuffer)),
  );
  const ivHex = Array.from(iv)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return {
    token: encryptedData,
    iv: ivHex,
  };
};
