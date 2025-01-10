import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getAuth } from "firebase/auth";
import { firestore } from "./firebase.config";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { TouchableOpacity } from "react-native";

export default function AddRecipe() {
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [timeMinutes, setTimeMinutes] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

  // Funktion zum Bild auswählen
  const pickImage = async () => {
    // Berechtigungen anfordern
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri); // Setze den URI des Bildes
    }
  };

  // Funktion zum Foto aufnehmen
  const takePhoto = async () => {
    // Berechtigungen anfordern
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri); // Setze den URI des aufgenommenen Bildes
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
        image: imageUri,
      };

      // Rezept in Firestore speichern
      const recipeRef = collection(firestore, "communityRecipes");
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
    setImageUri(null); // Bild-URI zurücksetzen
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Rezept hinzufügen</Text>

      <TextInput
        style={styles.input}
        placeholder="Rezeptname"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Schwierigkeitsgrad (z. B. Einfach, Mittel, Schwer)"
        placeholderTextColor="#888"
        value={difficulty}
        onChangeText={setDifficulty}
      />
      <TextInput
        style={styles.input}
        placeholder="Zubereitungszeit (Minuten)"
        placeholderTextColor="#888"
        value={timeMinutes}
        onChangeText={setTimeMinutes}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Zutaten (kommagetrennt)"
        placeholderTextColor="#888"
        value={ingredients.join(", ")}
        onChangeText={(text) => setIngredients(text.split(",").map((item) => item.trim()))}
      />
      <TextInput
        style={styles.input}
        placeholder="Anweisungen (kommagetrennt)"
        placeholderTextColor="#888"
        value={instructions.join(", ")}
        onChangeText={(text) => setInstructions(text.split(",").map((item) => item.trim()))}
      />

      {/* Bild auswählen */}
      <Button title="Bild auswählen" onPress={pickImage} />
      {/* Foto aufnehmen */}
      <Button title="Foto aufnehmen" onPress={takePhoto} />
      
      {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          id="add-recipe"
          style={[
            styles.addbutton,
            loading && styles.buttonDisabled,
          ]}
          onPress={handleAddRecipe}
          disabled={loading} 
        >
          <Text style={styles.buttonText}>
            {loading ? "Hinzufügen..." : "Rezept hinzufügen"}
          </Text>
        </TouchableOpacity>
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop:78,
    padding: 16,
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
    backgroundColor: "#fefefe",
    color: "#black",
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginVertical: 10,
    borderRadius: 10,
  },
  
  addbutton: {
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3498db",
  },
  buttonDisabled: {
    backgroundColor: "#aaa", 
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  buttonContainer: {
    width: "100%",
    marginTop: 20,
    
  },
  
  
});








