import { StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { Entypo } from "@expo/vector-icons";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  FadeIn,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import Reanimated from "react-native-reanimated";
import {
  ChannelPreviewMessenger,
  ChannelPreviewMessengerProps,
  useChatContext,
} from "stream-chat-expo";
import CustomChannelTitle from "./CustomChannelTitle";
import { router } from "expo-router";

const ChannelListItem = (props: ChannelPreviewMessengerProps) => {
  const { client } = useChatContext();

  const deleteChannelHandler = async () => {
    console.log("deleting the channel..");
    const response = await client.deleteChannels([props.channel.cid], {
      hard_delete: true,
    });
    console.log("deletion response", response);
  };

  const RightAction = (
    prog: SharedValue<number>,
    drag: SharedValue<number>
  ) => {
    const styleAnimation = useAnimatedStyle(() => ({
      transform: [{ translateX: drag.value + 200 }],
    }));

    return (
      <TouchableOpacity activeOpacity={0.5} onPressIn={deleteChannelHandler}>
        <Reanimated.View style={[styleAnimation, styles.rightAction]}>
          <Entypo name="trash" size={24} color="white" />
        </Reanimated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View entering={FadeIn}>
      <ReanimatedSwipeable
        key={props.channel.cid}
        friction={2}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        renderRightActions={RightAction}
        overshootRight={false}
        // enableContextMenu
      >
        <ChannelPreviewMessenger
          {...props}
          PreviewTitle={CustomChannelTitle}
          onSelect={() => router.push(`/channel/${props.channel.cid}`)}
        />
      </ReanimatedSwipeable>
    </Animated.View>
  );
};

export default ChannelListItem;

const styles = StyleSheet.create({
  rightAction: {
    width: 200,
    height: 65,
    backgroundColor: "red",
    alignItems: "center",
    justifyContent: "center",
  },
});
