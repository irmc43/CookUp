import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Button,
  Alert,
} from "react-native";
import { getAuth } from "firebase/auth";
import { firestore } from "./firebase.config";
import { doc, updateDoc, increment } from "firebase/firestore";
import { useRoute } from '@react-navigation/native';
import Checkbox from 'expo-checkbox'; // Importiere Checkbox von expo-checkbox

export default function RecipeDetail() {
  const route = useRoute();
  const { recipe } = route.params;  // Hole die "recipe"-Daten von den Routenparametern
  const [recipeData, setRecipeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState([]);  // State für die ausgewählten Zutaten
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (recipe) {
      try {
        const parsedRecipe = JSON.parse(recipe); // Überprüft, ob gültiges JSON
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
      Alert.alert("Anmeldung erforderlich", "Bitte melden Sie sich an, um das Rezept zu bewerten.");
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

  // Funktion zum Aktualisieren des Status einer Zutat
  const handleCheckIngredient = (ingredient) => {
    setCheckedIngredients((prev) => {
      if (prev.includes(ingredient)) {
        return prev.filter((item) => item !== ingredient); // Entfernt das Element, wenn es schon ausgewählt wurde
      } else {
        return [...prev, ingredient]; // Fügt das Element hinzu, wenn es nicht ausgewählt wurde
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
    <ScrollView contentContainerStyle={styles.container}>
      {recipeData.image && (
        <Image source={{ uri: recipeData.image }} style={styles.image} />
      )}
      <Text style={styles.title}>{recipeData.name}</Text>
      <Text style={styles.subtitle}>
        Schwierigkeit: {recipeData.difficulty}
      </Text>
      <Text style={styles.subtitle}>
        Zubereitungszeit: {recipeData.timeMinutes} Minuten
      </Text>
      <Text style={styles.sectionTitle}>Zutaten</Text>

      {recipeData.ingredients?.length > 0 ? (
        recipeData.ingredients.map((ingredient, index) => (
          <View key={index} style={styles.ingredientRow}>
            <Checkbox
              value={checkedIngredients.includes(ingredient)} // Setzt den Wert basierend auf dem checked state
              onValueChange={() => handleCheckIngredient(ingredient)} // Callback, um den Wert zu ändern
              style={styles.checkbox}
            />
            <Text style={styles.text}>{ingredient}</Text>
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
        <Button title="Rezept bewerten" onPress={handleRateRecipe} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
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
  buttonContainer: {
    marginTop: 20,
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
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkbox: {
    marginRight: 8,
  },
});
