import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system"; 
import { getAuth } from "firebase/auth";
import { db } from "./firebase.config";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function AddRecipe() {
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [timeMinutes, setTimeMinutes] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [imageUri, setImageUri] = useState(null); // Zustand für das Bild
  const [imageBase64, setImageBase64] = useState(null); // Zustand für Base64 des Bildes
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

  // Funktion zum Bild auswählen
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      convertImageToBase64(result.assets[0].uri); // Bild in Base64 umwandeln
    }
  };

  // Funktion zum Konvertieren des Bildes in Base64
  const convertImageToBase64 = async (uri) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setImageBase64(base64); // Base64 im Zustand speichern
    } catch (error) {
      console.error("Fehler beim Konvertieren des Bildes in Base64:", error);
    }
  };

  // Funktion zum Hinzufügen eines Rezepts
  const handleAddRecipe = async () => {
    if (!user) {
      Alert.alert("Fehler", "Bitte melden Sie sich an, um ein Rezept hinzuzufügen.");
      return;
    }

    if (!name || !difficulty || !timeMinutes || ingredients.length === 0 || instructions.length === 0) {
      Alert.alert("Fehler", "Bitte füllen Sie alle Felder aus.");
      return;
    }

    setLoading(true);

    try {
      // Rezeptdaten zusammenstellen
      const newRecipe = {
        name,
        difficulty,
        timeMinutes: parseInt(timeMinutes),
        ingredients,
        instructions,
        user: user.uid,
        createdAt: Timestamp.now(),
        rating: 0,
        reviewCount: 0,
        image: imageBase64, // Base64-String des Bildes speichern
      };

      // Rezept in Firestore speichern
      const recipeRef = collection(db, "communityRecipes");
      await addDoc(recipeRef, newRecipe);

      Alert.alert("Erfolg", "Rezept wurde erfolgreich hinzugefügt!");
      resetForm();
    } catch (error) {
      console.error("Fehler beim Hinzufügen des Rezepts:", error.message);
      Alert.alert("Fehler", `Fehler beim Hinzufügen des Rezepts: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Formular zurücksetzen
  const resetForm = () => {
    setName("");
    setDifficulty("");
    setTimeMinutes("");
    setIngredients([]);
    setInstructions([]);
    setImageUri(null);
    setImageBase64(null); // Base64 zurücksetzen
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Rezept hinzufügen</Text>

      <TextInput
        style={styles.input}
        placeholder="Rezeptname"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Schwierigkeitsgrad (z. B. Einfach, Mittel, Schwer)"
        value={difficulty}
        onChangeText={setDifficulty}
      />
      <TextInput
        style={styles.input}
        placeholder="Zubereitungszeit (Minuten)"
        value={timeMinutes}
        onChangeText={setTimeMinutes}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Zutaten (kommagetrennt)"
        value={ingredients.join(", ")}
        onChangeText={(text) => setIngredients(text.split(",").map((item) => item.trim()))}
      />
      <TextInput
        style={styles.input}
        placeholder="Anweisungen (kommagetrennt)"
        value={instructions.join(", ")}
        onChangeText={(text) => setInstructions(text.split(",").map((item) => item.trim()))}
      />

      {/* Bild auswählen */}
      <Button title="Bild auswählen" onPress={pickImage} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}

      <Button
        title={loading ? "Hinzufügen..." : "Rezept hinzufügen"}
        onPress={handleAddRecipe}
        disabled={loading}
        color="#3498db"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginVertical: 10,
    borderRadius: 10,
  },
});







