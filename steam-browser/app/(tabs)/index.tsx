import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

interface Game {
  appid: number;
  name: string;
  header_image: string;
  concurrent_players?: number;
}

export default function PopularGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setIsLoading(true);
      // First, get the most played games
      const mostPlayedResponse = await fetch(
        "https://api.steampowered.com/ISteamChartsService/GetMostPlayedGames/v1/"
      );
      const mostPlayedData = await mostPlayedResponse.json();

      if (mostPlayedData.response && mostPlayedData.response.ranks) {
        // Get details for each game
        const gameDetailsPromises = mostPlayedData.response.ranks
          .slice(0, 20)
          .map(async (game: any) => {
            const detailsResponse = await fetch(
              `https://store.steampowered.com/api/appdetails?appids=${game.appid}`
            );
            const detailsData = await detailsResponse.json();

            if (detailsData[game.appid].success) {
              const gameData = detailsData[game.appid].data;
              return {
                appid: game.appid,
                name: gameData.name,
                header_image: gameData.header_image,
                concurrent_players: game.concurrent_players,
              };
            }
            return null;
          });

        const gameDetails = await Promise.all(gameDetailsPromises);
        setGames(gameDetails.filter((game): game is Game => game !== null));
      }
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Game }) => (
    <TouchableOpacity
      style={styles.gameItem}
      onPress={() => router.push(`/game/${item.appid}`)}
    >
      <Image source={{ uri: item.header_image }} style={styles.gameImage} />
      <View style={styles.gameInfo}>
        <Text style={styles.gameName}>{item.name}</Text>
        {item.concurrent_players && (
          <Text style={styles.playerCount}>
            Current Players: {item.concurrent_players.toLocaleString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#66c0f4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={games}
        renderItem={renderItem}
        keyExtractor={(item) => item.appid.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
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
  listContainer: {
    padding: 10,
  },
  gameItem: {
    backgroundColor: "#2a475e",
    borderRadius: 8,
    marginBottom: 10,
    overflow: "hidden",
  },
  gameImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  gameInfo: {
    padding: 10,
  },
  gameName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  playerCount: {
    fontSize: 14,
    color: "#66c0f4",
  },
});
