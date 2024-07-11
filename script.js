const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const container = document.querySelector('.container');

let todos = [];
let completionMessageShown = false; // Flag to track if completion message has been shown

// Check if there are saved todos in localStorage
const savedTodos = localStorage.getItem('todos');
if (savedTodos) {
  todos = JSON.parse(savedTodos);
  renderTodos();
}

todoForm.addEventListener('submit', function(event) {
  event.preventDefault();
  let todoText = todoInput.value.trim();
  if (todoText === '') return;

  // Convert the first character to uppercase and the rest to lowercase
  todoText = todoText.charAt(0).toUpperCase() + todoText.slice(1).toLowerCase();
  
  const newTodo = {
    id: Date.now(),
    text: todoText,
    completed: false
  };

  todos.push(newTodo);
  saveTodos();
  renderTodos();
  todoInput.value = '';
});

function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
  todoList.innerHTML = '';
  todos.forEach(todo => {
    const li = document.createElement('li');
    li.innerHTML = `
      <input type="checkbox" class="checkbox" id="todo-${todo.id}" ${todo.completed ? 'checked' : ''}>
      <label class="checkbox-container" for="todo-${todo.id}"></label>
      <span class="checkbox-label">${todo.text}</span>
      <button class="delete">Delete</button>
    `;
    if (todo.completed) {
      li.classList.add('completed');
    }

    todoList.appendChild(li);

    const checkbox = li.querySelector('.checkbox');
    const checkboxContainer = li.querySelector('.checkbox-container');
    const todoText = li.querySelector('.checkbox-label');
    const deleteButton = li.querySelector('button');

    checkbox.addEventListener('change', () => toggleCompleted(todo.id));
    deleteButton.addEventListener('click', () => deleteTodo(todo.id));
  });

  checkAllCompleted();
}

function toggleCompleted(todoId) {
  todos = todos.map(todo => {
    if (todo.id === todoId) {
      return {
        ...todo,
        completed: !todo.completed
      };
    }
    return todo;
  });

  // Move completed tasks to the bottom
  todos.sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    return 0;
  });

  saveTodos();
  renderTodos();
}

function deleteTodo(todoId) {
  const wasAllCompleted = todos.every(todo => todo.completed);

  todos = todos.filter(todo => todo.id !== todoId);

  // Check if all were completed and after deletion not anymore
  const isAllCompleted = todos.length > 0 && todos.every(todo => todo.completed);

  // Only hide completion message if it was shown and no longer all tasks are completed
  if (wasAllCompleted && !isAllCompleted && completionMessageShown) {
    hideCompletionMessage();
    completionMessageShown = false; // Reset the flag
  }

  saveTodos();
  renderTodos();
}

function checkAllCompleted() {
  const allCompleted = todos.length > 0 && todos.every(todo => todo.completed);
  if (allCompleted && !completionMessageShown) {
    container.classList.add('completed-animation');
    showCompletionMessage();
    completionMessageShown = true; // Set the flag to true
  } else {
    container.classList.remove('completed-animation');
    if (!allCompleted && completionMessageShown) {
      hideCompletionMessage();
      completionMessageShown = false; // Reset the flag
    }
  }
}

function showCompletionMessage() {
  const message = document.createElement('div');
  message.textContent = 'Good job! You have completed all of your tasks 🎉';
  message.classList.add('completion-message');
  message.style.backgroundColor = 'rgba(76, 175, 80, 0.9)'; 
  container.appendChild(message);

  // Gradual fade-out animation for both text color and background color
  let opacity = 4.5;
  let intervalId = setInterval(function() {
    opacity -= 0.05;
    message.style.color = `rgba(0, 0, 0, ${opacity})`;
    message.style.backgroundColor = `rgba(76, 175, 80, ${opacity * 0.9})`;

    if (opacity <= 0) {
      clearInterval(intervalId);
      container.removeChild(message);
    }
  }, 50);
}

function hideCompletionMessage() {
  const message = document.querySelector('.completion-message');
  if (message) {
    container.removeChild(message);
  }
}
