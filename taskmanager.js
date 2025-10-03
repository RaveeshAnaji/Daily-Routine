// modules/taskManager.js (FINAL & COMPLETE)

import { createTaskElement, getTaskList } from './dom.js';

// Global references to the main control elements
const taskInput = document.getElementById("taskinput");
const periodSelect = document.getElementById("periodSelect");
const timeInput = document.getElementById("timeInput");
const addButton = document.getElementById("addTaskBtn");
const clearCompletedBtn = document.getElementById("clearCompletedTasks");

// Global references for display
const dateDisplay = document.getElementById("dateDisplay");
const timeDisplay = document.getElementById("timeDisplay");

// CONSTANTS
const LAST_VISIT_DATE_KEY = 'dailyRoutineLastVisitDate';
const TASKS_KEY = 'dailyRoutineTasks'; 

// ---------------------------------------------------------------------
// --- Local Storage Management ---
// ---------------------------------------------------------------------

/** Retrieves tasks from Local Storage, or returns an empty array if none exist. */
function getTasksFromStorage() {
    const tasksJson = localStorage.getItem(TASKS_KEY);
    return tasksJson ? JSON.parse(tasksJson) : [];
}

/** Saves the current array of tasks to Local Storage. */
function saveTasksToStorage(tasks) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

/** Finds a task in the storage array and updates its status (completed/deleted).
 * @param {string} id - The unique ID of the task to update.
 * @param {boolean|null} newCompletedStatus - The new completion status (true/false) or null if deleting.
 */
function updateTaskInStorage(id, newCompletedStatus) {
    let tasks = getTasksFromStorage();
    const index = tasks.findIndex(task => task.id === id);

    if (index === -1) return;

    if (newCompletedStatus === null) {
        // DELETE: Remove the task from the array
        tasks.splice(index, 1);
    } else {
        // COMPLETE: Update the task's completion status
        tasks[index].completed = newCompletedStatus;
    }

    saveTasksToStorage(tasks);
}

function clearCompletedTasks() {
    let tasks = getTasksFromStorage();
    // Filter out completed tasks
    const activeTasks = tasks.filter(task => !task.completed); 
    saveTasksToStorage(activeTasks);
    loadTasks(); // Re-render the list
}


// ---------------------------------------------------------------------
// --- Task Handlers (UPDATED) ---
// ---------------------------------------------------------------------

/** Toggles the 'completed' state on a task item AND updates Local Storage. */
function toggleComplete(liElement) {
    const taskId = liElement.dataset.taskId; 
    const taskTextSpan = liElement.querySelector('.completed-span');
    
    // Toggle the UI classes on the LI and the task text span
    liElement.classList.toggle("completed"); 
    if (taskTextSpan) {
        taskTextSpan.classList.toggle("completed-span");
    }
    
    // IMPORTANT: The red delete button color is applied via CSS when liElement has class 'completed'
    
    // Get the new status and update storage
    const newCompletedStatus = liElement.classList.contains("completed");
    updateTaskInStorage(taskId, newCompletedStatus);
}

/** Removes a task list item from the DOM AND updates Local Storage. */
function removeTask(liElement) {
    const taskId = liElement.dataset.taskId;
    
    // Update storage first (passing null to signal deletion)
    updateTaskInStorage(taskId, null);
    
    // Remove from the DOM
    liElement.remove();
}


// ---------------------------------------------------------------------
// --- Clock and Alarm Logic ---
// ---------------------------------------------------------------------

let lastMinute = -1; // Global state to ensure alarms only fire once per minute

/** Updates the current time display and checks for active alarms every second. */
function updateClockAndAlarms() {
    const now = new Date();
    
    // Update Time Display (HH:MM:SS AM/PM)
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (timeDisplay) timeDisplay.textContent = formattedTime;

    const currentMinute = now.getHours() * 60 + now.getMinutes();

    // Only run alarm check on the transition to a new minute
    if (currentMinute === lastMinute) return;
    lastMinute = currentMinute; 
    
    const tasks = getTasksFromStorage();
    
    tasks.forEach(task => {
        // Only check incomplete tasks with a scheduled time
        if (!task.completed && task.scheduleTime) { 
            // e.g., "08:00 AM" -> ["08:00", "AM"]
            const [timeString, period] = task.scheduleTime.split(' '); 
            const [hourStr, minuteStr] = timeString.split(':');
            
            let alarmHour = parseInt(hourStr);
            let alarmMinute = parseInt(minuteStr);
            
            // Convert to 24-hour format
            if (period === 'PM' && alarmHour !== 12) alarmHour += 12;
            if (period === 'AM' && alarmHour === 12) alarmHour = 0; 

            const alarmTimeMinutes = alarmHour * 60 + alarmMinute;

            if (currentMinute === alarmTimeMinutes) {
                // Ensure alarm only fires once per day/reset cycle
                if (!task.alarmFired) { 
                    alert(`⏰ ALARM: Time for "${task.text}"!`);
                    
                    // Mark as fired in storage
                    task.alarmFired = true; 
                    saveTasksToStorage(tasks);
                }
            }
        }
    });
}


