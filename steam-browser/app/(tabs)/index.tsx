import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";

const API_URL = "https://steamapi.xpaw.me/v1/games/popular";

interface Game {
  appid: number;
  name: string;
  header_image: string;
}

export default function HomeScreen() {
  const [games, setGames] = useState<Game[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setGames(data.games as Game[]))
      .catch((err) => console.error(err));
  }, []);

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
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
