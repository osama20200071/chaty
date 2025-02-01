declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
      EXPO_PUBLIC_STREAM_API_KEY: string;
    }
  }
}

export {};
