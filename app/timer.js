import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Vibration, Alert } from "react-native";

export default function Timer() {
  const [time, setTime] = useState(0); // Zeit in Sekunden
  const [isRunning, setIsRunning] = useState(false); // Timer läuft oder nicht
  const [targetTime, setTargetTime] = useState(0); // Zielzeit in Sekunden
  const [isTimeUp, setIsTimeUp] = useState(false); // Flag für abgelaufene Zeit
  const [inputTime, setInputTime] = useState(""); // Eingabefeld für Zeit
  const [isVibrating, setIsVibrating] = useState(false); // Flag für Vibration
  const [timerStarted, setTimerStarted] = useState(false); // Flag, ob der Timer schon gestartet wurde



  useEffect(() => {
    let interval;
    if (isRunning && time < targetTime) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1); // Zeit hochzählen
      }, 1000);
    } else if (time >= targetTime) {
      // Wenn die Zeit erreicht ist, stoppe den Timer
      setIsTimeUp(true);
      setIsRunning(false);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval); // Aufräumen bei Komponenten-Unmount
  }, [isRunning, time, targetTime]);

  useEffect(() => {
    // Vibration wird nur gestartet, wenn der Timer gestartet wurde und die Zeit abgelaufen ist
    if (timerStarted && isTimeUp && !isVibrating) {
      setIsVibrating(true);
      startVibration(); // Klingeln starten
    }
  }, [timerStarted, isTimeUp, isVibrating]);




  /* Klick auf start/stop -> rechnet die eingegebene zeit um und startet */
  const handleStartStop = () => {
    if (!inputTime || !validateTime(inputTime)) {
      Alert.alert("Ungültige Eingabe", "Bitte geben Sie eine gültige Zeit im Format hh:mm:ss ein.");
      return;
    }

    const [hours, minutes, seconds] = inputTime.split(":").map(Number);
    const timeInSeconds = (hours * 3600) + (minutes * 60) + seconds;
    setTargetTime(timeInSeconds); // Setze die Zielzeit

    if (isRunning) {
      setIsRunning(false); // Timer stoppen
    } else {
      setTime(0); // Zeit zurücksetzen
      setIsTimeUp(false); // Reset für abgelaufene Zeit
      setIsRunning(true); // Timer starten
      setTimerStarted(true); // Timer wurde gestartet
      setIsVibrating(false); // Vibration zurücksetzen, falls der Timer neu gestartet wird
    }
  };

  const handleReset = () => {
    setTime(0); // Zeit zurücksetzen
    setIsRunning(false); // Timer stoppen
    setIsTimeUp(false); // Reset für abgelaufene Zeit
    setInputTime(""); // Eingabefeld zurücksetzen
    setIsVibrating(false); // Vibration stoppen
    Vibration.cancel(); // Vibration stoppen
    setTimerStarted(false); // Timer zurücksetzen
  };

  const startVibration = () => {
    // Vibrationsmuster: 1 Sekunde vibrieren, 1 Sekunde Pause
    const pattern = [1000, 1000]; // Vibrieren für 1 Sekunde, Pause für 1 Sekunde
    Vibration.vibrate(pattern, true); // Fortlaufende Vibration
  };

  const handleStopVibration = () => {
    setTimerStarted(false);
    setIsVibrating(false);
    Vibration.cancel();
  };

  // Hilfsfunktion zur Validierung der Zeit im Format hh:mm:ss
  const validateTime = (timeString) => {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    return regex.test(timeString);
  };

  // Hilfsfunktion, um die Zeit im Format hh:mm:ss darzustellen
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600); // Stunden
    const minutes = Math.floor((seconds % 3600) / 60); // Minuten
    const remainingSeconds = seconds % 60; // Sekunden

    // Formatieren in zwei Stellen für Stunden, Minuten und Sekunden
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  // Benutzerdefinierte onChangeText-Funktion, um nur Zahlen und Doppelpunkte zuzulassen
  const handleInputChange = (text) => {
    // Entferne alle Zeichen, die keine Zahlen oder Doppelpunkte sind
    const formattedText = text.replace(/[^0-9:]/g, '');
    setInputTime(formattedText);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stoppuhr</Text>
      <Text style={styles.timeText}>{formatTime(time)}</Text>

      {/* Eingabefeld für Zeit */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="00:00:00 eingeben"
          keyboardType="default"  // Verwende "default" anstelle von "numeric", um Zeichen wie ":" zuzulassen
          value={inputTime}
          onChangeText={handleInputChange} // Verwende die benutzerdefinierte Funktion
          editable={!isRunning} // Das Textfeld ist deaktiviert, wenn der Timer läuft
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleStartStop}
        >
          <Text style={styles.buttonText}>{isRunning ? "Stoppen" : "Starten"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleReset}
        >
          <Text style={styles.buttonText}>Zurücksetzen</Text>
        </TouchableOpacity>
      </View>

      

      {isVibrating && (
        <TouchableOpacity style={styles.stopVibrationButton} onPress={handleStopVibration}>
          <Text style={styles.buttonText}>Stoppen</Text>
        </TouchableOpacity>
      )}
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
    fontWeight: "bold",
    marginBottom: 20,
  },
  timeText: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    fontSize: 16,
    borderRadius: 5,
    width: "80%",
  },
  buttonContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  timeUpText: {
    color: "red",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
  },
  stopVibrationButton: {
    backgroundColor: "#e74c3c",
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
});
