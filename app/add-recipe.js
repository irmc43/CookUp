import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
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
    <FlatList
      data={[{ id: "form" }]}
      keyExtractor={(item) => item.id}
      renderItem={() => (
        <View style={styles.container}>
          <Text style={styles.title}>Rezept hinzufügen</Text>

          <TextInput
            style={styles.nameInput}
            placeholder="Rezeptname"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
          />

          <View style={styles.difficultyTimeWrapper}>
            <View style={styles.difficultyTimeContainer}>
              <View style={styles.difficultyContainer}>
                <Text style={styles.label}>Schwierigkeit:</Text>
                <DropDownPicker
                  open={open}
                  value={difficulty}
                  items={items}
                  setOpen={setOpen}
                  setValue={setDifficulty}
                  style={styles.picker}
                  placeholder="Wählen Sie eine Option"
                />
              </View>
              <View style={styles.timeContainer}>
                <Text style={styles.label}>Zeitaufwand:</Text>
                <TextInput
                  style={[styles.input, styles.timeInput]}
                  placeholder="Minuten"
                  placeholderTextColor="#aaa"
                  value={timeMinutes}
                  onChangeText={setTimeMinutes}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={styles.separator} />
          <Text style={styles.sectionTitle}>Zutaten</Text>
          <View style={styles.sectionBlock}>
            <View style={styles.ingredientContainer}>
              <TextInput
                style={[styles.input, styles.amountInput]}
                placeholder="Menge (z.B. 200g)"
                placeholderTextColor="#aaa"
                value={ingredientAmount}
                onChangeText={setIngredientAmount}
              />
              <TextInput
                style={[styles.input, styles.ingredientInput]}
                placeholder="Zutat (z.B. Zucker)"
                placeholderTextColor="#aaa"
                value={ingredientName}
                onChangeText={setIngredientName}
              />
            </View>
            
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddIngredient}>
              <Text style={styles.addButtonText}>Zutat hinzufügen</Text>
              <Icon name="add" size={20} style={styles.addButtonIcon} />
          </TouchableOpacity>
          {ingredients.map((item, index) => (
              <View key={index} style={styles.addedBlock}>
                <Text style={styles.ingredientText}>
                  {item.amount} {item.name}
                </Text>
                <TouchableOpacity onPress={() => removeIngredient(index)}>
                  <Icon name="close" size={24} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            ))}

          <View style={styles.separator} />
          <Text style={styles.sectionTitle}>Zubereitung</Text>
          <View style={styles.sectionBlock}>
            <TextInput
            style={[styles.input, styles.instructionInput]}
            placeholder="Anweisung hinzufügen"
            placeholderTextColor="#aaa"
            value={instructionInput}
            onChangeText={setInstructionInput}
            multiline={true}
            numberOfLines={4} 
            />
            </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddInstruction}>
              <Text style={styles.addButtonText}>Anweisung hinzufügen</Text>
              <Icon name="add" size={20} style={styles.addButtonIcon} />
          </TouchableOpacity>
          {instructions.map((item, index) => (
              <View key={index} style={styles.addedBlock}>
                <Text style={styles.instructionText}>{item}</Text>
                <TouchableOpacity onPress={() => removeInstruction(index)}>
                  <Icon name="close" size={24} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.separator} />
          <Text style={styles.sectionTitle}>Bild hinzufügen</Text>
          <View style={styles.imageButtonContainer}>
            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <Icon name="image" size={32} color="white" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Bild auswählen</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={takePhoto}>
              <Icon name="camera-alt" size={32} color="white" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Foto aufnehmen</Text>
            </TouchableOpacity>
          </View>
          
          {imageUri && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity 
              style={styles.removeButton} 
              onPress={() => setImageUri(null)}
              >
                <Icon name="delete" size={24} color="#e74c3c" />
                <Text style={styles.removeButtonText}>Bild entfernen</Text>
                </TouchableOpacity>
                </View>
              )}
              <View style={styles.separator} />
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                style={styles.addRecButton}
                onPress={handleAddRecipe}
                disabled={loading}
                >
                  <Icon name="check-circle" size={20} color="white" style={styles.addRecButtonIcon} />
                  <Text style={styles.addRecButtonText}>
                    {loading ? "Hinzufügen..." : "Rezept hinzufügen"}
                  </Text>
                </TouchableOpacity>
              </View>
        </View>
        )}
        />
      );
    }

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  nameInput: {
    width: "100%",
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    backgroundColor: "#fefefe",
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    backgroundColor: "#fefefe",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  picker: {
    marginBottom: 12,
    borderColor: "#ddd",
    flex: 1,
    width: "auto",
    marginRight: 12,
  },
  timeInput: {
    flex: 2,
    width: "auto",
    marginBottom: 12,
  },
  difficultyTimeWrapper: {
    marginBottom: 12,
  },
  difficultyTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  difficultyContainer: {
    flex: 1,
    marginRight: 8,
  },
  timeContainer: {
    flex: 1,
  },
  separator: {
    borderBottomWidth: 1,
    borderColor: "#ddd",
    marginVertical: 20,
  },
  sectionTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  sectionBlock: {
    padding: 16,
    backgroundColor: "#f4f4f4",
    borderRadius: 8,
    marginBottom: 15,
  },
  ingredientContainer: {
    flexDirection: "row",
    width: "100%",
  },
  ingredientInput: {
    flex: 2,
    marginLeft: 8,
  },
  amountInput: {
    flex: 1,
    marginRight: 8,
  },
  listItem: {
    fontSize: 16,
  },
  imageButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  button: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: "#3498db",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    marginTop: 8,
  },
  buttonIcon: {
    color: "white",
  },  
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 5,
    marginBottom: 15,
    justifyContent: "flex-end"
  },
  addButtonText: {
    color: "#7d7d7d",
    fontSize: 16,
  },
  addButtonIcon: {
    marginLeft: 10,
    color: "#fff",
    backgroundColor: "#3498db",
    borderRadius: 5,
  },
  addRecButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 5,
    marginBottom: 15,
    justifyContent: "center",
    marginTop: 0,
  },
  addRecButtonText: {
    color: "white",
    fontSize: 16,
  },
  addRecButtonIcon: {
    marginRight: 10,
  },
  buttonContainer: {
    marginTop: 20,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 16,
    marginBottom: 16,
  },
  ingredientText: {
    fontSize: 16,
  },
  addedBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    backgroundColor: "#f4f4f4",
  },
  instructionText: {
    fontSize: 16,
  },
  instructionInput: {
    height: 80,
    textAlignVertical: "top",
    padding: 10,
  }, 
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  removeButtonText: {
    color: "#e74c3c",
    marginLeft: 8,
    fontSize: 16,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },  
});








