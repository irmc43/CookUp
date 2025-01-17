import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image, } from "react-native";
import { getAuth } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { collection,getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc, } from "firebase/firestore";
import { db, firestore } from "./firebase.config";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default function Home() {
  const [myRecipes, setMyRecipes] = useState([]);
  const [communityRecipes, setCommunityRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loadingMyRecipes, setLoadingMyRecipes] = useState(true);
  const [loadingCommunityRecipes, setLoadingCommunityRecipes] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userName, setUserName] = useState("Gast");
  const [cuisines, setCuisines] = useState([]);

  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  // Benutzerdetails laden
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        if (user) {
          const userDocRef = doc(firestore, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists() && userDoc.data().username) {
            setUserName(userDoc.data().username); // Benutzername aus Firestore setzen
          } else {
            console.warn("Kein Benutzername in Firestore gefunden.");
            setUserName("Gast");
          }
        } else {
          console.warn("Kein angemeldeter Benutzer gefunden.");
          setUserName("Gast");
        }
      } catch (error) {
        console.error("Fehler beim Abrufen des Benutzernamens:", error);
        setUserName("Gast");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserName();
  }, [user]);

  // Eigene Rezepte
  useEffect(() => {
    const recipesRef = ref(db, "recipes");
    onValue(
      recipesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const recipesArray = Object.entries(data).map(([id, recipe]) => ({
            id,
            ...recipe,
          }));
          setMyRecipes(recipesArray);
        } else {
          console.log("Keine eigenen Rezepte gefunden.");
        }
        setLoadingMyRecipes(false);
      },
      (error) => {
        console.error("Fehler beim Abrufen der eigenen Rezepte:", error);
        setLoadingMyRecipes(false);
      }
    );
  }, []);

  // Community-Rezepte
  useEffect(() => {
    const fetchCommunityRecipes = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(firestore, "communityRecipes")
        );
        const recipes = [];
        querySnapshot.forEach((doc) => {
          recipes.push({ id: doc.id, ...doc.data() });
        });
        setCommunityRecipes(recipes);
      } catch (error) {
        console.error("Fehler beim Abrufen der Community-Rezepte:", error);
      } finally {
        setLoadingCommunityRecipes(false);
      }
    };

    fetchCommunityRecipes();
  }, []);

  // Kategorien nach Küche
  useEffect(() => {
    const allRecipes = [...myRecipes, ...communityRecipes];
    const cuisines = [
      ...new Set(
        allRecipes
          .map((recipe) => recipe.cuisine)
          .filter((cuisine) => cuisine)  // Filtern von leeren/undefinierten Werten
      ),
    ];
    setCuisines(cuisines);
  }, [myRecipes, communityRecipes]);

  // Favoriten des Benutzers
  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setFavorites(userDoc.data().favorites || []);
        }
      }
    };

    fetchFavorites();
  }, [user]);

  // Favoriten hinzufügen/entfernen
  const toggleFavorite = async (recipeId) => {
    if (!user) {
      Alert.alert(
        "Anmeldung erforderlich",
        "Bitte melden Sie sich an, um Favoriten zu speichern."
      );
      return;
    }

    const userDocRef = doc(firestore, "users", user.uid);

    if (favorites.includes(recipeId)) {
      await updateDoc(userDocRef, {
        favorites: arrayRemove(recipeId),
      });
      setFavorites(favorites.filter((id) => id !== recipeId));
    } else {
      await updateDoc(userDocRef, {
        favorites: arrayUnion(recipeId),
      });
      setFavorites([...favorites, recipeId]);
    }
  };

  // Auf 5 Rezepte/Kategorien begrenzen 
  const limitedMyRecipes = myRecipes.slice(0, 5);
  const limitedCommunityRecipes = communityRecipes.slice(0, 5);
  const limitedCuisines = cuisines.slice(0, 5);

  if (loadingMyRecipes || loadingCommunityRecipes || loadingUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text>wird geladen...</Text>
      </View>
    );
  }

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
        <Text style={styles.recipeTitle} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
        <View style={styles.timeContainer}>
          <Icon name="access-time" size={16} color="#555" />
          <Text style={styles.recipeTime}>{item.timeMinutes} Minuten</Text>
        </View>
        <TouchableOpacity
          onPress={() => toggleFavorite(item.id)}
          style={styles.favoriteIcon}
        >
          <Icon
            name={favorites.includes(item.id) ? "favorite" : "favorite-border"}
            size={24}
            color={favorites.includes(item.id) ? "#E0115F" : "#555"}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={[styles.title, styles.welcomeTitle]}>Hallo, {userName}</Text>

      <Text style={styles.title}>Unsere Rezepte</Text>
      {limitedMyRecipes.length > 0 ? (
        <FlatList
          data={limitedMyRecipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
        />
      ) : (
        <Text style={styles.noRecipesText}>Keine eigenen Rezepte gefunden.</Text>
      )}

      <Text style={styles.title}>Kategorien</Text>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {limitedCuisines.map((cuisine, index) => (
          <TouchableOpacity
            key={`${cuisine}-${index}`} // Key durch Kombination aus `cuisine` und `index`
            style={styles.categoryButton}
          >
            <Text style={styles.categoryText}>{cuisine}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.title}>Community-Rezepte</Text>
      {limitedCommunityRecipes.length > 0 ? (
        <FlatList
          data={limitedCommunityRecipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
        />
      ) : (
        <Text style={styles.noRecipesText}>
          Keine Community-Rezepte gefunden.
        </Text>
      )}
    </ScrollView>
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
  welcomeTitle: {
    fontSize: 20,
  },
  carouselContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  carouselItem: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 8,
    width: width * 0.7,
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
  categoriesContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  categoryButton: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
    margin: 5,
  },
  categoryText: {
    fontSize: 18,
    color: "#333",
  },

  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noRecipesText: {
    textAlign: "center",
    fontSize: 16,
    color: "#999",
    marginTop: 16,
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












