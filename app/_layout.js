import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Slot, useSegments } from "expo-router";
import NetInfo from "@react-native-community/netinfo";
import Icon from "react-native-vector-icons/AntDesign";
import Icon2 from "react-native-vector-icons/Foundation";
import Icon3 from "react-native-vector-icons/MaterialIcons";

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

  const dismissAlert = () => setIsOffline(false); // Meldung schließen

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
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
              <Icon2 name="home" size={32} color="#fefefe" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/search")}
              style={styles.navButton}
            >
              <Icon name="search1" size={28} color="#fefefe" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/add-recipe")}
              style={styles.navButton}
            >
              <Icon name="plus" size={30} color="#fefefe" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/favorites")}
              style={styles.navButton}
            >
              <Icon3 name="favorite" size={30} color="#fefefe" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/profile")}
              style={styles.navButton}
            >
              <Icon3 name="person" size={32} color="#fefefe" />
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
    backgroundColor: "#fefefe",
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  navBar: {
    height: 70,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#3498db",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    boxShadowColor: "#000",
    boxShadowOffset: { width: 0, height: -2 },
    boxShadowOpacity: 0.1,
    boxShadowRadius: 5,
    elevation: 3,
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





