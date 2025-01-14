import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import { app } from "./firebase.config";
import Icon from "react-native-vector-icons/MaterialIcons";

const auth = getAuth(app);

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (!user) {
        router.replace("/login"); // Weiterleitung zur Login-Seite, falls der Benutzer nicht eingeloggt ist
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    // Bestätigung vor dem Abmelden
    Alert.alert(
      "Abmelden?",
      "Möchten Sie sich wirklich abmelden?",
      [
        {
          text: "Abbrechen",
          style: "cancel",
        },
        {
          text: "Abmelden",
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace("/login");
            } catch (error) {
              console.error("Fehler beim Abmelden:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Lade dein Profil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Text style={styles.infoText}>E-Mail: {user.email}</Text>
      
      <TouchableOpacity style={styles.myRecButton}
        onPress={() =>
          router.push({
            pathname: `/my-recipes`,
          })}>
            <Icon name={"book"} size={20} color="#fff" style={styles.icons}/> 
        <Text  style={styles.myRecText}>Meine Rezepte</Text> 
      </TouchableOpacity>
      <TouchableOpacity style={styles.myRecButton}
        onPress={() =>
          router.push({
            pathname: `/favorites`,
          })}>
        <Icon name={"favorite"} size={20} color="#fff" style={styles.icons}/> 
        <Text  style={styles.myRecText}>Meine Favoriten</Text> 
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <Icon name={"logout"} size={20} color="#fff" style={styles.icons}/> 
        <Text style={styles.logoutButtonText}>Abmelden</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 24,
  },
  icons: {
    marginRight: 8,
  },
  logoutButton: {
    padding: 12,
    backgroundColor: "#E74C3C",
    borderRadius: 5,
    alignItems: "center",
    marginTop: 30,
    width: "80%",
    flexDirection: "row", 
    justifyContent: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  myRecButton:{
    padding: 12,
    backgroundColor: "#3498db",
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
    width: "80%",
    flexDirection: "row", 
    justifyContent: "center",
  },
  myRecText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
