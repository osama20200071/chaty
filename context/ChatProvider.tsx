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
      setIsReady(true);
    } catch (error) {
      console.error("Error connecting to Stream Chat:", error);
    }
  };

  const disconnect = async () => {
    await client.disconnectUser(); // Disconnect when the component unmounts
    await AsyncStorage.removeItem("login-config");
    setIsReady(false);
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [user?.id]);

  // this is very important to make sure the chat is ready before rendering the chat component
  // and to make sure that the user is already connected so we can add the device to the stream chat backend
  if (!isReady) {
    return null;
  }

  return (
    <ChatContext.Provider value={{ isReady }}>
      <OverlayProvider>
        <Chat client={client}>{children}</Chat>
      </OverlayProvider>
    </ChatContext.Provider>
  );
};

export default ChatProvider;
