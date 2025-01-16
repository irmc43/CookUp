import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function Impressum() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Impressum</Text>
      
      <Text style={styles.sectionTitle}>Entwickler:</Text>
      <Text style={styles.text}>Rozan Alraie{'\n'}Irem Cam</Text>
      
      <Text style={styles.sectionTitle}>Adresse:</Text>
      <Text style={styles.text}>Lützowstraße 5{'\n'}46236 Bottrop</Text>
      
      <Text style={styles.sectionTitle}>Kontakt:</Text>
      <Text style={styles.text}>E-Mail: iremcam43@gmail.com</Text>
      
      <Text style={styles.sectionTitle}>Datenschutz:</Text>
      <Text style={styles.text}>
        Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Nachfolgend informieren wir Sie über die Erhebung, Verarbeitung und Nutzung Ihrer Daten in dieser App.
      </Text>
      
      <Text style={styles.subSectionTitle}>1. Verantwortliche Stelle</Text>
      <Text style={styles.text}>
        Verantwortlich für die Verarbeitung Ihrer Daten ist: Rozan Alraie & Irem Cam{'\n'}Lützowstraße 5, 46236 Bottrop{'\n'}E-Mail: iremcam43@gmail.com.
      </Text>
      
      <Text style={styles.subSectionTitle}>2. Erhobene Daten</Text>
      <Text style={styles.text}>
        - E-Mail-Adresse und Passwort für die Anmeldung.{'\n'}
        - Hochgeladene Bilder und Texte, die von Ihnen beim Hinzufügen von Rezepten bereitgestellt werden.
      </Text>
      
      <Text style={styles.subSectionTitle}>3. Zweck der Datenerhebung</Text>
      <Text style={styles.text}>
        - Bereitstellung der App-Funktionen, wie z. B. das Hinzufügen, Speichern und Anzeigen von Rezepten.{'\n'}
        - Verwaltung von Benutzerkonten und Anmeldung.{'\n'}
        - Speicherung und Anzeige von hochgeladenen Bildern und Rezeptinformationen.
      </Text>
      
      <Text style={styles.subSectionTitle}>4. Speicherung von Bildern</Text>
      <Text style={styles.text}>
        Die von Ihnen hochgeladenen Bilder werden ausschließlich für die Rezepte verwendet, die Sie in der App speichern. Bitte stellen Sie sicher, dass Sie nur Bilder hochladen, für die Sie die entsprechenden Rechte besitzen.
      </Text>
      
      <Text style={styles.subSectionTitle}>5. Weitergabe von Daten</Text>
      <Text style={styles.text}>
        Ihre Daten werden nicht an Dritte weitergegeben, außer wenn dies für die Bereitstellung der App-Funktionen notwendig ist (z. B. Speicherung in einer Cloud-Datenbank) oder gesetzlich vorgeschrieben ist.
      </Text>
      
      <Text style={styles.subSectionTitle}>6. Ihre Rechte</Text>
      <Text style={styles.text}>
        Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Widerspruch und Datenübertragbarkeit. Wenden Sie sich dafür bitte an: iremcam43@gmail.com.
      </Text>
      
      <Text style={styles.subSectionTitle}>7. Änderungen der Datenschutzerklärung</Text>
      <Text style={styles.text}>
        Diese Datenschutzerklärung kann von Zeit zu Zeit angepasst werden. Die aktuelle Version finden Sie in der App unter "Impressum".
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
});

