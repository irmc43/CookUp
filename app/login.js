import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router"; // Import useRouter für die Navigation

import { initializeApp } from "@firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "@firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB1e1pi0ogicETqB0BNFfLSGzWHFK8V2l4",
  authDomain: "cookup-bf3d9.firebaseapp.com",
  databaseURL: "https://cookup-bf3d9-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cookup-bf3d9",
  storageBucket: "cookup-bf3d9.firebasestorage.app",
  messagingSenderId: "435748210401",
  appId: "1:435748210401:web:8a0907cab10f536926d9a0"
};

const app = initializeApp(firebaseConfig);

const AuthScreen = ({
  email,
  setEmail,
  password,
  setPassword,
  isLogin,
  setIsLogin,
  handleAuthentication,
}) => {
  return (
    <View style={styles.authContainer}>
      <Text style={styles.title}>{isLogin ? "Anmelden" : "Registrieren"}</Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="E-Mail"
        autoCapitalize="none"
        placeholderTextColor="#929292"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Passwort"
        secureTextEntry
        placeholderTextColor="#929292"
      />
      <View style={styles.buttonContainer}>
        <Button
          title={isLogin ? "Anmelden" : "Registrieren"}
          onPress={handleAuthentication}
          color="#3498db"
        />
      </View>

      <View style={styles.bottomContainer}>
        <Text style={styles.toggleText} onPress={() => setIsLogin(!isLogin)}>
          {isLogin ? "Benötigen Sie ein Konto? Registrieren" : "Sie haben bereits ein Konto? Anmelden"}
        </Text>
      </View>
    </View>
  );
};

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null); // Track user authentication state
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter(); // Router für Navigation

  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);

      // Wenn der Benutzer eingeloggt ist, leite zum Home-Screen weiter
      if (user) {
        router.replace("/home");
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleAuthentication = async () => {
    try {
      if (isLogin) {
        // Sign in
        await signInWithEmailAndPassword(auth, email, password);
        console.log("User signed in successfully!");
      } else {
        // Sign up
        await createUserWithEmailAndPassword(auth, email, password);
        console.log("User created successfully!");
      }
    } catch (error) {
      console.error("Authentication error:", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {user ? null : ( // Zeige die Authentifizierungsseite nur, wenn kein Benutzer angemeldet ist
        <AuthScreen
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          handleAuthentication={handleAuthentication}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f0f0f0",
  },
  authContainer: {
    width: "80%",
    maxWidth: 400,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  toggleText: {
    color: "#3498db",
    textAlign: "center",
  },
  bottomContainer: {
    marginTop: 20,
  },
});