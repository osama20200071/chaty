import { ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { Channel as ChannelType } from "stream-chat";
import { useLocalSearchParams } from "expo-router";
import {
  Channel,
  MessageInput,
  MessageList,
  useChatContext,
} from "stream-chat-expo";
import { SafeAreaView } from "react-native-safe-area-context";

const ChannelScreen = () => {
  const [currentChannel, setCurrentChannel] = useState<
    ChannelType | undefined
  >();
  const { cid } = useLocalSearchParams<{ cid: string }>();
  const { client } = useChatContext();

  useEffect(() => {
    const fetchChannel = async () => {
      const channels = await client.queryChannels({ cid });
      setCurrentChannel(channels[0]);
    };

    fetchChannel();
  }, []);

  if (!currentChannel) {
    return <ActivityIndicator className="mt-8" size="large" />;
  }

  return (
    <Channel channel={currentChannel}>
      <MessageList />
      <SafeAreaView edges={["bottom"]}>
        <MessageInput />
      </SafeAreaView>
    </Channel>
  );
};

export default ChannelScreen;
