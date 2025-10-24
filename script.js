const grid = document.getElementById("sudoku-grid");

// Create 9x9 Sudoku grid
for (let i = 0; i < 81; i++) {
  const input = document.createElement("input");
  input.type = "number";
  input.min = 1;
  input.max = 9;
  grid.appendChild(input);
}

// Pre-filled clues for the Sudoku puzzle
const predefinedClues = [
  [0, 0, 0, 0, 0, 0, 6, 8, 0],
  [0, 0, 0, 0, 8, 3, 0, 0, 0],
  [7, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 2, 0, 0, 0, 0, 0, 0, 6],
  [0, 6, 0, 0, 2, 0, 0, 4, 0],
  [5, 0, 0, 0, 0, 0, 0, 3, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 5],
  [0, 0, 0, 4, 1, 0, 0, 0, 0],
  [0, 3, 2, 0, 0, 0, 0, 0, 0]
];

// Fill the grid with predefined clues
function loadPredefinedClues() {
  const inputs = grid.querySelectorAll("input");
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const index = row * 9 + col;
      const value = predefinedClues[row][col];
      if (value !== 0) {
        inputs[index].value = value;
        inputs[index].classList.add('predefined');
        inputs[index].readOnly = true;
      }
    }
  }
}

// Load clues when page loads
loadPredefinedClues();

// Convert grid to 2D array
function getGridValues() {
  const inputs = grid.querySelectorAll("input");
  const values = [];
  for (let r = 0; r < 9; r++) {
    const row = [];
    for (let c = 0; c < 9; c++) {
      const val = inputs[r * 9 + c].value;
      row.push(val === "" ? 0 : parseInt(val));
    }
    values.push(row);
  }
  return values;
}

// Validation function to check if current numbers are correct
function validateCurrentNumbers() {
  const board = getGridValues();
  const inputs = grid.querySelectorAll("input");
  let isValid = true;
  let errorCount = 0;
  
  // Reset all input styles
  inputs.forEach(input => {
    input.classList.remove('valid', 'invalid');
  });
  
  // Check each filled cell
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const currentValue = board[row][col];
      const inputIndex = row * 9 + col;
      
      if (currentValue !== 0) {
        // Temporarily remove the current value to check if it's valid in its position
        board[row][col] = 0;
        
        if (!isValidPlacement(board, row, col, currentValue)) {
          inputs[inputIndex].classList.add('invalid');
          isValid = false;
          errorCount++;
        } else {
          inputs[inputIndex].classList.add('valid');
        }
        
        // Restore the value
        board[row][col] = currentValue;
      }
    }
  }
  
  return { isValid, errorCount };
}

// Renamed the original isValid function to avoid confusion
function isValidPlacement(board, row, col, num) {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }
  
  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }
  
  // Check 3x3 box
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === num) return false;
    }
  }
  return true;
}

// Backtracking algorithm
function solveSudoku(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValidPlacement(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Custom notification system
function showNotification(message, type = 'info', duration = 4000) {
  const notification = document.getElementById('notification');
  const icon = document.getElementById('notification-icon');
  const messageElement = document.getElementById('notification-message');
  
  // Set icon based on type
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  };
  
  icon.textContent = icons[type] || icons.info;
  messageElement.textContent = message;
  
  // Remove existing classes and add new type
  notification.className = `notification ${type}`;
  
  // Show notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Auto hide after duration
  const hideTimeout = setTimeout(() => {
    hideNotification();
  }, duration);
  
  // Store timeout so we can clear it if user closes manually
  notification.hideTimeout = hideTimeout;
}

function hideNotification() {
  const notification = document.getElementById('notification');
  notification.classList.remove('show');
  notification.classList.add('hidden');
  
  // Clear any existing timeout
  if (notification.hideTimeout) {
    clearTimeout(notification.hideTimeout);
  }
}

// Close button functionality
document.getElementById('notification-close').addEventListener('click', hideNotification);

document.getElementById("solve-btn").addEventListener("click", () => {
  const board = getGridValues();
  if (solveSudoku(board)) {
    const inputs = grid.querySelectorAll("input");
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        inputs[r * 9 + c].value = board[r][c];
      }
    }
    showNotification("🎉 Sudoku Solved Successfully! All cells have been filled with the correct solution.", "success", 5000);
  } else {
    showNotification("No solution exists for this Sudoku puzzle. Please check your entries and try again.", "error", 5000);
  }
});

document.getElementById("clear-btn").addEventListener("click", () => {
  grid.querySelectorAll("input").forEach(input => {
    if (!input.classList.contains('predefined')) {
      input.value = "";
      input.classList.remove('valid', 'invalid');
    }
  });
});

// Add event listener for validate button
document.getElementById("validate-btn").addEventListener("click", () => {
  const result = validateCurrentNumbers();
  
  if (result.isValid) {
    showNotification("All numbers are correct! Great job solving the puzzle!", "success", 4000);
  } else {
    showNotification(`Found ${result.errorCount} error(s). Check the highlighted cells in red and fix the conflicts.`, "error", 6000);
  }
});