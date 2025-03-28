import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";

const API_KEY = "86CB3C2D3979246CC2D6BE41E68DDEBD";
const BASE_URL = "https://api.steampowered.com";

interface Game {
  appid: number;
  name: string;
  header_image?: string;
  player_count: number;
}

export default function HomeScreen() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchGames() {
      try {
        setIsLoading(true);
        const allGamesRes = await fetch(
          `${BASE_URL}/ISteamApps/GetAppList/v2/`
        );
        const allGamesData = await allGamesRes.json();
        const allGames = allGamesData.applist.apps.slice(0, 100);

        const gamesWithPlayers = await Promise.all(
          allGames.map(async (game: any) => {
            const playerRes = await fetch(
              `${BASE_URL}/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${game.appid}`
            );
            const playerData = await playerRes.json();
            return {
              ...game,
              player_count: playerData.response?.player_count || 0,
              header_image: `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
            };
          })
        );

        const sortedGames = gamesWithPlayers
          .sort((a, b) => b.player_count - a.player_count)
          .slice(0, 10);
        setGames(sortedGames);
      } catch (err) {
        console.error("Error fetching games:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGames();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={games}
        keyExtractor={(item) => item.appid.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/game?appid=${item.appid}`)}
          >
            <View>
              <Image
                source={{ uri: item.header_image }}
                style={{ width: 100, height: 100 }}
              />
              <Text>{item.name}</Text>
              <Text>Players: {item.player_count}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
