import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from '@firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { firestore, app } from './firebase.config';
import { useFonts, DynaPuff_400Regular } from '@expo-google-fonts/dynapuff';
import { LinearGradient } from 'expo-linear-gradient'; 

const AuthScreen = ({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  username,
  setUsername,
  isLogin,
  setIsLogin,
  handleAuthentication,
  errorMessage,
}) => {
  return (
    <View style={styles.authContainer}>
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

      {!isLogin && (
        <TextInput
          style={[styles.input, errorMessage ? styles.inputError : null]}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Passwort bestätigen"
          secureTextEntry
          placeholderTextColor="#929292"
        />
      )}

      {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleAuthentication} style={styles.authButton}>
          <Text style={styles.authButtonText}>{isLogin ? "Anmelden" : "Registrieren"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomContainer}>
      <Text style={styles.accountText}>
          {isLogin ? "Benötigen Sie ein Konto?" : "Sie haben bereits ein Konto?"}
        </Text>
        <Text style={styles.toggleText} onPress={() => setIsLogin(!isLogin)}>
          {isLogin ? "Registrieren" : "Anmelden"}
        </Text>
      </View>
    </View>
  );
};

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState(""); 
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const auth = getAuth(app);

  let [fontsLoaded] = useFonts({
    DynaPuff_400Regular,
  });

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

    if (!isLogin && password !== confirmPassword) {
      setErrorMessage("Die Passwörter stimmen nicht überein.");
      return;
    }

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
      setErrorMessage("Anmeldung fehlgeschlagen. Überprüfen Sie Ihre Eingaben!");
    }
  };

  return (
    <LinearGradient
      colors={['#4ca7e4', '#c1dff6']}
      style={styles.container}
    >
      {user ? null : (
        <View style={styles.authContent}>
          <Text style={styles.welcomeText}>Willkommen bei</Text>
          <Text style={styles.appName}>CookUp</Text>

          <AuthScreen
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            username={username}
            setUsername={setUsername}
            isLogin={isLogin}
            setIsLogin={setIsLogin}
            handleAuthentication={handleAuthentication}
            errorMessage={errorMessage} 
          />
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  authContent: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: "100%",
  },
  authContainer: {
    width: "80%",
    maxWidth: 400,
    padding: 16,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  welcomeText: {
    fontSize: 24,
    textAlign: "center",
    marginTop: 78,
    marginBottom: 10,
    color: "#fff",
  },
  appName: {
    fontSize: 48,
    fontFamily: 'DynaPuff_400Regular',
    fontWeight: 'bold',
    textAlign: "center",
    marginBottom: 70,
    color: "#fff",
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#f24040", 
  },
  buttonContainer: {
    marginBottom: 16,
  },
  authButton: {
    backgroundColor: '#4ca7e4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  authButtonText: {
    color: '#fff',
    fontSize: 18, 
    fontWeight: 'bold',
  },
  accountText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "semibold",
    fontSize: 16,
    marginBottom: 8,
  },
  toggleText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "semibold",
    fontSize: 20,
    textDecorationLine: 'underline',
  },
  bottomContainer: {
    marginTop: 20,
  },
  errorMessage: {
    backgroundColor: "#fff",
    color: "#f24040",
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    textAlign: "center",
    alignSelf: "center",
    width: "100%",
  },
});
