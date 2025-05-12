import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";

interface GameBasic {
  appid: number;
  name: string;
  header_image: string;
}

interface GameDetails extends GameBasic {
  concurrent_players?: number;
  detailed_description: string;
  developers: string[];
  publishers: string[];
  release_date: {
    date: string;
  };
}

interface SteamResponse {
  [key: string]: {
    success: boolean;
    data: GameDetails;
  };
}

const stripHtml = (html: string): string => {
  if (!html) return "";

  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, "");

  // Replace HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Remove multiple spaces and line breaks
  text = text.replace(/\s+/g, " ").trim();

  return text;
};

export default function GameScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const gameId = params.id?.toString() || "";
  const { width } = useWindowDimensions();

  const [game, setGame] = useState<GameDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    if (gameId) {
      console.log("Fetching details for game:", gameId);
      fetchGameDetails();
      checkIfFavorite();
    }
  }, [gameId]);

  useEffect(() => {
    if (game?.detailed_description) {
      const plainText = stripHtml(game.detailed_description);
      setDescription(plainText);
    }
  }, [game?.detailed_description]);

  const checkIfFavorite = async () => {
    if (!gameId) {
      console.log("No game ID available for checking favorites");
      return;
    }

    try {
      const favoritesJson = await AsyncStorage.getItem("favorites");
      if (favoritesJson) {
        const favorites: GameBasic[] = JSON.parse(favoritesJson);
        const isGameFavorite = favorites.some(
          (game) => game.appid === Number(gameId)
        );
        setIsFavorite(isGameFavorite);
      }
    } catch (error) {
      console.error("Error checking favorites:", error);
    }
  };

  const toggleFavorite = async () => {
    if (!gameId || !game) {
      console.log("Missing data for toggle:", { gameId, game: !!game });
      return;
    }

    try {
      const favoritesJson = await AsyncStorage.getItem("favorites");
      let favorites: GameBasic[] = favoritesJson
        ? JSON.parse(favoritesJson)
        : [];
      const numericGameId = Number(gameId);

      if (isFavorite) {
        favorites = favorites.filter((g) => g.appid !== numericGameId);
      } else {
        const existingIndex = favorites.findIndex(
          (g) => g.appid === numericGameId
        );
        if (existingIndex === -1) {
          const gameToSave: GameBasic = {
            appid: numericGameId,
            name: game.name,
            header_image: game.header_image,
          };
          favorites.push(gameToSave);
        }
      }

      await AsyncStorage.setItem("favorites", JSON.stringify(favorites));
      setIsFavorite(!isFavorite);

      router.push("/(tabs)/favorites");
      setTimeout(() => {
        router.back();
      }, 100);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const fetchGameDetails = async () => {
    try {
      setIsLoading(true);

      const detailsResponse = await fetch(
        `https://store.steampowered.com/api/appdetails?appids=${gameId}`
      );
      const detailsData: SteamResponse = await detailsResponse.json();

      if (detailsData[gameId] && detailsData[gameId].success) {
        const gameData = detailsData[gameId].data;

        try {
          const playersResponse = await fetch(
            `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${gameId}`
          );
          const playersData = await playersResponse.json();

          setGame({
            ...gameData,
            concurrent_players: playersData.response.player_count,
          });
        } catch (playerError) {
          console.error("Error fetching player count:", playerError);
          setGame(gameData);
        }
      }
    } catch (error) {
      console.error("Error fetching game details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#66c0f4" />
      </View>
    );
  }

  if (!game) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load game details</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: game.name,
          headerStyle: {
            backgroundColor: "#1b2838",
          },
          headerTintColor: "#ffffff",
        }}
      />
      <ScrollView style={styles.container}>
        <Image source={{ uri: game.header_image }} style={styles.headerImage} />
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{game.name}</Text>
            <TouchableOpacity
              onPress={toggleFavorite}
              style={styles.favoriteButton}
            >
              <FontAwesome
                name={isFavorite ? "star" : "star-o"}
                size={24}
                color={isFavorite ? "#66c0f4" : "#666"}
              />
            </TouchableOpacity>
          </View>

          {game.concurrent_players !== undefined && (
            <Text style={styles.playerCount}>
              Current Players: {game.concurrent_players.toLocaleString()}
            </Text>
          )}

          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              {description || "No description available."}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Details</Text>
          <Text style={styles.detailText}>
            Developers: {game.developers?.join(", ") ?? "N/A"}
          </Text>
          <Text style={styles.detailText}>
            Publishers: {game.publishers?.join(", ") ?? "N/A"}
          </Text>
          <Text style={styles.detailText}>
            Release Date: {game.release_date?.date ?? "N/A"}
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1b2838",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1b2838",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1b2838",
  },
  errorText: {
    fontSize: 16,
    color: "#ff4444",
  },
  headerImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  content: {
    padding: 15,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    flex: 1,
  },
  favoriteButton: {
    padding: 10,
  },
  playerCount: {
    fontSize: 16,
    color: "#c7d5e0",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    color: "#66c0f4",
  },
  descriptionContainer: {
    marginVertical: 8,
  },
  description: {
    color: "#c7d5e0",
    fontSize: 14,
    lineHeight: 20,
  },
  detailText: {
    fontSize: 14,
    color: "#c7d5e0",
    marginBottom: 5,
  },
});