// ---------------------------------------------------------------------
// --- Rendering and Mutating ---
// ---------------------------------------------------------------------

/** Displays a single task on the UI and sets its attributes. */
function renderTask(task) {
    // Pass the specific schedule time and the period name
    const newTaskElement = createTaskElement(
        task.text, 
        toggleComplete, 
        removeTask, 
        task.scheduleTime, // e.g., '08:00 AM'
        task.period // e.g., 'morning'
    );

    // Add the unique ID for tracking
    newTaskElement.dataset.taskId = task.id;

    // Apply completion styling if needed
    if (task.completed) {
        newTaskElement.classList.add("completed");
        // Ensure the correct span gets the line-through class
        newTaskElement.querySelector('.completed-span').classList.add("completed-span");
    }

    // Find the correct list and append the task
    const targetList = getTaskList(task.period);
    if (targetList) {
        targetList.appendChild(newTaskElement);
    }
}

/** Loads and displays all tasks saved in Local Storage. */
function loadTasks() {
    // Clear lists before loading
    getTaskList('morning').innerHTML = '';
    getTaskList('afternoon').innerHTML = '';
    getTaskList('evening').innerHTML = '';
    
    const tasks = getTasksFromStorage();
    tasks.forEach(task => renderTask(task));
}

/** Adds a new task from user input. */
function addTask() {
    const taskText = taskInput.value.trim();
    const timePeriod = periodSelect.value; // morning/afternoon/evening
    const scheduleTime24 = timeInput.value; // e.g., "08:00" (24-hour format)
    
    if (taskText === "" || scheduleTime24 === "") {
        alert("Please enter both a task and a scheduled time!");
        return;
    }

    // Convert 24-hour input (08:00) to 12-hour display format (08:00 AM)
    const [h, m] = scheduleTime24.split(':');
    // Using a base date to correctly convert 24hr time to 12hr AM/PM string
    const date = new Date(2000, 0, 1, parseInt(h), parseInt(m));
    const scheduleTime12 = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // 1. Create the task data object
    const newTaskData = {
        id: Date.now().toString(), 
        text: taskText,
        period: timePeriod,
        scheduleTime: scheduleTime12, // The specific time for display and alarm check
        completed: false,
        alarmFired: false
    };

    // 2. Save to storage
    let tasks = getTasksFromStorage();
    tasks.push(newTaskData);
    saveTasksToStorage(tasks);

    // 3. Render the task to the UI
    renderTask(newTaskData);

    // 4. Clear the input
    taskInput.value = "";
    // timeInput.value = ""; // Removed to keep the user's last input
}

// ---------------------------------------------------------------------
// --- New Day/Reset Logic ---
// ---------------------------------------------------------------------

/** Resets the 'completed' status of all tasks, preparing for a new day, AND updates storage. */
function resetDailyRoutine() {
    console.log("New day detected! Resetting daily routine completion status.");
    
    // 1. Reset completion status and alarm flag in storage
    let tasks = getTasksFromStorage();
    tasks = tasks.map(task => ({ ...task, completed: false, alarmFired: false }));
    saveTasksToStorage(tasks);

    // 2. Clear all lists to force a re-render
    getTaskList('morning').innerHTML = '';
    getTaskList('afternoon').innerHTML = '';
    getTaskList('evening').innerHTML = '';

    // 3. Load the reset tasks
    loadTasks();
}

/** Checks if the current date is a new day compared to the last saved date. */
function checkForNewDay() {
    const today = new Date();
    // Get YYYY-MM-DD string
    const todayString = today.toISOString().split('T')[0]; 
    const lastVisitDate = localStorage.getItem(LAST_VISIT_DATE_KEY);

    if (lastVisitDate && lastVisitDate !== todayString) {
        resetDailyRoutine();
    }
    
    localStorage.setItem(LAST_VISIT_DATE_KEY, todayString);
}

/** Displays the current date, day, and year. */
function displayCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('en-US', options); 
    if (dateDisplay) dateDisplay.textContent = formattedDate;
}


// ---------------------------------------------------------------------
// --- Setup Function ---
// ---------------------------------------------------------------------

export function setupEventListeners() {
    
    // 1. Check for New Day & Reset Routine (must happen before tasks are loaded)
    checkForNewDay(); 
    
    // 2. Load Tasks
    loadTasks();

    // 3. Set up Clock and Alarm Checker (Runs every second)
    displayCurrentDate(); // Initial date display
    setInterval(updateClockAndAlarms, 1000); // Start clock/alarm interval

    // 4. Set up event listeners
    addButton.addEventListener("click", addTask);
    clearCompletedBtn.addEventListener("click", clearCompletedTasks);
    
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            addTask();
        }
    });
}
