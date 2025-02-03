import React from "react";
import { ActivityIndicator } from "react-native";
import { ChannelList } from "stream-chat-expo";
import { router } from "expo-router";
import { useChatContext } from "@/context/ChatProvider";
import { useUser } from "@clerk/clerk-expo";
import ChannelListItem from "@/components/ChannelListItem";
import CustomChannelTitle from "@/components/CustomChannelTitle";

const HomeScreen = () => {
  const { isReady } = useChatContext();
  const { user } = useUser();

  if (!isReady) {
    return <ActivityIndicator className="mt-8" size="large" />;
  }

  return (
    <ChannelList
      numberOfSkeletons={6}
      filters={{
        type: "messaging",
        members: { $in: [user?.id as string] },
      }}
      // onSelect={(channel) => router.push(`/channel/${channel.cid}`)}
      Preview={ChannelListItem}
    />
  );
};

export default HomeScreen;
