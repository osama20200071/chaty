//& we are doing it in a simple way not like the docs 100%

import { PropsWithChildren, useEffect, useState } from "react";
import messaging from "@react-native-firebase/messaging";
import { useUser } from "@clerk/clerk-expo";
import { useChatContext } from "stream-chat-expo";
import AsyncStore from "@/utils/AsyncStorage";
import { StreamChat } from "stream-chat";
import * as Notifications from "expo-notifications";
import { PermissionsAndroid, Platform } from "react-native";

type LoginConfig = {
  userId: string;
  userImage: string;
  userName: string;
  userToken: string;
};

// setup the background handler for the push notifications
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  const messageId = remoteMessage.data?.id;
  if (!messageId) return;
  const config = await AsyncStore.getItem<LoginConfig>("login-config", null);
  if (!config) return;

  // console.log("config", JSON.stringify(config, null, 2));

  const client = StreamChat.getInstance(process.env.EXPO_PUBLIC_STREAM_API_KEY);

  const user = {
    id: config.userId,
    image: config.userImage,
    name: config.userName,
  };

  await client._setToken(user, config.userToken);
  const message = await client.getMessage(messageId as string);

  await Notifications.setNotificationChannelAsync("chat-messages", {
    name: "Chat Messages",
    importance: Notifications.AndroidImportance.MAX,
    sound: "default", // 🔹 Enable sound
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `New message from ${message.message.user?.name}`,
      body: message.message.text,
      data: remoteMessage.data,
      sound: "default", // 🔹 Ensure sound is enabled
      subtitle: "Messages",
    },
    trigger: null,
  });
});

export function NotificationsProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const { user } = useUser();
  const { client } = useChatContext();

  // Request Push Notification permission from device.
  const requestPermission = async () => {
    if (Platform.OS === "android") {
      const androidPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      const isGranted =
        androidPermission === PermissionsAndroid.RESULTS.GRANTED;
      if (isGranted) {
        console.log("PN Permission status:", isGranted);
      }
      return;
    }

    // for ios
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      console.log("PN Permission status:", authStatus);
    }
  };

  // Register FCM token with stream chat server.
  const registerPushToken = async () => {
    const token = await messaging().getToken();
    // console.log("fcm token", token);
    const push_provider = "firebase";
    const push_provider_name = "firebase"; // name an alias for your push provider (optional)
    client
      .addDevice(token, push_provider, user?.id, push_provider_name)
      .then(() => console.log("token added to stream chat server"))
      .catch((error) => console.log("error setup device", error));
  };

  useEffect(() => {
    const init = async () => {
      await requestPermission();
      await registerPushToken();
      setIsReady(true);
    };
    init();
  }, []);

  return <>{children}</>;
}
