'use strict';

var taskId = 0;

function generateTask(task) {
    let taskTemplate = document.getElementById('task-template');
    let taskElement = taskTemplate.content.firstElementChild.cloneNode(true);

    taskElement.querySelector('span.task-name').textContent = task.name;
    taskElement.id = task.id;

    let list;
    if (task.status == 'to-do') {
        list = document.getElementById('to-do-list');

    } else if (task.status == 'done') {
        list = document.getElementById('done-list');
    }
    list.append(taskElement);

}

async function createTask() {

    let form = document.getElementById('form');
    let task = {
        id: taskId + 1,
        name: form.elements['taskName'].value,
        description: form.elements['taskDescription'].value,
        status: form.elements['taskStatus'].value
    };

    // localStorage.setItem(task.id, JSON.stringify(task));
    let key = 'api/tasks?api_key=50d2199a-42dc-447d-81ed-d68a443b697e';
    let tasksApi = `http://tasks-api.std-900.ist.mospolytech.ru/${key}`;
    let url = new URL(tasksApi);
    let response = await fetch(url, {
        method: 'POST',
        body: new FormData(form),
    });

    form.reset();
    generateTask(task);

    taskId++;
}

async function LoadStorage() {
    let apiKey = 'api/tasks?api_key=50d2199a-42dc-447d-81ed-d68a443b697e';
    let tasksApi = `http://tasks-api.std-900.ist.mospolytech.ru/${apiKey}`;
    let url = new URL(tasksApi);

    let response = await fetch(url);
    let result = await response.json();

    for (var key in result) {
        generateTask(result.tasks[key]);
    }

}

LoadStorage();

document.getElementById('createTask').onclick = createTask;