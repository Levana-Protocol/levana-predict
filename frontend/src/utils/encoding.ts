// https://developer.mozilla.org/en-US/docs/Glossary/Base64
const signedBytesEncode = (bytes: Uint8Array): string => {
  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte),
  ).join("")
  return btoa(binString)
}

const utf8Encode = (payload: any) => {
  return new TextEncoder().encode(JSON.stringify(payload))
}

export { signedBytesEncode, utf8Encode }
