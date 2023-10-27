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
import { color } from 'react-native-elements/dist/helpers';

const TodoInput = () => {
  const [todoText, setTodoText] = useState('');
  const [todos, setTodos] = useState([]);
  const [editingTodoIndex, setEditingTodoIndex] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [selectedTodos, setSelectedTodos] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [selectedCompletedTasks, setSelectedCompletedTasks] = useState([]);

  useEffect(() => {
    loadTodosFromStorage();
    loadCompletedTasksFromStorage();
  }, []);

  useEffect(() => {
    // This effect will run whenever completedTasks changes
    saveCompletedTasksToStorage(completedTasks);
  }, [completedTasks]);

  const loadTodosFromStorage = async () => {
    try {
      const savedTodos = await AsyncStorage.getItem('todos');
      if (savedTodos !== null) {
        setTodos(JSON.parse(savedTodos));
      }
    } catch (error) {
      console.error('Error loading todos from AsyncStorage: ', error);
    }
  };

  const loadCompletedTasksFromStorage = async () => {
    try {
      const savedCompletedTasks = await AsyncStorage.getItem('completedTasks');
      if (savedCompletedTasks !== null) {
        setCompletedTasks(JSON.parse(savedCompletedTasks));
      }
    } catch (error) {
      console.error('Error loading completed tasks from AsyncStorage: ', error);
    }
  };

  const saveTodosToStorage = async (updatedTodos) => {
    try {
      await AsyncStorage.setItem('todos', JSON.stringify(updatedTodos));
    } catch (error) {
      console.error('Error saving todos to AsyncStorage: ', error);
    }
  };

  const saveCompletedTasksToStorage = async (updatedCompletedTasks) => {
    try {
      await AsyncStorage.setItem('completedTasks', JSON.stringify(updatedCompletedTasks));
    } catch (error) {
      console.error('Error saving completed tasks to AsyncStorage: ', error);
    }
  };

  const handleInputChange = (text) => {
    setTodoText(text);
  };

  const handleAddTodo = () => {
    if (todoText.trim() !== '') {
      const updatedTodos = [...todos, { text: todoText }];
      setTodos(updatedTodos);
      saveTodosToStorage(updatedTodos);
      setTodoText('');
    } else {
      // Show an alert if the input is empty
      alert('Please enter something to do.');
    }
  };

  const handleLongPress = (index) => {
    setEditingTodoIndex(index);
    setEditedText(todos[index].text);
  };

  const handleEditTodo = () => {
    const updatedTodos = [...todos];
    updatedTodos[editingTodoIndex].text = editedText;
    setTodos(updatedTodos);
    saveTodosToStorage(updatedTodos);
    setEditingTodoIndex(null);
  };

  const handleToggleSelectTodo = (index) => {
    if (selectedTodos.includes(index)) {
      setSelectedTodos(selectedTodos.filter((item) => item !== index));
    } else {
      setSelectedTodos([...selectedTodos, index]);
    }
  };

  const handleToggleSelectCompletedTask = (index) => {
    if (selectedCompletedTasks.includes(index)) {
      setSelectedCompletedTasks(selectedCompletedTasks.filter((item) => item !== index));
    } else {
      setSelectedCompletedTasks([...selectedCompletedTasks, index]);
    }
  };

  const handleMoveToCompletedTask = () => {
    const doneTasks = selectedTodos.map((index) => todos[index].text);
    const updatedCompletedTasks = [...completedTasks, ...doneTasks];
    setCompletedTasks(updatedCompletedTasks);

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
