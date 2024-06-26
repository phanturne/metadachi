// Source: https://github.com/mckaywrigley/chatbot-ui/blob/main/lib/envs.ts

import { EnvKey } from "@/app/lib/types/key-type"

// returns true if the key is found in the environment variables
export function isUsingEnvironmentKey(type: EnvKey) {
  return Boolean(process.env[type])
}
