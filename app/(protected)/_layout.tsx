import React, { useEffect } from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import ChatProvider from "@/context/ChatProvider";
import * as SplashScreen from "expo-splash-screen";

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: "(tabs)",
};
const AppLayout = () => {
  // check for auth
  const { isSignedIn, isLoaded } = useAuth();

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return null;
  }

  return (
    <ChatProvider>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="channel/[cid]"
          options={{
            headerTitle: "",
          }}
        />
      </Stack>
    </ChatProvider>
  );
};

export default AppLayout;
