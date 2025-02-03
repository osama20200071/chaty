import React from "react";
import {
  ChannelPreviewMessenger,
  ChannelPreviewMessengerProps,
  useChatContext,
} from "stream-chat-expo";
import CustomChannelTitle from "./CustomChannelTitle";
import { router } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Alert, TouchableOpacity } from "react-native";

const ChannelListItem = (props: ChannelPreviewMessengerProps) => {
  const { client } = useChatContext();
  const { user } = useUser();

  // @ts-ignore
  const canDelete = props.channel.data?.created_by?.id === user?.id;
  console.log("canDelete ?", canDelete);

  const deleteChannelHandler = async () => {
    if (!canDelete) return;
    try {
      Alert.alert(
        "Delete Chat ⚠️",
        "Are you sure you want to delete this chat? This action is irreversible.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            onPress: async () => {
              const response = await client.deleteChannels(
                [props.channel.cid],
                {
                  hard_delete: true,
                }
              );
              console.log("deletion response", response);
            },
            style: "destructive",
            isPreferred: false,
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to delete account");
      console.error(error);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/channel/${props.channel.cid}`)}
      onLongPress={deleteChannelHandler}
    >
      <ChannelPreviewMessenger {...props} PreviewTitle={CustomChannelTitle} />
    </TouchableOpacity>
  );
};

export default ChannelListItem;
