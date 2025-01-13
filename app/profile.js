import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import { app } from "./firebase.config";

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
        <Text  style={styles.myRecText}>Meine Rezepte</Text> 
      </TouchableOpacity>
      <TouchableOpacity style={styles.myRecButton}
        onPress={() =>
          router.push({
            pathname: `/favorites`,
          })}>
        <Text  style={styles.myRecText}>Meine Favoriten</Text> 
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Abmelden</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // Vertikal zentrieren
    alignItems: "center", // Horizontal zentrieren
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
  logoutButton: {
    padding: 12,
    backgroundColor: "#E74C3C",
    borderRadius: 5,
    alignItems: "center",
    marginTop:10,
    width: "80%"
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
    marginTop:10,
    width: "80%"
  },
  myRecText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
