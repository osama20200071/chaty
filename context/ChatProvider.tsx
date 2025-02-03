import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { StreamChat } from "stream-chat";
import { Chat, OverlayProvider } from "stream-chat-expo";
import { useUser } from "@clerk/clerk-expo";
import { tokenProvider, useSupabase } from "@/lib/supabase";
import AsyncStorage from "@/utils/AsyncStorage";
import * as Notifications from "expo-notifications";
import messaging from "@react-native-firebase/messaging";
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
  const config = await AsyncStorage.getItem<LoginConfig>("login-config", null);
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
  let userName = message.message.user?.name;
  userName = userName?.at(0)?.toUpperCase().concat(userName?.slice(1));

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${userName}`,
      body: message.message.text,
      data: remoteMessage.data,
      sound: "default", // 🔹 Ensure sound is enabled
      subtitle: "Messages",
    },
    trigger: null,
  });
});

const client = StreamChat.getInstance(process.env.EXPO_PUBLIC_STREAM_API_KEY);

type ChatContextProps = {
  isReady: boolean;
};
const ChatContext = createContext<ChatContextProps | undefined>(undefined);
export const useChatContext = (): ChatContextProps => {
  const ctx = useContext(ChatContext);

  if (!ctx) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }

  return ctx;
};

const ChatProvider = ({ children }: PropsWithChildren) => {
  const [isReady, setIsReady] = useState(false);
  const { user } = useUser();
  const supabase = useSupabase();

  if (!user) {
    return;
  }

  // connect to stream chat
  const connect = async () => {
    const token = await tokenProvider(supabase);

    try {
      await client.connectUser(
        {
          id: user.id as string,
          name: user.firstName as string,
          image: user.imageUrl,
        },
        token
      );
      await AsyncStorage.setItem("login-config", {
        userId: user.id as string,
        userImage: user.imageUrl,
        userName: user.firstName as string,
        userToken: token,
      });
      await requestPermission();
      await registerPushToken();
      setIsReady(true);
    } catch (error) {
      console.error("Error connecting to Stream Chat:", error);
    }
  };

  // disconnect from stream chat
  const disconnect = async () => {
    await client.disconnectUser(); // Disconnect when the component unmounts
    await AsyncStorage.removeItem("login-config");
    setIsReady(false);
  };

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
    connect();

    return () => {
      disconnect();
    };
  }, [user?.id]);

  return (
    <ChatContext.Provider value={{ isReady }}>
      <OverlayProvider>
        <Chat client={client}>{children}</Chat>
      </OverlayProvider>
    </ChatContext.Provider>
  );
};

export default ChatProvider;
