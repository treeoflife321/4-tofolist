import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, View, Button, Text } from 'react-native';
import TodoInput from './todo';

export default function App() {
  const [showTodo, setShowTodo] = useState(false);

  const handleContinueClick = () => {
    setShowTodo(true);
  };

  return (
    <View style={styles.container}>
      {showTodo ? (
        <TodoInput />
      ) : (
        <View>
          <Text style={styles.text}>Group 4:</Text>
          <Text style={styles.text}>Todo-List</Text>
          <Button title="Continue" onPress={handleContinueClick} />
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    color: 'white',
    fontSize: 50,
    marginBottom: 10,
    fontWeight: 'bold',
  },
});
