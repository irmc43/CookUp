import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { getAuth, signOut } from "firebase/auth";

export default function Home() {
  const router = useRouter();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login"); // Zurück zur Login-Seite
    } catch (err) {
      console.log("Logout fehlgeschlagen:", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Willkommen auf der Startseite!</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
});
