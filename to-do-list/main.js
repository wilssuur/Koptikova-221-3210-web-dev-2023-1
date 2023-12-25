'use strict';

var taskId = 0;

function generateTask(task) {
    let taskTemplate = document.getElementById('task-template');
    let taskElement = taskTemplate.content.firstElementChild.cloneNode(true);

    taskElement.querySelector('span.task-name').textContent = task.name;
    taskElement.id = task.id;

    let list;
    if (task.status == '1') {
        list = document.getElementById('to-do-list');

    } else if (task.status == '2') {
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
        body: JSON.stringify(task),
        mode: "no-cors",
    });

    form.reset();
    generateTask(task);

    taskId++;
}

async function LoadStorage() {
    let key = 'api/tasks?api_key=50d2199a-42dc-447d-81ed-d68a443b697e';
    let tasksApi = `http://tasks-api.std-900.ist.mospolytech.ru/${key}`;
    let url = new URL(tasksApi);

    let response = await fetch(url);

    console.log(response);
    // let res = await response.json();
    // console.log(res);

    let result = await response.json();
    for (key in result) {
        generateTask(result[key]);
    }

    // if (response.ok) {
    //     result = await response.json();
    // } else {
    //     result = "Ошибка HTTP: " + response.status;
    // }

}

LoadStorage();

document.getElementById('createTask').onclick = createTask;