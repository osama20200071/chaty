import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

function AuthRoutesLayout() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href={"/"} />;
  }

  return (
    <Stack>
      <Stack.Screen name="sign-in" options={{ headerTitle: "Sign in" }} />
      <Stack.Screen name="sign-up" options={{ headerTitle: "Sign up" }} />
      <Stack.Screen
        name="reset-password"
        options={{ headerTitle: "Reset password" }}
      />
    </Stack>
  );
}

export default AuthRoutesLayout;
