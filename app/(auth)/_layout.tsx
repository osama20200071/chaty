import React, { useEffect } from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import * as SplashScreen from "expo-splash-screen";

function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (isSignedIn) {
    return <Redirect href={"/"} />;
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
