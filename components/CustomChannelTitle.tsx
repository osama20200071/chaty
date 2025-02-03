import { useAuth, useUser } from "@clerk/clerk-expo";
import {
  ChannelPreviewTitle,
  ChannelPreviewTitleProps,
} from "stream-chat-expo";

// Custom Preview with the same UI as default
const CustomChannelTitle = ({
  channel,
  displayName: dd,
}: ChannelPreviewTitleProps) => {
  const { user } = useUser();

  const otherMember = Object.values(channel.state.members).find(
    (member) => member.user_id !== user?.id
  );
  const displayName = otherMember?.user?.name || "New Friend";

  return <ChannelPreviewTitle channel={channel} displayName={displayName} />;
};

export default CustomChannelTitle;
