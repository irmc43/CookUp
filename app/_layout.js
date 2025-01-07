import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, Slot, useSegments } from 'expo-router';
import Icon from 'react-native-vector-icons/AntDesign';
import Icon2 from 'react-native-vector-icons/Foundation';
import Icon3 from 'react-native-vector-icons/MaterialIcons';

export default function Layout() {
  const router = useRouter();
  const segments = useSegments(); // Ermittelt die aktuelle Route

  // Überprüfen, ob die aktuelle Seite `login` ist
  const isLoginPage = segments[0] === "login";

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Slot /> {/*Hier wird Inhalt der jeweiligen Seite eingefügt*/}
      </View>

      {/* Navigationsleiste anzeigen, außer auf der Login-Seite */}
      {!isLoginPage && (
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.push('/home')} style={styles.navButton}>
            <Icon2 name="home" size={32} color="#fefefe" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/home')} style={styles.navButton}>
            <Icon name="search1" size={28} color="#fefefe" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/add-recipe')} style={styles.navButton}>
            <Icon name="plus" size={30} color="#fefefe" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/add-recipe')} style={styles.navButton}>
            <Icon name="heart" size={28} color="#fefefe" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/profile')} style={styles.navButton}>
            <Icon3 name="person" size={32} color="#fefefe" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#fefefe',
    padding: 16,
  },
  navBar: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#3498db',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    boxShadowColor: '#000',
    boxShadowOffset: { width: 0, height: -2 },
    boxShadowOpacity: 0.1,
    boxShadowRadius: 5,
    elevation: 3,
  },
  navButton: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fefefe',
    marginTop: 4,
  },
});





