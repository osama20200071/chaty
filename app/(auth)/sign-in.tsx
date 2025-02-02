import * as Haptics from "expo-haptics";
import { isClerkAPIResponseError, useSignIn } from "@clerk/clerk-expo";
import { ClerkAPIError } from "@clerk/types";
import { Href, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { ScrollView } from "@/components/ScrollView";
import TextInput from "@/components/TextInput";
import Button from "@/components/Button";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<ClerkAPIError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handle the submission of the sign-in form
  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    if (process.env.EXPO_OS === "ios") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsLoading(true);

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling

      console.error(JSON.stringify(err, null, 2));
      if (isClerkAPIResponseError(err)) setErrors(err.errors);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, emailAddress, password]);

  const onNavigatePress = useCallback(
    async (path: Href) => {
      if (process.env.EXPO_OS === "ios") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      router.push(path);
    },
    [router]
  );

  return (
    <ScrollView contentContainerClassName="p-8 ">
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        value={emailAddress}
        label="Email"
        placeholder="Enter email"
        onChangeText={setEmailAddress}
      />
      <TextInput
        value={password}
        label="Password"
        placeholder="Enter password"
        secureTextEntry={true}
        onChangeText={setPassword}
      />

      {errors.map((error) => (
        <Text key={error.longMessage} style={{ color: "red" }}>
          {error.longMessage}
        </Text>
      ))}
      <Button
        onPress={onSignInPress}
        loading={isLoading}
        disabled={!emailAddress || !password || isLoading}
      >
        Sign in
      </Button>

      <View className="flex gap-3 mt-8">
        <View className="flex justify-center items-center">
          <Text>Don't have an account ?</Text>
          <Button
            onPress={() => onNavigatePress("/sign-up")}
            variant="ghost"
            style={{ paddingHorizontal: 8 }}
          >
            Sign up
          </Button>
        </View>
        <View className="flex justify-center items-center ">
          <Text>Forgot password ?</Text>
          <Button
            onPress={() => onNavigatePress("/(auth)/reset-password")}
            variant="ghost"
            style={{ paddingHorizontal: 8 }}
          >
            Reset password
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
