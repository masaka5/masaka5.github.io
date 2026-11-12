export const CHUNK_SIZE = 262144;
export const MAX_FILE_SIZE = 1024 ** 4;
export const validId = (value) =>
  typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
export const validOffset = (n, size) =>
  Number.isSafeInteger(n) &&
  n >= 0 &&
  n <= size &&
  (n === size || n % CHUNK_SIZE === 0);
export const hex = (bytes) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
export async function digest(bytes) {
  return hex(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)));
}
export function randomPassword() {
  return hex(crypto.getRandomValues(new Uint8Array(12)));
}
export async function deriveConnection(password) {
  if (
    typeof password !== "string" ||
    password.length < 12 ||
    password.length > 128
  )
    throw new Error("连接密码须为 12–128 个字符");
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = new Uint8Array(
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: new TextEncoder().encode("toolbox-file-transfer-v1"),
        iterations: 200000,
        hash: "SHA-256",
      },
      material,
      384,
    ),
  );
  return { room: hex(bits.slice(32)), key: hex(bits.slice(0, 32)) };
}
export function metadata(m) {
  if (
    !m ||
    !validId(m.id) ||
    m.hash !== m.id ||
    !Number.isSafeInteger(m.size) ||
    m.size < 0 ||
    m.size > MAX_FILE_SIZE ||
    typeof m.name !== "string" ||
    m.name.length > 255 ||
    typeof m.type !== "string" ||
    m.type.length > 127
  )
    throw new Error("文件信息无效");
  return {
    id: m.id,
    hash: m.id,
    name: m.name.replace(/[\\/\x00-\x1f\x7f]/g, "_") || "未命名文件",
    size: m.size,
    type: m.type,
  };
}
