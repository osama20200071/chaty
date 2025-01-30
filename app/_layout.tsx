// Import your global CSS file
import "../global.css";
import { Slot } from "expo-router";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { tokenCache } from "@/cache";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file");
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      tokenCache={tokenCache}
      // afterSignOutUrl={"/sign-in"}
    >
      <ClerkLoaded>
        <StatusBar style="dark" />
        <Slot />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
