import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import ChatProvider from "@/context/ChatProvider";
import { NotificationsProvider } from "@/context/NotificationProvider";

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
      <NotificationsProvider>
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
      </NotificationsProvider>
    </ChatProvider>
  );
};

export default AppLayout;
