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
import { doc, updateDoc, increment } from "firebase/firestore";
import { useRoute, useNavigation } from "@react-navigation/native"; // Importiere Navigation
import Checkbox from "expo-checkbox";

export default function RecipeDetail() {
  const route = useRoute();
  const navigation = useNavigation(); // Initialisiere Navigation
  const { recipe } = route.params;
  const [recipeData, setRecipeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (recipe) {
      try {
        const parsedRecipe = JSON.parse(recipe);
        setRecipeData(parsedRecipe);
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

  const handleRateRecipe = async () => {
    if (!user) {
      Alert.alert(
        "Anmeldung erforderlich",
        "Bitte melden Sie sich an, um das Rezept zu bewerten."
      );
      return;
    }

    if (!recipeData || !recipeData.id) {
      Alert.alert("Fehler", "Rezeptdaten fehlen.");
      return;
    }

    try {
      const recipeRef = doc(firestore, "communityRecipes", recipeData.id);
      await updateDoc(recipeRef, {
        rating: increment(1),
        reviewCount: increment(1),
      });

      Alert.alert("Erfolg", "Danke für Ihre Bewertung!");
    } catch (error) {
      console.error("Fehler beim Bewerten des Rezepts:", error.message);
      Alert.alert("Fehler", "Das Rezept konnte nicht bewertet werden.");
    }
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
      {/* Header-Leiste */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Zurück</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rezeptdetails</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {recipeData.image && (
          <Image source={{ uri: recipeData.image }} style={styles.image} />
        )}
        <Text style={styles.title}>{recipeData.name}</Text>
        <Text style={styles.subtitle}>Schwierigkeit: {recipeData.difficulty}</Text>
        <Text style={styles.subtitle}>
          Zubereitungszeit: {recipeData.timeMinutes} Minuten
        </Text>
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


        <Text style={styles.sectionTitle}>Anweisungen</Text>
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
          <TouchableOpacity style={styles.rateButton} onPress={handleRateRecipe}>
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
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop:30,
    backgroundColor: "#fff",
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
    padding: 12,
    backgroundColor: "#3498db",
    borderRadius: 5,
    alignItems: "center",
  },
  rateButtonText: {
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
