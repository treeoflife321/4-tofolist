import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Header } from 'react-native-elements';

const TodoInput = () => {
  // Define and initialize state variables
  const [todoText, setTodoText] = useState(''); // Input field value
  const [todos, setTodos] = useState([]); // List of todos
  const [editingTodoIndex, setEditingTodoIndex] = useState(null); // Index of the todo being edited
  const [editedText, setEditedText] = useState(''); // Text for editing a todo
  const [selectedTodos, setSelectedTodos] = useState([]); // List of selected todos
  const [completedTasks, setCompletedTasks] = useState([]); // List of completed tasks
  const [selectedCompletedTasks, setSelectedCompletedTasks] = useState([]); // List of selected completed tasks

  useEffect(() => {
    // Load todos and completed tasks from AsyncStorage when the component mounts
    loadTodosFromStorage();
    loadCompletedTasksFromStorage();
  }, []);

  useEffect(() => {
    // This effect will run whenever completedTasks changes
    // Save completed tasks to AsyncStorage to keep them persistent
    saveCompletedTasksToStorage(completedTasks);
  }, [completedTasks]);

  const loadTodosFromStorage = async () => {
    try {
      // Load todos from AsyncStorage
      const savedTodos = await AsyncStorage.getItem('todos');
      if (savedTodos !== null) {
        // Update the state with the loaded todos
        setTodos(JSON.parse(savedTodos));
      }
    } catch (error) {
      console.error('Error loading todos from AsyncStorage: ', error);
    }
  };

  const loadCompletedTasksFromStorage = async () => {
    try {
      // Load completed tasks from AsyncStorage
      const savedCompletedTasks = await AsyncStorage.getItem('completedTasks');
      if (savedCompletedTasks !== null) {
        // Update the state with the loaded completed tasks
        setCompletedTasks(JSON.parse(savedCompletedTasks));
      }
    } catch (error) {
      console.error('Error loading completed tasks from AsyncStorage: ', error);
    }
  };

  const saveTodosToStorage = async (updatedTodos) => {
    try {
      // Save the updated list of todos to AsyncStorage
      await AsyncStorage.setItem('todos', JSON.stringify(updatedTodos));
    } catch (error) {
      console.error('Error saving todos to AsyncStorage: ', error);
    }
  };

  const saveCompletedTasksToStorage = async (updatedCompletedTasks) => {
    try {
      // Save the updated list of completed tasks to AsyncStorage
      await AsyncStorage.setItem('completedTasks', JSON.stringify(updatedCompletedTasks));
    } catch (error) {
      console.error('Error saving completed tasks to AsyncStorage: ', error);
    }
  };

  const handleInputChange = (text) => {
    // Update the todoText state with the text entered in the input field
    setTodoText(text);
  };

  const handleAddTodo = () => {
    if (todoText.trim() !== '') {
      // Create a new todo object and add it to the todos list
      const updatedTodos = [...todos, { text: todoText }];
      // Update the state with the new list of todos
      setTodos(updatedTodos);
      // Save the updated list of todos to AsyncStorage
      saveTodosToStorage(updatedTodos);
      // Clear the input field
      setTodoText('');
    } else {
      // Show an alert if the input is empty
      alert('Please enter something to do.');
    }
  };

  const handleLongPress = (index) => {
    // Set the editingTodoIndex and initialize the editedText with the current todo's text
    setEditingTodoIndex(index);
    setEditedText(todos[index].text);
  };

  const handleEditTodo = () => {
    // Update the text of the todo being edited and save it
    const updatedTodos = [...todos];
    updatedTodos[editingTodoIndex].text = editedText;
    setTodos(updatedTodos);
    saveTodosToStorage(updatedTodos);
    setEditingTodoIndex(null);
  };

  const handleToggleSelectTodo = (index) => {
    // Toggle the selection of a todo
    if (selectedTodos.includes(index)) {
      setSelectedTodos(selectedTodos.filter((item) => item !== index));
    } else {
      setSelectedTodos([...selectedTodos, index]);
    }
  };

  const handleToggleSelectCompletedTask = (index) => {
    // Toggle the selection of a completed task
    if (selectedCompletedTasks.includes(index)) {
      setSelectedCompletedTasks(selectedCompletedTasks.filter((item) => item !== index));
    } else {
      setSelectedCompletedTasks([...selectedCompletedTasks, index]);
    }
  };

  const handleMoveToCompletedTask = () => {
    // Move selected todos to the completed tasks
    const doneTasks = selectedTodos.map((index) => todos[index].text);
    const updatedCompletedTasks = [...completedTasks, ...doneTasks];
    setCompletedTasks(updatedCompletedTasks);

    // Remove selected todos from the todos list
    const updatedTodos = todos.filter((_, index) => !selectedTodos.includes(index));
    setTodos(updatedTodos);
    setSelectedTodos([]);
  };

  const handleDeleteSelected = async () => {
    // Delete selected todo list items
    const updatedTodos = todos.filter((_, index) => !selectedTodos.includes(index));
    setTodos(updatedTodos);
    setSelectedTodos([]);

    // Delete selected completed tasks
    const updatedCompleted = completedTasks.filter((_, index) => !selectedCompletedTasks.includes(index));
    setCompletedTasks(updatedCompleted);

    // Save the updated data to AsyncStorage to reflect the changes
    await saveTodosToStorage(updatedTodos);
    await saveCompletedTasksToStorage(updatedCompleted);
  };  

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{ text: 'Group 4: Todo-List', style: { color: 'white', fontSize: 18 } }}
      />
      <View style={styles.upperRightButtonContainer}>
        <Button title="Delete Selected" onPress={handleDeleteSelected} color="blue"/>
      </View>
      <View style={styles.centeredContent}>
        <View style={styles.addTodoContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter something to do..." 
            placeholderTextColor="white"
            value={todoText}
            onChangeText={handleInputChange}
          />
          <Button title="Add" onPress={handleAddTodo} color="blue"/>
        </View>
        <Text style={styles.listTitle}>Todo List:</Text>
        <FlatList
          data={todos}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.todoItemContainer}>
              <TouchableOpacity
                onLongPress={() => handleLongPress(index)}
                onPress={() => handleToggleSelectTodo(index)}
                style={styles.todoItem}
              >
                {selectedTodos.includes(index) ? (
                  <Text style={styles.selectedTodoText}>{item.text}</Text>
                ) : editingTodoIndex === index ? (
                  <>
                    <TextInput
                      style={styles.editableTodoItem}
                      value={editedText}
                      onChangeText={setEditedText}
                      underlineColorAndroid="transparent"
                      editable={true}
                      selectTextOnFocus={true}
                    />
                    <Button title="Save" onPress={handleEditTodo} />
                  </>
                ) : (
                  <Text style={styles.todoText}>{item.text}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        />
        <View style={styles.moveToCompletedButtonContainer}>
          <Button title="Move to Completed Task" onPress={handleMoveToCompletedTask} color="blue" />
        </View>
        <Text style={styles.listTitle}>Completed Tasks:</Text>
        <FlatList
          data={completedTasks}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.todoItemContainer}>
              <TouchableOpacity
                onPress={() => handleToggleSelectCompletedTask(index)}
                style={styles.todoItem}
              >
                {selectedCompletedTasks.includes(index) ? (
                  <Text style={styles.selectedTodoText}>{item}</Text>
                ) : (
                  <Text style={styles.todoText}>{item}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 20,
    backgroundColor: 'black',
  },

upperRightButtonContainer: {
    position: 'absolute',
    top: 70,
    right: 0,
  },

  centeredContent: {
    width: '80%',
    alignContent: 'center',
    top: 60,
  },

  addTodoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  input: {
    marginLeft: '5%',
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    width: '80%',
    color: 'white',
  },

  listTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },

  todoItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  todoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    margin: 5,
  },

  editableTodoItem: {
    flex: 1,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    color: 'white',
  },

  todoText: {
    flex: 1,
    fontSize: 16,
    color: 'white',
  },

  selectedTodoText: {
    flex: 1,
    fontSize: 16,
    textDecorationLine: 'underline',
    color: 'white',
  },

  moveToCompletedButtonContainer: {
    marginTop: 10,
  },

});

export default TodoInput;
