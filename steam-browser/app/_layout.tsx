import { Stack } from "expo-router";
import React from "react";
import { useColorScheme } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider } from "@react-navigation/native";

const darkTheme = {
  dark: true,
  colors: {
    primary: "#66c0f4",
    background: "#1b2838",
    card: "#2a475e",
    text: "#ffffff",
    border: "#2a475e",
    notification: "#66c0f4",
  },
};

const lightTheme = {
  dark: false,
  colors: {
    primary: "#66c0f4",
    background: "#ffffff",
    card: "#f5f5f5",
    text: "#000000",
    border: "#cccccc",
    notification: "#66c0f4",
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <NavigationContainer theme={theme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.card,
          },
          headerTintColor: theme.colors.text,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </NavigationContainer>
  );
}
