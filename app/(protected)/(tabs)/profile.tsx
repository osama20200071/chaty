import { router } from "expo-router";
import { Alert, Image, View, StyleSheet, Text } from "react-native";
import { useAuth, useClerk, useUser } from "@clerk/clerk-expo";
import { ScrollView } from "@/components/ScrollView";
import Button from "@/components/Button";
import ThemedText from "@/components/ThemedText";
import QRCode from "react-native-qrcode-svg";

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/sign-in");
  };

  const handleDeleteAccount = async () => {
    try {
      Alert.alert(
        "Delete account",
        "Are you sure you want to delete your account? This action is irreversible.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            onPress: async () => {
              await user?.delete();
              router.replace("/");
            },
            style: "destructive",
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to delete account");
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <View style={styles.header}>
          {user?.imageUrl ? (
            <Image
              source={{ uri: user.imageUrl }}
              style={styles.profileImage}
            />
          ) : null}
          <View style={styles.userInfo}>
            <Text className="text-lg font-bold capitalize">
              Hello {user?.firstName}
            </Text>
            <ThemedText className="opacity-70">
              {user?.emailAddresses[0].emailAddress}
            </ThemedText>
            <ThemedText className="opacity-70">
              Joined {user?.createdAt?.toDateString()}
            </ThemedText>
          </View>
        </View>
      </View>
      <View style={styles.section}>
        <View style={styles.qrSection}>
          <Text style={styles.sectionTitle}>Scan QR Code</Text>
          <View style={styles.qrContainer}>
            <QRCode size={200} value={`my-chat://channel?userId=${user?.id}`} />
          </View>
        </View>
      </View>

      <Button onPress={handleSignOut}>Sign out</Button>
      <Button
        onPress={handleDeleteAccount}
        variant="ghost"
        textStyle={{ color: "gray" }}
      >
        Delete account
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 32,
    gap: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },

  section: {
    backgroundColor: "rgba(150, 150, 150, 0.1)",
    borderRadius: 12,
    padding: 16,
    paddingVertical: 8,
  },
  appTitle: {
    textAlign: "center",
  },
  version: {
    textAlign: "center",
    opacity: 0.7,
  },

  qrSection: {
    alignItems: "center",
    gap: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
  },
  qrContainer: {
    padding: 24,
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
