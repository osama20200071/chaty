//& we are doing it in a simple way not like the docs 100%

import { PropsWithChildren, useEffect, useState } from "react";
import messaging from "@react-native-firebase/messaging";
import { useUser } from "@clerk/clerk-expo";
import { useChatContext } from "stream-chat-expo";
import AsyncStore from "@/utils/AsyncStorage";
import { GetMessageAPIResponse, StreamChat } from "stream-chat";
import * as Notifications from "expo-notifications";
import notifee, { AndroidImportance, EventType } from "@notifee/react-native";

type LoginConfig = {
  userId: string;
  userImage: string;
  userName: string;
  userToken: string;
};

// Function to display notification
const displayNotification = async (message: GetMessageAPIResponse) => {
  // console.log("message", JSON.stringify(message, null, 2));
  console.log("displaying notification");
  console.log("message.message.text", message.message.text);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `New message from ${message.message.user?.first_name}`,
      body: message.message.text,
      data: message,
    },
    identifier: "default",
    trigger: null, // Sends immediately
  });
};

// setup the background handler for the push notifications
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  const messageId = remoteMessage.data?.id;
  if (!messageId) return;
  const config = await AsyncStore.getItem<LoginConfig>("login-config", null);
  if (!config) return;

  console.log("config", config);

  const client = StreamChat.getInstance(process.env.EXPO_PUBLIC_STREAM_API_KEY);

  const user = {
    id: config.userId,
    image: config.userImage,
    name: config.userName,
  };

  // eslint-disable-next-line no-underscore-dangle
  await client._setToken(user, config.userToken);
  const message = await client.getMessage(messageId as string);

  console.log("message", JSON.stringify(message, null, 2));

  // await displayNotification(message);
  // create the android channel to send the notification to
  const channelId = await notifee.createChannel({
    id: "chat-messages",
    name: "Chat Messages",
    // sound: "default",
  });

  const { stream, ...rest } = remoteMessage.data ?? {};
  const data = {
    ...rest,
    ...((stream as unknown as Record<string, string> | undefined) ?? {}), // extract and merge stream object if present
  };
  await notifee.displayNotification({
    title: "New message from " + message.message.user?.name,
    body: message.message.text,
    subtitle: "Messages",
    data,

    android: {
      channelId,
      importance: AndroidImportance.HIGH,
      // add a press action to open the app on press
      pressAction: {
        id: "default",
      },
    },
  });
});

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    console.log("User pressed notification", detail.notification);
  }
});

export function NotificationsProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const { user } = useUser();
  const { client } = useChatContext();

  // Request Push Notification permission from device.
  const requestPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      console.log("Authorization status:", authStatus);
    }
  };

  useEffect(() => {
    // Register FCM token with stream chat server.
    const registerPushToken = async () => {
      const token = await messaging().getToken();
      console.log("fcm token", token);
      const push_provider = "firebase";
      const push_provider_name = "firebase"; // name an alias for your push provider (optional)
      client
        .addDevice(token, push_provider, user?.id, push_provider_name)
        .then(() => console.log("token added to stream chat server"))
        .catch((error) => console.log("error setup device", error));
    };

    const init = async () => {
      await requestPermission();
      await registerPushToken();
      setIsReady(true);
    };
    init();
  }, []);

  return <>{children}</>;
}
