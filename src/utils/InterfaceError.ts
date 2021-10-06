import { Colors } from "../deps.ts";

class InterfaceError extends Error {
  constructor(msg: string) {
    super(msg);
  }

  toString(): string {
    return `❌ ${Colors.red(this.message)}`;
  }
}

export default InterfaceError;
