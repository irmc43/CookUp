# CookUp - Mobile Computing

Die mobile App "CookUp" bietet eine Plattform zum Suchen, Erstellen und Teilen von Rezepten, die den Kochalltag erleichtert und inspiriert. Neben einer Vielzahl von Standard-Rezepten ermöglicht die App das Teilen von eigenen Rezepten. Praktische Features wie ein Timer und Zutaten-Checklisten erleichtern das Kochen und die Planung. Ein persönlicher Account sorgt für die Verwaltung von Favoriten und eigenen Rezepten.

## 1. Kernfunktionalitäten der App

- **Rezepte entdecken:** Standard-Rezepte und Rezepte von anderen Nutzern entdecken oder nach Rezepten suchen.
- **Eigene Rezepte erstellen:** Hinzufügen von eigenen Rezepten.
- **Favoriten:** Lieblingsrezepte speichern.
- **Benutzerregistrierung und Anmeldung:** Ein persönlicher Account ermöglicht es den Nutzern, ihre Favoriten und ihre eigenen Rezepte zu verwalten.
- **Rezepte nachkochen:** Zutaten einfach abhaken und Rezepte mit integriertem Timer zubereiten
  
## 2. Übersicht über die Architektur der App 

- **Frontend:**  
  Das Frontend ist in React Native entwickelt und nutzt Expo, um die Entwicklung und das Testen auf verschiedenen Geräten nachzuverfolgen.

- **Backend:**  
  Es wird Firebase für die Authentifizierung (Firebase Authentication) und Datenspeicherung (Firestore, Realtime Database) verwendet.

## 3. Liste eingesetzter Technologien und Bibliotheken

- @expo-google-fonts/dynapuff
- @react-native-async-storage/async-storage
- @react-native-community/netinfo
- @react-native-firebase/app
- @react-native-firebase/auth
- @react-native-picker/picker
- @react-navigation/native
- @react-navigation/native-stack
- expo
- expo-camera
- expo-checkbox
- expo-image-picker
- expo-linear-gradient
- expo-media-library
- expo-router
- firebase
- react
- react-native
- react-native-dropdown-picker
- react-native-safe-area-context
- react-native-uuid
- react-native-vector-icons

---
**Quelle für die Standard-Rezepte:** https://dummyjson.com/docs/recipes#recipes-all


## 4. Anleitung zur Installation und Ausführung der App:
1. Laden Sie die Main-Branch des Repositories als ZIP-Datei herunter.
2. Entpacken Sie die ZIP-Datei und verschieben Sie es in Ihren persönlichen Benutzerordner.
3. Benennen Sie den Ordner in "CookUp" um.
4. Öffnen Sie das Terminal.
5. Wechseln Sie in das Verzeichnis des "CookUp"-Ordners:
    ```bash
   cd CookUp
   ```
6. Führen Sie den folgenden Befehl aus, um alle benötigten Abhängigkeiten (Node Modules) zu installieren:
   
    ```bash
   npm install
   ```
7. Starten Sie die App mit Expo, indem Sie den folgenden Befehl ausführen:

    ```bash
    npx expo start
   ```
