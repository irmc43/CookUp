import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { getAuth } from "firebase/auth";
import { firestore } from "./firebase.config";
import { doc, updateDoc, increment, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import Checkbox from "expo-checkbox";
import Icon from "react-native-vector-icons/MaterialIcons";
import Icon2 from "react-native-vector-icons/MaterialCommunityIcons";  
import { useRouter } from "expo-router";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function RecipeDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { recipe } = route.params;
  const [recipeData, setRecipeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;
  const router = useRouter();


  useEffect(() => {
    if (recipe) {
      try {
        const parsedRecipe = JSON.parse(recipe);
        setRecipeData(parsedRecipe);
        checkFavoriteStatus(parsedRecipe.id);
      } catch (error) {
        console.error("Fehler beim Parsen des Rezepts:", error);
        Alert.alert("Fehler", "Rezept konnte nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [recipe]);

  const checkFavoriteStatus = async (recipeId) => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userFavorites = userDoc.data().favorites || [];
        setFavorites(userFavorites);
        setIsFavorite(userFavorites.includes(recipeId));
      }
    }
  };

  const handleRateRecipe = async () => {
      Alert.alert(
        "Fehler",
        "Derzeit keine Bewertung möglich"
      );
      return;
  };

  const handleCheckIngredient = (ingredient) => {
    setCheckedIngredients((prev) => {
      if (prev.includes(ingredient)) {
        return prev.filter((item) => item !== ingredient);
      } else {
        return [...prev, ingredient];
      }
    });
  };

  const toggleFavorite = async () => {
    if (!user) {
      Alert.alert(
        "Anmeldung erforderlich",
        "Bitte melden Sie sich an, um Favoriten zu speichern."
      );
      return;
    }

    const userDocRef = doc(firestore, "users", user.uid);

    if (isFavorite) {
      await updateDoc(userDocRef, {
        favorites: arrayRemove(recipeData.id),
      });
      setFavorites(favorites.filter((id) => id !== recipeData.id));
      setIsFavorite(false);
    } else {
      await updateDoc(userDocRef, {
        favorites: arrayUnion(recipeData.id),
      });
      setFavorites([...favorites, recipeData.id]);
      setIsFavorite(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Rezeptdetails werden geladen...</Text>
      </View>
    );
  }

  if (!recipeData) {
    return (
      <View style={styles.errorContainer}>
        <Text>Keine Rezeptdetails verfügbar.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={28} color="#3498db" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rezeptdetails</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {recipeData.image && (
          <Image source={{ uri: recipeData.image }} style={styles.image} />
        )}
        <Text style={styles.title}>{recipeData.name}</Text>
        <Text style={styles.subtitle}>Schwierigkeit: {recipeData.difficulty}</Text>
        <Text paddingBottom={20} style={styles.subtitle}>
          Zubereitungszeit: {recipeData.timeMinutes} Minuten
        </Text>

        <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
          <Icon
            name={isFavorite ? "favorite" : "favorite-border"}
            size={20}
            color="#fff"
            style={styles.icons}
          />
          <Text style={styles.favoriteButtonText}>
            {isFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Zutaten</Text>

        {recipeData.ingredients?.length > 0 ? (
          recipeData.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientRow}>
              <Checkbox
                value={checkedIngredients.includes(ingredient.name)} // Nur den Namen überprüfen
                onValueChange={() => handleCheckIngredient(ingredient.name)} // Nur den Namen verarbeiten
                style={styles.checkbox}
              />
              <Text style={styles.text}>
                {ingredient.amount} {ingredient.name}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.text}>Keine Zutaten verfügbar.</Text>
        )}

        <Text style={styles.sectionTitle}>Zubereitung</Text>
        {recipeData.instructions?.length > 0 ? (
          recipeData.instructions.map((instruction, index) => (
            <Text key={index} style={styles.text}>
              {index + 1}. {instruction}
            </Text>
          ))
        ) : (
          <Text style={styles.text}>Keine Anweisungen verfügbar.</Text>
        )}

        <View style={styles.buttonContainer}>
          
          <TouchableOpacity
            style={styles.rateButton}
            onPress={() =>
              router.push({
                pathname: `/cook-mode`,
                params: { recipe: JSON.stringify(recipeData) },
              })
            }
          >
           <Icon2 name={"chef-hat"} size={20} color="#fff" style={styles.icons}/> 
            <Text style={styles.rateButtonText}>Jetzt nachkochen</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.rateButton} onPress={handleRateRecipe}>
          <Icon2 name={"star"} size={20} color="#fff" style={styles.icons}/> 
            <Text style={styles.rateButtonText}>Rezept bewerten</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 2,
    paddingLeft: 0,
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: "#3498db",
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3498db",
  },
  content: {
    padding: 16,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#555",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkbox: {
    marginRight: 8,
  },
  buttonContainer: {
    marginTop: 20,
  },
  rateButton: {
    padding: 10,
    backgroundColor: "#3498db",
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 16,
    flexDirection: "row", 
    justifyContent: "center",
  },
  rateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  favoriteButton: {
    padding: 10,
    backgroundColor: "#E0115F",
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 16,
    flexDirection: "row", 
    justifyContent: "center",
  },
  icons: {
    marginRight: 8,
  },
  favoriteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
});
