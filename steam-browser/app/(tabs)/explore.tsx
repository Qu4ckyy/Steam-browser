import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

interface Game {
  appid: number;
  name: string;
  header_image?: string;
  price_overview?: {
    final_formatted: string;
  };
  genres?: Array<{ description: string }>;
}

export default function ExploreGames() {
  const [searchQuery, setSearchQuery] = useState("");
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const searchGames = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      setGames([]); // Clear previous results

      // First search for game IDs
      const searchResponse = await fetch(
        `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(
          searchQuery
        )}&l=english&cc=US`
      );
      const searchData = await searchResponse.json();

      if (searchData.items && searchData.items.length > 0) {
        // Get details for each game
        const gameDetailsPromises = searchData.items
          .slice(0, 10)
          .map(async (item: any) => {
            try {
              const detailsResponse = await fetch(
                `https://store.steampowered.com/api/appdetails?appids=${item.id}&cc=US&l=english`
              );
              const detailsData = await detailsResponse.json();

              if (detailsData[item.id]?.success) {
                return {
                  appid: item.id,
                  name: detailsData[item.id].data.name,
                  header_image: detailsData[item.id].data.header_image,
                  price_overview: detailsData[item.id].data.price_overview,
                  genres: detailsData[item.id].data.genres,
                };
              }
              return null;
            } catch (error) {
              console.error(
                `Error fetching details for game ${item.id}:`,
                error
              );
              return null;
            }
          });

        const gameDetails = await Promise.all(gameDetailsPromises);
        setGames(gameDetails.filter((game): game is Game => game !== null));
      }
    } catch (error) {
      console.error("Error searching games:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderGameItem = ({ item }: { item: Game }) => (
    <TouchableOpacity
      style={styles.gameItem}
      onPress={() => router.push(`/game/${item.appid}`)}
    >
      {item.header_image && (
        <Image source={{ uri: item.header_image }} style={styles.gameImage} />
      )}
      <View style={styles.gameInfo}>
        <Text style={styles.gameName}>{item.name}</Text>
        {item.price_overview && (
          <Text style={styles.gamePrice}>
            {item.price_overview.final_formatted}
          </Text>
        )}
        {item.genres && (
          <Text style={styles.gameGenres}>
            {item.genres.map((genre) => genre.description).join(", ")}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Steam games..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchGames}
          returnKeyType="search"
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#66c0f4" />
        </View>
      ) : (
        <FlatList
          data={games}
          keyExtractor={(item) => item.appid.toString()}
          renderItem={renderGameItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? "No games found. Try a different search."
                  : "Search for Steam games above"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1b2838",
  },
  searchContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2a475e",
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#2a475e",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#2a475e",
    color: "#ffffff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#c7d5e0",
    textAlign: "center",
  },
  gameItem: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2a475e",
    backgroundColor: "#2a475e",
    margin: 5,
    borderRadius: 8,
  },
  gameImage: {
    width: 120,
    height: 45,
    borderRadius: 5,
  },
  gameInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },
  gameName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  gamePrice: {
    fontSize: 14,
    color: "#66c0f4",
    marginTop: 4,
  },
  gameGenres: {
    fontSize: 12,
    color: "#c7d5e0",
    marginTop: 2,
  },
});
