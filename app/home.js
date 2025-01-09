import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator, Dimensions, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { getAuth } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { collection, getDocs } from "firebase/firestore";
import { db, firestore } from "./firebase.config";
import { useRouter } from "expo-router";
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

export default function Home() {
  const [myRecipes, setMyRecipes] = useState([]);
  const [communityRecipes, setCommunityRecipes] = useState([]);
  const [loadingMyRecipes, setLoadingMyRecipes] = useState(true);
  const [loadingCommunityRecipes, setLoadingCommunityRecipes] = useState(true);
  const router = useRouter();
  

  // Eigene Rezepte aus der Realtime Database laden
  useEffect(() => {
    const recipesRef = ref(db, "recipes");
    onValue(
      recipesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const recipesArray = Object.entries(data).map(([id, recipe]) => ({
            id, ...recipe
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

  // Community-Rezepte aus Firestore laden
  useEffect(() => {
    const fetchCommunityRecipes = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "communityRecipes"));
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

  if (loadingMyRecipes || loadingCommunityRecipes) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text>wird geladen...</Text>
      </View>
    );
  }


  const renderRecipeItem = ({ item }) => (

    <TouchableOpacity
    onPress={() => router.push({ pathname: `/recipe-detail`, params: { recipe: JSON.stringify(item) } })}
    >
    <View style={styles.carouselItem}>
      <Image source={{ uri: item.image }} style={styles.recipeImage} />
      <Text style={styles.recipeTitle}>{item.name}</Text>
    </View>
  </TouchableOpacity>

  
); 
  
  

  // Kategorien nach Küche
  const allRecipes = [...myRecipes, ...communityRecipes];
  const cuisines = [...new Set(allRecipes.map(recipe => recipe.cuisine))];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Hallo,</Text>

      <Text style={styles.title}>Unsere Rezepte</Text>
      {myRecipes.length > 0 ? (
        <FlatList
          data={myRecipes}
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
        {cuisines.map((cuisine, index) => (
          <TouchableOpacity
            key={`${cuisine}-${index}`} // Key durch Kombination aus `cuisine` und `index`
            style={styles.categoryButton}
          >
            <Text style={styles.categoryText}>{cuisine}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.title}>Community-Rezepte</Text>
      {communityRecipes.length > 0 ? (
        <FlatList
          data={communityRecipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
        />
      ) : (
        <Text style={styles.noRecipesText}>Keine Community-Rezepte gefunden.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
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
    width: width * 0.7, // 70% der Bildschirmbreite
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
    marginLeft: 5, // Abstand zwischen Icon und Text
  },
  timeContainer: {
    flexDirection: "row", // Elemente nebeneinander
    alignItems: "center", // Vertikale Ausrichtung in der Mitte
    marginTop: 5, // Abstand nach oben
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
  buttonContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  profileButton: {
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 8,
  },
  profileButtonText: {
    fontSize: 18,
    color: "#fff",
  },
});












