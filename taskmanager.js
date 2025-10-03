// modules/taskManager.js

import { createTaskElement, getTaskList } from './modules/dom.js';

const taskInput = document.getElementById("taskinput");
const periodSelect = document.getElementById("periodSelect");
const timeInput = document.getElementById("timeInput");
const addButton = document.getElementById("addTaskBtn");
const clearCompletedBtn = document.getElementById("clearCompletedTasks");

const dateDisplay = document.getElementById("dateDisplay");
const timeDisplay = document.getElementById("timeDisplay");
const alarmAudio = document.getElementById("alarmSound");

const LAST_VISIT_DATE_KEY = 'dailyRoutineLastVisitDate';
const TASKS_KEY = 'dailyRoutineTasks';

// ------------------- Local Storage -------------------

function getTasksFromStorage() {
    const tasksJson = localStorage.getItem(TASKS_KEY);
    return tasksJson ? JSON.parse(tasksJson) : [];
}

function saveTasksToStorage(tasks) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function updateTaskInStorage(id, newCompletedStatus) {
    let tasks = getTasksFromStorage();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return;

    if (newCompletedStatus === null) tasks.splice(index, 1);
    else tasks[index].completed = newCompletedStatus;

    saveTasksToStorage(tasks);
}

function clearCompletedTasks() {
    let tasks = getTasksFromStorage();
    tasks = tasks.filter(t => !t.completed);
    saveTasksToStorage(tasks);
    loadTasks();
}

// ------------------- Task Handlers -------------------

function toggleComplete(liElement) {
    const taskId = liElement.dataset.taskId;
    const span = liElement.querySelector('.task-text');

    liElement.classList.toggle("completed");
    if (span) span.classList.toggle("completed-span");

    updateTaskInStorage(taskId, liElement.classList.contains("completed"));
}

function removeTask(liElement) {
    const taskId = liElement.dataset.taskId;
    updateTaskInStorage(taskId, null);
    liElement.remove();
}

// ------------------- Clock & Alarm -------------------

let lastMinute = -1;

function updateClockAndAlarms() {
    const now = new Date();
    if (timeDisplay) timeDisplay.textContent = now.toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit',second:'2-digit'});

    const currentMinute = now.getHours() * 60 + now.getMinutes();
    if (currentMinute === lastMinute) return;
    lastMinute = currentMinute;

    const tasks = getTasksFromStorage();

    tasks.forEach(task => {
        if (!task.completed && task.scheduleTime) {
            const [timeString, period] = task.scheduleTime.split(' ');
            const [hourStr, minuteStr] = timeString.split(':');
            let hour = parseInt(hourStr), minute = parseInt(minuteStr);
            if (period==='PM' && hour!==12) hour+=12;
            if (period==='AM' && hour===12) hour=0;

            if (currentMinute === hour*60+minute && !task.alarmFired) {
                if (alarmAudio) {
                    alarmAudio.currentTime=0;
                    alarmAudio.play().catch(()=>{});
                }
                alert(`⏰ ALARM: Time for "${task.text}"!`);
                task.alarmFired = true;
                saveTasksToStorage(tasks);
            }
        }
    });
}

// ------------------- Render & Load -------------------

function renderTask(task) {
    const li = createTaskElement(task.text, toggleComplete, removeTask, task.scheduleTime, task.period);
    li.dataset.taskId = task.id;

    if (task.completed) {
        li.classList.add("completed");
        const span = li.querySelector('.task-text');
        if (span) span.classList.add("completed-span");
        const delBtn = li.querySelector('.delete-btn');
        if (delBtn) delBtn.classList.add("delete-red");
    }

    const targetList = getTaskList(task.period);
    if (targetList) targetList.appendChild(li);
}

function loadTasks() {
    getTaskList('morning').innerHTML='';
    getTaskList('afternoon').innerHTML='';
    getTaskList('evening').innerHTML='';

    getTasksFromStorage().forEach(renderTask);
}

function addTask() {
    const text = taskInput.value.trim();
    const period = periodSelect.value;
    const time24 = timeInput.value;

    if (!text || !time24) return alert("Please enter both a task and a scheduled time!");

    const [h,m] = time24.split(':');
    const date = new Date(2000,0,1,parseInt(h),parseInt(m));
    const time12 = date.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});

    const task = {id: Date.now().toString(), text, period, scheduleTime: time12, completed:false, alarmFired:false};

    const tasks = getTasksFromStorage();
    tasks.push(task);
    saveTasksToStorage(tasks);

    renderTask(task);
    taskInput.value = "";
}

// ------------------- New Day / Reset -------------------

function resetDailyRoutine() {
    const tasks = getTasksFromStorage().map(t=>({...t,completed:false,alarmFired:false}));
    saveTasksToStorage(tasks);
    loadTasks();
}

function checkForNewDay() {
    const today = new Date().toISOString().split('T')[0];
    const last = localStorage.getItem(LAST_VISIT_DATE_KEY);
    if (last && last!==today) resetDailyRoutine();
    localStorage.setItem(LAST_VISIT_DATE_KEY,today);
}

function displayCurrentDate() {
    if (!dateDisplay) return;
    dateDisplay.textContent = new Date().toLocaleDateString('en-US', {weekday:'long',year:'numeric',month:'long',day:'numeric'});
}

// ------------------- Setup -------------------

export function setupEventListeners() {
    checkForNewDay();
    loadTasks();
    displayCurrentDate();
    setInterval(updateClockAndAlarms,1000);

    addButton.addEventListener("click", addTask);
    clearCompletedBtn.addEventListener("click", clearCompletedTasks);
    taskInput.addEventListener("keypress", e => { if(e.key==='Enter'){ e.preventDefault(); addTask(); }});
}

