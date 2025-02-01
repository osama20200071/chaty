import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import ChatProvider from "@/context/ChatProvider";

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: "(tabs)",
};
const AppLayout = () => {
  // check for auth
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
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
