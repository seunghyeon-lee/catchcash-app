import { registerPlugin } from "@capacitor/core";

import type { NativeARPlugin } from "./definitions";

export const NativeAR = registerPlugin<NativeARPlugin>("NativeAR");

export * from "./definitions";
