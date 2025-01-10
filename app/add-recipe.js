import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import * as ImagePicker from "expo-image-picker";
import { getAuth } from "firebase/auth";
import { firestore, storage } from "./firebase.config";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import uuid from "react-native-uuid";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function AddRecipe() {
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] = useState("Einfach");
  const [timeMinutes, setTimeMinutes] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [ingredientName, setIngredientName] = useState("");
  const [ingredientAmount, setIngredientAmount] = useState("");
  const [instructionInput, setInstructionInput] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [items] = useState([
    { label: "Einfach", value: "Einfach" },
    { label: "Mittel", value: "Mittel" },
    { label: "Schwierig", value: "Schwierig" },
  ]);

  const auth = getAuth();
  const user = auth.currentUser;

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

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
      let imageUrl = null;
  
      if (imageUri) {
        const imageId = uuid.v4();
        const storageRef = ref(storage, `recipeImages/${user.uid}/${imageId}`);
        const response = await fetch(imageUri);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);
        imageUrl = await getDownloadURL(storageRef);
      }
  
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
        image: imageUrl, 
      };
  
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
  

  const handleAddIngredient = () => {
    if (ingredientName.trim() === "" || ingredientAmount.trim() === "") return;
    setIngredients([...ingredients, { name: ingredientName, amount: ingredientAmount }]);
    setIngredientName("");
    setIngredientAmount("");
  };

  const handleAddInstruction = () => {
    if (instructionInput.trim() === "") return;
    setInstructions([...instructions, instructionInput]);
    setInstructionInput("");
  };

  const removeIngredient = (index) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(updatedIngredients);
  };

  const removeInstruction = (index) => {
    const updatedInstructions = instructions.filter((_, i) => i !== index);
    setInstructions(updatedInstructions);
  };

  const resetForm = () => {
    setName("");
    setDifficulty("Einfach");
    setTimeMinutes("");
    setIngredients([]);
    setInstructions([]);
    setImageUri(null);
    setIngredientName("");
    setIngredientAmount("");
    setInstructionInput("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rezept hinzufügen</Text>

      <TextInput
        style={styles.input}
        placeholder="Rezeptname"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Schwierigkeitsgrad:</Text>
      <DropDownPicker
        open={open}
        value={difficulty}
        items={items}
        setOpen={setOpen}
        setValue={setDifficulty}
        style={styles.picker}
        placeholder="Wählen Sie eine Option"
      />

      <TextInput
        style={styles.input}
        placeholder="Zubereitungszeit (Minuten)"
        value={timeMinutes}
        onChangeText={setTimeMinutes}
        keyboardType="numeric"
      />

      <View style={styles.ingredientContainer}>
        <TextInput
          style={[styles.input, styles.amountInput]}
          placeholder="Menge (z.B. 200g)"
          value={ingredientAmount}
          onChangeText={setIngredientAmount}
        />
        <TextInput
          style={[styles.input, styles.ingredientInput]}
          placeholder="Zutat (z.B. Zucker)"
          value={ingredientName}
          onChangeText={setIngredientName}
        />
      </View>
      <Button title="Zutat hinzufügen" onPress={handleAddIngredient} />

      <FlatList
        data={ingredients}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.listItemContainer}>
            <Text style={styles.listItem}>
              {item.amount} {item.name}
            </Text>
            <TouchableOpacity onPress={() => removeIngredient(index)}>
              <Icon name="close" size={24} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        )}
      />

      <TextInput
        style={styles.input}
        placeholder="Anweisung hinzufügen"
        value={instructionInput}
        onChangeText={setInstructionInput}
      />
      <Button title="Anweisung hinzufügen" onPress={handleAddInstruction} />

      <FlatList
        data={instructions}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.listItemContainer}>
            <Text style={styles.listItem}>{item}</Text>
            <TouchableOpacity onPress={() => removeInstruction(index)}>
              <Icon name="close" size={24} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        )}
      />

      <Button title="Bild auswählen" onPress={pickImage} />
      <Button title="Foto aufnehmen" onPress={takePhoto} />

      {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}

      <Button
        title={loading ? "Hinzufügen..." : "Rezept hinzufügen"}
        onPress={handleAddRecipe}
        disabled={loading}
        color="#3498db"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 16,
    flex: 1,
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
  },
  picker: {
    marginBottom: 10,
  },
  listItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    justifyContent: "space-between",
  },
  listItem: {
    fontSize: 16,
    color: "#333",
    marginRight: 8,
    flex: 1,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginVertical: 10,
    borderRadius: 10,
  },
  ingredientContainer: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 10,
  },
  ingredientInput: {
    flex: 2,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
  },
});














