import { Tabs } from "expo-router";
import React from "react";
import { useColorScheme } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colorScheme === "dark" ? "#1b2838" : "#fff",
        },
        tabBarActiveTintColor: "#66c0f4",
        tabBarInactiveTintColor: colorScheme === "dark" ? "#c7d5e0" : "#000",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Popular",
          headerTitle: "Popular Games",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="fire" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          headerTitle: "Explore Games",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          headerTitle: "Favorite Games",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="star" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="game"
        options={{
          tabBarButton: () => null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
