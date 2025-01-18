import React from "react";
import {  View, Text, TouchableOpacity, StyleSheet, TextInput, Vibration, Alert, ScrollView } from "react-native";
import { useNavigation,useRoute } from "@react-navigation/native"; 
import Icon from "react-native-vector-icons/MaterialIcons"; 
import Timer from "./timer";

export default function Example() {
  const navigation = useNavigation(); 

  const route = useRoute();
  const { recipe } = route.params || {};
  const recipeData = recipe ? JSON.parse(recipe) : null;

  return (
    
    <View style={{ flex: 1 }}>
      <ScrollView >
        <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-back" size={28} color="#3498db" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Kochmodus</Text>
            </View>
            
            <Timer />

            {recipeData && (
              <View style={styles.recipeDetails}>
                <Text style={styles.title}>{recipeData.name}</Text>
                <Text style={{ fontSize: 14, marginBottom: 20, }} >Zubereitungszeit: {recipeData.timeMinutes} Minuten</Text>

                <Text style={styles.sectionTitle}>Zutaten</Text>
                {recipeData.ingredients?.map((ingredient, index) => (
                  <Text key={index} style={styles.text}>
                    {ingredient.amount} {ingredient.name}
                  </Text>
                ))}

                <Text style={styles.sectionTitle}>Anweisungen</Text>
                {recipeData.instructions?.map((instruction, index) => (
                  <Text key={index} style={styles.text}>
                    {index + 1}. {instruction}
                  </Text>
                ))}
              </View>
            )}
        </View>
      </ScrollView>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 2,
    paddingLeft: 0,
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: "#3498db",
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3498db",
  },
  recipeDetails: {
    marginTop: 20,
    
  },
  title: {
    fontSize: 23,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom:5,

  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom:10
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
});

 