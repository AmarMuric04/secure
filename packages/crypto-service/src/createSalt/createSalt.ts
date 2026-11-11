import { toHex } from "../encoding";

const createSalt = () => toHex(crypto.getRandomValues(new Uint8Array(32)));

export { createSalt };
