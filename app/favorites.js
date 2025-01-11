import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { firestore, db } from "./firebase.config";
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { ref, get } from "firebase/database";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const auth = getAuth();
  const router = useRouter();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserId(currentUser.uid); // Benutzer-ID holen
      fetchFavorites(currentUser.uid); // Favoriten laden
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

  // Funktion, um Favoriten zu toggeln
  const toggleFavorite = async (recipeId) => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Anmeldung erforderlich", "Bitte melden Sie sich an, um Favoriten zu speichern.");
      return;
    }

    const userDocRef = doc(firestore, "users", user.uid);
    
    // Bestätigungsdialog vor dem Entfernen aus Favoriten
    Alert.alert(
      "Favorit entfernen?",
      "Möchten Sie dieses Rezept wirklich aus Ihren Favoriten entfernen?",
      [
        {
          text: "Abbrechen",
          style: "cancel",
        },
        {
          text: "Entfernen",
          onPress: async () => {
            // Löschen des Rezepts aus den Favoriten
            const isFavorite = favorites.some((fav) => fav.id === recipeId);
            
            if (isFavorite) {
              await updateDoc(userDocRef, {
                favorites: arrayRemove(recipeId),
              });
              setFavorites(favorites.filter((fav) => fav.id !== recipeId));
            } else {
              await updateDoc(userDocRef, {
                favorites: arrayUnion(recipeId),
              });
              setFavorites([...favorites, { id: recipeId }]);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text>Lade Favoriten...</Text>
      </View>
    );
  }

  const handlePressFavorite = (item) => {
    router.push({
      pathname: `/recipe-detail`,
      params: { recipe: JSON.stringify(item) },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ihre Favoriten</Text>
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handlePressFavorite(item)}>
              <View style={styles.favoriteItem}>
                <Text style={styles.favoriteText}>{item.name}</Text>
                <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                  <Icon name="favorite" size={24} color="red" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
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
  },
  favoriteItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  favoriteText: {
    fontSize: 18,
    color: "#333",
    flex: 1,
  },
});
