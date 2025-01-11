import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "@firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { firestore, app } from "./firebase.config";

const AuthScreen = ({
  email,
  setEmail,
  password,
  setPassword,
  username,
  setUsername,
  isLogin,
  setIsLogin,
  handleAuthentication,
  errorMessage,
}) => {
  return (
    <View style={styles.authContainer}>
      <Text style={styles.title}>{isLogin ? "Anmelden" : "Registrieren"}</Text>
      
      {!isLogin && (
        <TextInput
          style={[styles.input, errorMessage ? styles.inputError : null]}
          value={username}
          onChangeText={setUsername}
          placeholder="Benutzername"
          autoCapitalize="none"
          placeholderTextColor="#929292"
        />
      )}

      <TextInput
        style={[styles.input, errorMessage ? styles.inputError : null]} 
        value={email}
        onChangeText={setEmail}
        placeholder="E-Mail"
        autoCapitalize="none"
        placeholderTextColor="#929292"
      />
      <TextInput
        style={[styles.input, errorMessage ? styles.inputError : null]}
        value={password}
        onChangeText={setPassword}
        placeholder="Passwort"
        secureTextEntry
        placeholderTextColor="#929292"
      />
      
      {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
      
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
  const [username, setUsername] = useState(""); 
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);

      if (user) {
        router.replace("/home");
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleAuthentication = async () => {
    setErrorMessage(""); // Fehlermeldung zu Beginn wird zurückgesetzt

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("User signed in successfully!");
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("User created successfully!");

        // Benutzernamen in Firestore speichern
        const userId = userCredential.user.uid;
        await setDoc(doc(firestore, "users", userId), {
          username,
          email,
        });
        console.log("Username saved successfully!");
      }
    } catch (error) {
      console.error("Authentication error:", error.message);

      // Allgemeine Fehlermeldung für falsche Anmeldedaten
      setErrorMessage("Die eingegebenen Anmeldedaten sind falsch. Bitte überprüfen Sie Ihre E-Mail und Ihr Passwort.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {user ? null : (
        <AuthScreen
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          username={username}
          setUsername={setUsername}
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          handleAuthentication={handleAuthentication}
          errorMessage={errorMessage} 
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
  inputError: {
    borderColor: "red", 
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
  errorMessage: {
    color: "red",
    fontSize: 16,
    marginVertical: 10,
    textAlign: "center",
  },
});
