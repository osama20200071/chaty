import React from "react";
import { Tabs } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Entypo } from "@expo/vector-icons";

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarButton(props) {
          return (
            <TouchableOpacity
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              activeOpacity={0.9}
              onPress={props.onPress}
              className="flex-1 items-center justify-center"
            >
              {props.children}
            </TouchableOpacity>
          );
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ size, color }) => (
            <Entypo name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          headerTitle: "Scan QR Code",
          title: "Scan",
          tabBarIcon: ({ size, color }) => (
            <Entypo name="camera" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          // headerTitle: "Profile",
          title: "Profile",
          tabBarIcon: ({ size, color }) => (
            <Entypo name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
