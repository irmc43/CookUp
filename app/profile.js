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
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
    marginBottom: 16,
    textAlign: "center",
  },
  infoText: {
    fontSize: 18,
    marginBottom: 24,
  },
  logoutButton: {
    backgroundColor: "#3498db",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

/* alte abmeldefunktion für web
const handleLogout = async () => {
  try {
    await signOut(auth);
    router.replace("/login");
  } catch (error) {
    console.error("Fehler beim Abmelden:", error);
  }
};*/
