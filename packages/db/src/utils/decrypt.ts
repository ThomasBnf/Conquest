import { env } from "@conquest/env";

const ALGORITHM = "AES-GCM" as const;
const secretKey = env.ENCRYPTION_SECRET;

type DecryptionInput = {
  accessToken: string;
  iv: string;
};

export const decrypt = async ({
  accessToken,
  iv,
}: DecryptionInput): Promise<string> => {
  const ivArray = new Uint8Array(
    iv.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? [],
  );

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secretKey),
    ALGORITHM,
    false,
    ["decrypt"],
  );

  const encryptedBuffer = new Uint8Array(
    Array.from(atob(accessToken)).map((char) => char.charCodeAt(0)),
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: ivArray },
    key,
    encryptedBuffer,
  );

  const decryptedData = new TextDecoder().decode(decryptedBuffer);

  return JSON.parse(decryptedData);
};
