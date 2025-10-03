// modules/dom.js

/**
 * Creates the HTML structure for a new task item (li, span, buttons).
 * @param {string} taskText - The text content of the task.
 * @param {function} toggleComplete - Callback function for the done button.
 * @param {function} removeTask - Callback function for the delete button.
 * @param {string} taskScheduleTime - The specific scheduled time (e.g., "08:00 AM").
 * @param {string} taskPeriod - The period (e.g., "Morning", "Afternoon") for display.
 * @returns {HTMLLIElement} The complete task list item.
 */
export function createTaskElement(taskText, toggleComplete, removeTask, taskScheduleTime, taskPeriod) {
    const li = document.createElement("li");
    li.classList.add("task-item");

    // Container for text and time
    const textContainer = document.createElement("div");
    textContainer.classList.add("task-details");
    
    // Scheduled Time Span (Displaying "Morning: 08:00 AM")
    const scheduleTimeSpan = document.createElement("span");
    scheduleTimeSpan.textContent = `${taskPeriod}: ${taskScheduleTime}`; // Combine period and specific time
    scheduleTimeSpan.classList.add("task-schedule-time"); // Class for styling the time
    
    // Task Text Span (This is where the line-through goes)
    const taskSpan = document.createElement("span");
    taskSpan.textContent = taskText;
    taskSpan.classList.add("task-text", "completed-span"); // Add completed-span for CSS targeting
    
    textContainer.appendChild(scheduleTimeSpan);
    textContainer.appendChild(taskSpan);

    // Done Button
    const doneBtn = document.createElement("button");
    doneBtn.textContent = "✔";
    doneBtn.classList.add("done-btn", "task-btn");
    doneBtn.addEventListener("click", () => {
        toggleComplete(li); 
    });

    // Delete Button (Will be gray by default, red when parent LI has .completed class)
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✖";
    deleteBtn.classList.add("delete-btn", "task-btn");
    deleteBtn.addEventListener("click", () => {
        removeTask(li); 
    });

    // Append everything to the list item
    li.appendChild(textContainer); 
    li.appendChild(doneBtn);
    li.appendChild(deleteBtn);

    return li;
}

/**
 * Retrieves the specific UL element for a given time period.
 * @param {string} period - The time period ('morning', 'afternoon', 'evening').
 * @returns {HTMLUListElement} The corresponding UL element.
 */
export function getTaskList(period) {
    switch (period) {
        case "morning":
            return document.getElementById("morningList");
        case "afternoon":
            return document.getElementById("afternoonList");
        case "evening":
            return document.getElementById("eveningList");
        default:
            console.error(`Invalid period: ${period}`);
            return null;
    }
}
