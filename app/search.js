import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { ref, get } from "firebase/database";
import { getDocs, collection } from "firebase/firestore";
import Icon from "react-native-vector-icons/AntDesign";
import { useRouter } from "expo-router";
import { db, firestore } from "./firebase.config";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchAllRecipes();
  }, []);

  const fetchAllRecipes = async () => {
    try {
      setLoading(true);

      // Rezepte aus der Realtime Database
      const recipesRef = ref(db, "recipes");
      const snapshot = await get(recipesRef);

      let recipesList = [];
      if (snapshot.exists()) {
        recipesList = Object.entries(snapshot.val()).map(([key, recipe]) => ({
          id: key, // Schlüssel als ID verwenden
          ...recipe,
        }));
      } else {
        console.error("Keine Rezepte in der Realtime Database gefunden.");
      }

      // Community-Rezepte aus Firestore
      const communityRecipesRef = collection(firestore, "communityRecipes");
      const communitySnapshot = await getDocs(communityRecipesRef);
      const communityRecipes = communitySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Alle Rezepte kombinieren
      const allCombinedRecipes = [...recipesList, ...communityRecipes];
      setAllRecipes(allCombinedRecipes);

      // Wenn die Suchleiste leer ist, Anzeige von maximal 8 Rezepten
      setFilteredRecipes(allCombinedRecipes.slice(0, 8));
      //setFilteredRecipes(allCombinedRecipes); // Alle Rezepte anzeigen

    } catch (error) {
      console.error("Fehler beim Laden der Rezepte:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtern der Rezepte basierend auf Suchabfrage
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredRecipes(allRecipes.slice(0, 8));
    } else {
      const filtered = allRecipes.filter((recipe) =>
        recipe.name.toLowerCase().includes(query.toLowerCase()) // Suche nach Rezeptname (case insensitive)
      );
      setFilteredRecipes(filtered);
    }
  };

  // Wenn ein Rezept angeklickt wird, weiter zur Detailseite
  const handlePressRecipe = (item) => {
    router.push({
      pathname: "/recipe-detail",
      params: { recipe: JSON.stringify(item) },
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text>Lade Rezepte...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rezepte suchen</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Suche nach Rezepten..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {filteredRecipes.length > 0 ? (
        <FlatList
          data={filteredRecipes}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handlePressRecipe(item)}>
              <View style={styles.recipeItem}>
                <Text style={styles.recipeName}>{item.name}</Text>
                <Icon name="search1" size={22} color="#3498db" />
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()} // Sicherstellen, dass jeder Eintrag eine ID hat (Flatlist)
        />
      ) : (
        <Text style={styles.noResults}>Keine Rezepte gefunden.</Text>
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
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    fontSize: 14,
    borderRadius: 10,
  },
  recipeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  recipeName: {
    fontSize: 18,
    color: "#333",
    flex: 1,
  },
  noResults: {
    fontSize: 16,
    color: "#888",
  },
});
