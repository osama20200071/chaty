import * as React from "react";
import { useRouter } from "expo-router";
import { isClerkAPIResponseError, useSignIn } from "@clerk/clerk-expo";
import { ClerkAPIError } from "@clerk/types";
import { ScrollView } from "@/components/ScrollView";
import TextInput from "@/components/TextInput";
import Button from "@/components/Button";
import ThemedText from "@/components/ThemedText";

export default function ResetPassword() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [errors, setErrors] = React.useState<ClerkAPIError[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const onResetPasswordPress = React.useCallback(async () => {
    if (!isLoaded) return;
    setErrors([]);
    setIsLoading(true);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress,
      });

      setPendingVerification(true);
    } catch (err) {
      if (isClerkAPIResponseError(err)) setErrors(err.errors);
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, emailAddress, signIn]);

  const onVerifyPress = React.useCallback(async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      const signInAttempt = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) setErrors(err.errors);
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, code, password, signIn, setActive, router]);

  if (pendingVerification) {
    return (
      <ScrollView contentContainerClassName="p-8">
        <ThemedText className="mb-2">
          Enter the verification code we sent to{" "}
          <ThemedText className="font-bold">{emailAddress}</ThemedText>
        </ThemedText>
        <TextInput
          value={code}
          // label={`Enter the verification code we sent to ${emailAddress}`}
          placeholder="Enter your verification code"
          onChangeText={setCode}
        />
        <TextInput
          value={password}
          label="Enter your new password"
          placeholder="Enter your new password"
          secureTextEntry
          onChangeText={setPassword}
        />
        {errors.map((error) => (
          <ThemedText key={error.longMessage} style={{ color: "red" }}>
            {error.longMessage}
          </ThemedText>
        ))}
        <Button
          onPress={onVerifyPress}
          disabled={!code || !password || isLoading}
          loading={isLoading}
        >
          Reset password
        </Button>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerClassName="p-8">
      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        keyboardType="email-address"
        onChangeText={setEmailAddress}
      />
      {errors.map((error) => (
        <ThemedText key={error.longMessage} style={{ color: "red" }}>
          {error.longMessage}
        </ThemedText>
      ))}
      <Button
        onPress={onResetPasswordPress}
        disabled={!emailAddress || isLoading}
        loading={isLoading}
      >
        Continue
      </Button>
    </ScrollView>
  );
}
