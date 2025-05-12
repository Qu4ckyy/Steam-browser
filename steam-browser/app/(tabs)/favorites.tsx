import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";

interface Game {
  appid: number;
  name: string;
  header_image: string;
}

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Game[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const isFocused = useIsFocused();

  const loadFavorites = useCallback(async () => {
    try {
      const favoritesJson = await AsyncStorage.getItem("favorites");
      console.log("Loading favorites:", favoritesJson);
      if (favoritesJson) {
        const favoritesData = JSON.parse(favoritesJson);
        // Filter out any invalid entries
        const validFavorites = favoritesData.filter(
          (game: any) =>
            game &&
            typeof game === "object" &&
            typeof game.appid === "number" &&
            typeof game.name === "string" &&
            typeof game.header_image === "string"
        );
        console.log("Valid favorites loaded:", validFavorites.length);
        setFavorites(validFavorites);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, [loadFavorites]);

  // Load favorites when screen is focused
  useEffect(() => {
    if (isFocused) {
      console.log("Favorites screen focused, reloading favorites");
      loadFavorites();
    }
  }, [isFocused, loadFavorites]);

  const navigateToGame = (appId: number) => {
    router.push(`/game/${appId}`);
  };

  const renderItem = ({ item }: { item: Game }) => (
    <TouchableOpacity
      style={styles.gameItem}
      onPress={() => navigateToGame(item.appid)}
    >
      <Image source={{ uri: item.header_image }} style={styles.gameImage} />
      <Text style={styles.gameName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (favorites.length === 0) {
      return (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#66c0f4"
              colors={["#66c0f4"]}
            />
          }
        >
          <Text style={styles.noFavorites}>No favorite games yet</Text>
          <Text style={styles.noFavoritesSubtext}>
            Pull down to refresh or add games from the game details page
          </Text>
        </ScrollView>
      );
    }

    return (
      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(item) => item.appid.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#66c0f4"
            colors={["#66c0f4"]}
          />
        }
      />
    );
  };

  return <View style={styles.container}>{renderContent()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1b2838",
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  gameName: {
    color: "#ffffff",
    fontSize: 16,
    padding: 10,
  },
  noFavorites: {
    color: "#ffffff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  noFavoritesSubtext: {
    color: "#c7d5e0",
    fontSize: 14,
    textAlign: "center",
  },
});
