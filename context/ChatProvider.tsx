import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { StreamChat } from "stream-chat";
import { Chat, OverlayProvider } from "stream-chat-expo";
// import { tokenProvider } from "@/utils/supabaseUtils";
import { useUser } from "@clerk/clerk-expo";

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

  useEffect(() => {
    if (!user) {
      return;
    }

    const connect = async () => {
      try {
        await client.connectUser(
          {
            id: user.id as string,
            name: user.firstName as string,
            image: user.imageUrl,
          },
          // user.id
          client.devToken(user.id)
          // tokenProvider
        );
        setIsReady(true);
      } catch (error) {
        console.error("Error connecting to Stream Chat:", error);
      }
    };

    connect();

    return () => {
      client.disconnectUser(); // Disconnect when the component unmounts
      setIsReady(false);
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
