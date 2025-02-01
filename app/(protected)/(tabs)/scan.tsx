import { useRef, useState } from "react";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { router } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useChatContext } from "stream-chat-expo";
import { useUser } from "@clerk/clerk-expo";

export default function ScanQRCode() {
  const [permission, requestPermission] = useCameraPermissions();
  const { client } = useChatContext();
  const { user } = useUser();

  const [qrCodeDetected, setQrCodeDetected] = useState<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to scan qr code
        </Text>
        <Pressable
          onPress={requestPermission}
          className="flex items-center px-6 py-2 bg-black rounded-md"
        >
          <Text className="text-white">Grant permission</Text>
        </Pressable>
      </View>
    );
  }

  const handleConfirmJoinChannel = async () => {
    const channel = client.channel("messaging", {
      members: [qrCodeDetected, user?.id!],
      // name: `${user.full_name}_${profile?.full_name}`,
    });
    await channel.watch();
    router.push(`/channel/${channel.cid}`);
  };

  const handleBarcodeScanned = (
    barcodeScanningResult: BarcodeScanningResult
  ) => {
    const qrCodeUrl = barcodeScanningResult.data;

    // Extract listId from QR code URL
    const userMatchId = qrCodeUrl.match(/userId=([^&]+)/);
    if (userMatchId) {
      const userId = userMatchId[1];

      console.log("detected userId:", userId);

      setQrCodeDetected(userId);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // if we are not detecting qr code for a second reset the previous one
      // the user moves the camera away
      timeoutRef.current = setTimeout(() => {
        setQrCodeDetected("");
      }, 1000);
    }
  };

  return (
    <CameraView
      style={[StyleSheet.absoluteFillObject, styles.camera]}
      facing="back"
      barcodeScannerSettings={{
        barcodeTypes: ["qr"],
      }}
      onBarcodeScanned={handleBarcodeScanned}
    >
      <View className="flex-1 justify-center items-center">
        {qrCodeDetected ? (
          <View style={styles.detectedContainer}>
            <Text style={styles.detectedText}>🥳 QR code detected!!!</Text>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={handleConfirmJoinChannel}
              className="flex items-center px-6 py-2 bg-white rounded-md"
            >
              <Text className="text-black">Join Chat</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.instructionText}>
            Point the camera at a valid QR Code
          </Text>
        )}
      </View>
    </CameraView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  hint: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  headerText: {
    color: "#fff",
    backgroundColor: "transparent",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  camera: {
    flex: 1,
    // zIndex: 99,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  detectedContainer: {
    borderRadius: 10,
    padding: 30,
  },

  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  detectedText: {
    color: "white",
    marginBottom: 16,
  },
  instructionText: {
    color: "white",
  },
});
