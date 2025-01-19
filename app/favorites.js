import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import { firestore, db } from "./firebase.config";
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { ref, get } from "firebase/database";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const auth = getAuth();
  const router = useRouter();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
      fetchFavorites(currentUser.uid);
    } else {
      Alert.alert("Fehler", "Sie sind nicht angemeldet. Bitte melden Sie sich an.");
    }
  }, []);

  const fetchFavorites = async (userId) => {
    try {
      setLoading(true);
      const userDocRef = doc(firestore, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userFavorites = userData.favorites || [];

        let loadedFavorites = [];
        const recipesRef = ref(db, "recipes");
        const snapshot = await get(recipesRef);

        if (snapshot.exists()) {
          const allRecipes = snapshot.val();
          const filteredRealtimeFavorites = userFavorites
            .filter((fav) => !isNaN(fav))
            .map((index) => ({
              id: index,
              ...allRecipes[index],
              source: "realtime",
            }))
            .filter((recipe) => recipe.name);

          loadedFavorites = [...loadedFavorites, ...filteredRealtimeFavorites];
        }

        const firestoreFavorites = userFavorites.filter((fav) => isNaN(fav));
        for (const favId of firestoreFavorites) {
          const recipeRef = doc(firestore, "communityRecipes", favId);
          const recipeDoc = await getDoc(recipeRef);

          if (recipeDoc.exists()) {
            loadedFavorites.push({
              id: favId,
              ...recipeDoc.data(),
              source: "firestore",
            });
          }
        }

        loadedFavorites.sort((a, b) => a.name.localeCompare(b.name));
        setFavorites(loadedFavorites);
      } else {
        console.error("Benutzerdaten nicht gefunden.");
      }
    } catch (error) {
      console.error("Fehler beim Laden der Favoriten:", error);
      Alert.alert("Fehler", "Fehler beim Laden der Favoriten.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (recipeId) => {
    const user = auth.currentUser;
  
    if (!user) {
      Alert.alert("Anmeldung erforderlich", "Bitte melden Sie sich an, um Favoriten zu speichern.");
      return;
    }
  
    const userDocRef = doc(firestore, "users", user.uid);
  
    if (favorites.some((fav) => fav.id === recipeId)) {
      Alert.alert(
        "Bestätigung erforderlich",
        "Möchten Sie dieses Rezept wirklich aus den Favoriten entfernen?",
        [
          {
            text: "Abbrechen",
            style: "cancel",
          },
          {
            text: "Entfernen",
            onPress: async () => {
              await updateDoc(userDocRef, {
                favorites: arrayRemove(recipeId),
              });
              setFavorites(favorites.filter((fav) => fav.id !== recipeId));
            },
          },
        ],
        { cancelable: true }
      );
    } else {
      await updateDoc(userDocRef, {
        favorites: arrayUnion(recipeId),
      });
    }
  };

  const renderRecipeItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: `/recipe-detail`,
          params: { recipe: JSON.stringify(item) },
        })
      }
    >
      <View style={styles.carouselItem}>
        <Image source={{ uri: item.image }} style={styles.recipeImage} />
        <Text style={styles.recipeTitle} numberOfLines={1} ellipsizeMode="tail">
          {item.name}
        </Text>
        <View style={styles.timeContainer}>
          <Icon name="access-time" size={16} color="#555" />
          <Text style={styles.recipeTime}>{item.timeMinutes} Minuten</Text>
        </View>
        <TouchableOpacity
          onPress={() => toggleFavorite(item.id)}
          style={styles.favoriteIcon}
        >
          <Icon
            name={favorites.some((fav) => fav.id === item.id) ? "favorite" : "favorite-border"}
            size={24}
            color={favorites.some((fav) => fav.id === item.id) ? "#E0115F" : "#555"}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text>Lade Favoriten...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meine Favoriten</Text>
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id.toString()}
          
        />
      ) : (
        <Text>Keine Favoriten gefunden.</Text>
      )}
    </View>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  carouselContainer: {
    flexDirection: "colomn",
    justifyContent: "center",
    marginBottom: 24,
  },
  carouselItem: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
    
  },
  recipeImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },
  recipeTime: {
    fontSize: 16,
    color: "#555",
    marginLeft: 5,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  favoriteIcon: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 4,
  },
});
