// modules/dom.js

export function createTaskElement(taskText, toggleComplete, removeTask, taskScheduleTime, taskPeriod) {
    const li = document.createElement("li");
    li.classList.add("task-item");

    // Container for text and time
    const textContainer = document.createElement("div");
    textContainer.classList.add("task-details");

    const scheduleTimeSpan = document.createElement("span");
    scheduleTimeSpan.textContent = `${taskPeriod}: ${taskScheduleTime}`;
    scheduleTimeSpan.classList.add("task-schedule-time");

    const taskSpan = document.createElement("span");
    taskSpan.textContent = taskText;
    taskSpan.classList.add("task-text", "completed-span");

    textContainer.appendChild(scheduleTimeSpan);
    textContainer.appendChild(taskSpan);

    // Done Button
    const doneBtn = document.createElement("button");
    doneBtn.textContent = "✔";
    doneBtn.classList.add("done-btn", "task-btn");

    // Delete Button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✖";
    deleteBtn.classList.add("delete-btn", "task-btn");

    // Done button click toggles completion
    doneBtn.addEventListener("click", () => {
        toggleComplete(li);

        if (li.classList.contains("completed")) {
            deleteBtn.classList.add("delete-red");
        } else {
            deleteBtn.classList.remove("delete-red");
        }
    });

    // Delete button click
    deleteBtn.addEventListener("click", () => removeTask(li));

    // Append elements
    li.appendChild(textContainer);
    li.appendChild(doneBtn);
    li.appendChild(deleteBtn);

    return li;
}

export function getTaskList(period) {
    switch (period) {
        case "morning": return document.getElementById("morningList");
        case "afternoon": return document.getElementById("afternoonList");
        case "evening": return document.getElementById("eveningList");
        default:
            console.error(`Invalid period: ${period}`);
            return null;
    }
}
