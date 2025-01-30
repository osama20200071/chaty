import * as React from "react";
import { isClerkAPIResponseError, useSignUp } from "@clerk/clerk-expo";
import { router } from "expo-router";
import TextInput from "@/components/TextInput";
import Button from "@/components/Button";
import { ScrollView } from "@/components/ScrollView";
import { ClerkAPIError } from "@clerk/types";
import ThemedText from "@/components/ThemedText";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [errors, setErrors] = React.useState<ClerkAPIError[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setErrors([]);
    setIsLoading(true);

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
        firstName,
        lastName,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
      if (isClerkAPIResponseError(err)) setErrors(err.errors);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    setIsLoading(true);

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
      if (isClerkAPIResponseError(err)) setErrors(err.errors);
    } finally {
      setIsLoading(false);
    }
  };

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
          // label="Verify Your Email"
          placeholder="Enter your verification code"
          onChangeText={setCode}
        />
        {errors.map((error) => (
          <ThemedText
            key={error.longMessage}
            style={{ color: "red" }}
            className="transition-opacity"
          >
            {error.longMessage}
          </ThemedText>
        ))}

        <Button
          onPress={onVerifyPress}
          loading={isLoading}
          disabled={!code || isLoading}
        >
          Verify
        </Button>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerClassName="p-8">
      <TextInput
        autoCapitalize="none"
        value={firstName}
        placeholder="Enter Your First name"
        label="First Name"
        onChangeText={setFirstName}
      />
      <TextInput
        autoCapitalize="none"
        value={lastName}
        placeholder="Enter Your last name"
        label="Last Name"
        onChangeText={setLastName}
      />
      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        label="Email"
        onChangeText={(email) => setEmailAddress(email)}
      />
      <TextInput
        value={password}
        placeholder="Enter password"
        label="Password"
        secureTextEntry={true}
        onChangeText={(password) => setPassword(password)}
      />
      {errors.map((error) => (
        <ThemedText
          key={error.longMessage}
          style={{ color: "red" }}
          className="transition-opacity"
        >
          {error.longMessage}
        </ThemedText>
      ))}
      <Button
        onPress={onSignUpPress}
        loading={isLoading}
        disabled={!emailAddress || !password || isLoading}
      >
        Continue
      </Button>
    </ScrollView>
  );
}
