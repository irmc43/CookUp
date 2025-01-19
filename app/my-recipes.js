import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import { firestore } from "./firebase.config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useRouter } from "expo-router";
import { deleteDoc, doc } from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function MyRecipes() {
  const [myRecipes, setMyRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const router = useRouter();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      fetchMyRecipes(currentUser.uid);
    } else {
      Alert.alert("Fehler", "Sie sind nicht angemeldet. Bitte melden Sie sich an.");
    }
  }, []);

  const fetchMyRecipes = async (userId) => {
    try {
      setLoading(true);
      const recipesRef = collection(firestore, "communityRecipes");
      const q = query(recipesRef, where("user", "==", userId));
      const querySnapshot = await getDocs(q);

      const loadedRecipes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMyRecipes(loadedRecipes);
    } catch (error) {
      console.error("Fehler beim Laden der Rezepte:", error);
      Alert.alert("Fehler", "Fehler beim Laden Ihrer Rezepte.");
    } finally {
      setLoading(false);
    }
  };

  const deleteRecipe = async (recipeId) => {
    try {
      await deleteDoc(doc(firestore, "communityRecipes", recipeId));
      setMyRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe.id !== recipeId));
      Alert.alert("Erfolg", "Rezept erfolgreich gelöscht.");
    } catch (error) {
      console.error("Fehler beim Löschen des Rezepts:", error);
      Alert.alert("Fehler", "Das Rezept konnte nicht gelöscht werden.");
    }
  };

  const confirmDelete = (recipeId) => {
    Alert.alert(
      "Rezept löschen?",
      "Möchten Sie dieses Rezept wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
      [
        { text: "Abbrechen", style: "cancel" },
        { text: "Löschen", onPress: () => deleteRecipe(recipeId), style: "destructive" },
      ]
    );
  };

  const handlePressRecipe = (item) => {
    router.push({
      pathname: `/recipe-detail`,
      params: { recipe: JSON.stringify(item) },
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text>Lade Ihre Rezepte...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meine Rezepte</Text>
      {myRecipes.length > 0 ? (
        <FlatList
          data={myRecipes}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handlePressRecipe(item)} style={styles.recipeItem}>
              <View style={styles.recipeContent}>
                {item.image && (
                  <Image source={{ uri: item.image }} style={styles.recipeImage} />
                )}
                
                <View style={styles.textContainer}>
                  <Text style={styles.recipeText} numberOfLines={1} ellipsizeMode="tail">
                    {item.name}
                  </Text>

                  {item.timeMinutes && (
                    <View style={styles.timeContainer}>
                      <Icon name="access-time" size={16} color="#555" />
                      <Text style={styles.recipeTime}>{item.timeMinutes} Minuten</Text>
                    </View>
                  )}

                </View>
                <TouchableOpacity
                  onPress={() => confirmDelete(item.id)}
                  style={styles.deleteButton}
                >
                  <Icon name="delete" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
         
        />
      ) : (
        <Text>Sie haben noch keine Rezepte erstellt.</Text>
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
  recipeItem: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginVertical: 8,
    padding: 16,
  },
  recipeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  recipeText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  recipeTime: {
    fontSize: 16,
    color: "#555",
    marginLeft: 5,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  deleteButton: {
    backgroundColor: "#E74C3C",
    paddingVertical: 7,
    paddingHorizontal: 7,
    borderRadius: 4,
  },
 
});
