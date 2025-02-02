import React from "react";
import { ActivityIndicator } from "react-native";
import {
  ChannelList,
  ChannelPreviewTitle,
  ChannelPreviewTitleProps,
} from "stream-chat-expo";
import { router } from "expo-router";
import { useChatContext } from "@/context/ChatProvider";
import { useUser } from "@clerk/clerk-expo";

const HomeScreen = () => {
  // const { isReady } = useChatContext();
  const { user } = useUser();

  // if (!isReady) {
  //   return <ActivityIndicator className="mt-8" size="large" />;
  // }

  // Custom Preview with the same UI as default
  const CustomChannelTitle = ({
    channel,
    displayName: dd,
  }: ChannelPreviewTitleProps) => {
    const otherMember = Object.values(channel.state.members).find(
      (member) => member.user_id !== user?.id
    );
    const displayName = otherMember?.user?.name || "New Friend";
    return <ChannelPreviewTitle channel={channel} displayName={displayName} />;
  };
  return (
    <ChannelList
      numberOfSkeletons={6}
      filters={{
        type: "messaging",
        members: { $in: [user?.id as string] },
      }}
      onSelect={(channel) => router.push(`/channel/${channel.cid}`)}
      PreviewTitle={CustomChannelTitle}
    />
  );
};

export default HomeScreen;
