import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator } from "react-native";

interface GameDetails {
  appid: number;
  name: string;
  header_image: string;
  player_count: number;
}

export default function GameDetailsScreen() {
  const { appid } = useLocalSearchParams();
  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appid) return;

    fetch(`https://steamapi.xpaw.me/v1/game/${appid}`)
      .then((res) => res.json())
      .then((data) => {
        setGame(data as GameDetails);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [appid]);

  if (loading) return <ActivityIndicator size="large" />;
  if (!game) return <Text>Błąd ładowania danych</Text>;

  return (
    <View>
      <Image
        source={{ uri: game.header_image }}
        style={{ width: 200, height: 100 }}
      />
      <Text>{game.name}</Text>
      <Text>Graczy online: {game.player_count}</Text>
    </View>
  );
}
