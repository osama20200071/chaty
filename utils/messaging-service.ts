import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@/utils/AsyncStorage';
import { StreamChat } from 'stream-chat';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
const BACKGROUND_NOTIFICATION_TASK = 'ReactNativeFirebaseMessagingHeadlessTask';

type LoginConfig = {
  userId: string;
  userImage: string;
  userName: string;
  userToken: string;
};


export async function handleChatMessage(messageId: string) {
  const config = await AsyncStorage.getItem<LoginConfig>("login-config", null);
  if (!config) return;

  const client = StreamChat.getInstance(process.env.EXPO_PUBLIC_STREAM_API_KEY);

  const user = {
    id: config.userId,
    image: config.userImage,
    name: config.userName,
  };

  await client._setToken(user, config.userToken);
  const message = await client.getMessage(messageId);

  await Notifications.setNotificationChannelAsync("default", {
    name: "Chat Messages",
    importance: Notifications.AndroidImportance.MAX,
    sound: "default",
  });

  let userName = message.message.user?.name;
  userName = userName?.at(0)?.toUpperCase().concat(userName?.slice(1));

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${userName}`,
      body: message.message.text,
      data: { id: messageId },
      sound: "default",
      subtitle: "Messages",
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: null,
  });
}


// Ensure notification settings
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Add this new handler for quit state
messaging()
  .getInitialNotification()
  .then(async (remoteMessage) => {
    console.log(
      "getInitialNotification",
      JSON.stringify(remoteMessage, null, 2)
    );
    if (remoteMessage) {
      const messageId = remoteMessage.data?.id;
      if (messageId) {
        await handleChatMessage(messageId as string);
      }
    }
  });


// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background or Terminated state:', JSON.stringify(remoteMessage  , null , 2));
  const messageId = remoteMessage.data?.id;
  if (messageId) {
    await handleChatMessage(messageId as string);
  }
});


// Handle notifications when the app is in the background
messaging().onNotificationOpenedApp(remoteMessage => {
  const messageId = remoteMessage.data?.id;
  if (messageId) {
    handleChatMessage(messageId as string);
  }
});



// ✅ Register Background Task for Firebase
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Error in background task:', error);
    return;
  }
  console.log('Handling background message in task:', data);

  const remoteMessage = data as any;
  const messageId = remoteMessage?.data?.id;
  if (messageId) {
    await handleChatMessage(messageId);
  }
});


// Register the background notification handler
export async function registerBackgroundNotificationHandler() {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);
  if (!isRegistered) {
    console.log('Registering background notification handler...');
    await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
  }
}
