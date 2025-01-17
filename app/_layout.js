import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Slot, useSegments } from "expo-router";
import NetInfo from "@react-native-community/netinfo";
import { AntDesign as Icon, Foundation as Icon2, MaterialIcons as Icon3 } from "react-native-vector-icons";

export default function Layout() {
  const [isOffline, setIsOffline] = useState(false); // Offline-Status
  const router = useRouter();
  const segments = useSegments(); // Aktuelle Route

  // Überprüfen, ob die aktuelle Seite `login` ist
  const isLoginPage = segments[0] === "login";

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const dismissAlert = () => setIsOffline(false);

  useEffect(() => {
    if (Platform.OS === "android") {
      StatusBar.setBarStyle(isLoginPage ? "light-content" : "dark-content");
      StatusBar.setBackgroundColor(isLoginPage ? "#4ca7e4" : "#fefefe");
    }

    if (Platform.OS === "ios") {
      StatusBar.setBarStyle(isLoginPage ? "light-content" : "dark-content");
      StatusBar.setBackgroundColor("#4ca7e4"); //Stausbar Farbe für Login (iOS)
    }
  }, [isLoginPage]);

  const getIconColor = (route) => (segments[0] === route ? "#3498db" : "#999");

  return (
    <SafeAreaView
  style={isLoginPage ? styles.loginSafeArea : styles.safeArea}
  edges={isLoginPage ? ["left", "right", "bottom"] : ["top", "left", "right", "bottom"]} // top für Login nicht einbezogen
>

      <View style={styles.container}>
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>
              Keine Internetverbindung. Bitte überprüfen Sie Ihre Verbindung.
            </Text>
            <TouchableOpacity onPress={dismissAlert} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Schließen</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.content}>
          <Slot />
        </View>

        {!isLoginPage && (
          <View style={styles.navBar}>
            <TouchableOpacity
              onPress={() => router.push("/home")}
              style={styles.navButton}
            >
              <Icon2 name="home" size={32} color={getIconColor("home")} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/search")}
              style={styles.navButton}
            >
              <Icon name="search1" size={28} color={getIconColor("search")} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/add-recipe")}
              style={styles.navButton}
            >
              <Icon name="plus" size={30} color={getIconColor("add-recipe")} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/favorites")}
              style={styles.navButton}
            >
              <Icon3 name="favorite-border" size={30} color={getIconColor("favorites")} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/profile")}
              style={styles.navButton}
            >
              <Icon3 name="person" size={32} color={getIconColor("profile")} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fefefe", // Standard Hintergrundfarbe
  },
  loginSafeArea: {
    flex: 1,
    backgroundColor: "#c1dff6", // Farbe unter NavBar für Login (iOS)
  },
  container: {
    flex: 1,
    backgroundColor: "#fefefe", 
  },
  content: {
    flex: 1,
  },
  navBar: {
    height: 70,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fefefe",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  navButton: {
    alignItems: "center",
  },
  offlineBanner: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: "#E74C3C",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1000,
  },
  offlineText: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
    flexWrap: "wrap",
  },
  closeButton: {
    marginLeft: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#E74C3C",
    fontWeight: "bold",
    fontSize: 14,
  },
});






