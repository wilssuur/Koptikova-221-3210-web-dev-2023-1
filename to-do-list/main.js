'use strict';

async function amountTasks() {
    let countDone = 0;
    let countToDo = 0;

    let host = 'http://tasks-api.std-900.ist.mospolytech.ru/api/tasks';
    let apyKey = 'api_key=50d2199a-42dc-447d-81ed-d68a443b697e';
    let tasksApi = `${host}?${apyKey}`;
    let url = new URL(tasksApi);
    let response = await fetch(url);
    let result = await response.json();

    for (let key in result.tasks) {
        let status = result.tasks[key].status;
        if (status == 'done') {
            countDone += 1;
        } else {
            countToDo += 1;
        }
    }

    let counterDone = document.querySelector('.tasks-counter-done');
    counterDone.textContent = countDone;
    let counterToDo = document.querySelector('.tasks-counter-to-do');
    counterToDo.textContent = countToDo;

}

function showAlert(msg) {
    let alerts = document.querySelector('.alerts');
    let template = document.getElementById('alert-template');
    let newAlert = template.content.firstElementChild.cloneNode(true);
    let text;
    switch (msg) {
    case 'create': text = "Задача успешно создана"; break;
    case 'edit': text = "Задача успешно изменена"; break;
    case 'delete': text = "Задача успешно удалена"; break;
    }
    newAlert.querySelector('.msg').innerHTML = text;
    alerts.append(newAlert);
}

async function moveBtnHandler(event) {
    let taskElement = event.target.closest('.task');
    let id = taskElement.id;

    let host = 'http://tasks-api.std-900.ist.mospolytech.ru/api/tasks';
    let apyKey = 'api_key=50d2199a-42dc-447d-81ed-d68a443b697e';
    let tasksApi = `${host}/${id}?${apyKey}`;
    let url = new URL(tasksApi);
    console.log(url);

    let response = await fetch(url);
    let result = await response.json();
    let status = result.status == 'to-do' ? 'done' : 'to-do';

    let formData = new FormData();
    formData.append('status', `${status}`);

    await fetch(url, {
        method: 'PUT',
        body: formData,
    });

    taskElement.remove();

    let list = document.getElementById(`${status}-list`);
    list.append(taskElement);

    amountTasks();
}


var taskId = 0;

async function generateTask(task) {
    let taskElement = document.getElementById(task.id);
    let creatingTask = !taskElement;
    let result;
    if (creatingTask) {
        let taskTemplate = document.getElementById('task-template');
        taskElement = taskTemplate.content.firstElementChild.cloneNode(true);
        taskElement.id = task.id;
    }

    taskElement.querySelector('span.task-name').textContent = task.name;

    let taskID = task.id;
    if (!creatingTask) {
        let host = 'http://tasks-api.std-900.ist.mospolytech.ru/api/tasks';
        let apyKey = 'api_key=50d2199a-42dc-447d-81ed-d68a443b697e';
        let tasksApi = `${host}/${taskID}?${apyKey}`;
        let url = new URL(tasksApi);
        
        let response = await fetch(url);
        result = await response.json();
    }

    if (creatingTask || (task.status != result.status)) {
        let list;
        if (task.status == 'to-do') {
            list = document.getElementById('to-do-list');
        } else if (task.status == 'done') {
            list = document.getElementById('done-list');
        }
        list.append(taskElement);
    }
    for (let btn of document.querySelectorAll('.move-btn')) {
        btn.onclick = moveBtnHandler;
    }
    amountTasks();
}

async function createTask() {

    let form = document.getElementById('form');
    let task = {
        id: taskId + 1,
        name: form.elements['createTaskName'].value,
        description: form.elements['createTaskDescription'].value,
        status: form.elements['createTaskStatus'].value
    };

    let host = 'http://tasks-api.std-900.ist.mospolytech.ru/api/tasks';
    let apiKey = 'api_key=50d2199a-42dc-447d-81ed-d68a443b697e';
    let tasksApi = `${host}?${apiKey}`;
    let url = new URL(tasksApi);
    let dataForm = new FormData(form);

    let response = await fetch(url, {
        method: 'POST',
        body: dataForm,
    });


    if (response.ok) {
        let result = await response.json();
        task.id = result.id;
    }

    generateTask(task);

    showAlert('create');
    form.reset();

    taskId++;
}

async function editTask() {
    let form = document.getElementById('editForm');
    let task = {
        id: form.elements['editTaskId'].value,
        name: form.elements['editTaskName'].value,
        description: form.elements['editTaskDescription'].value,
        status: form.elements['editTaskStatus'].value
    };

    generateTask(task);

    let host = 'http://tasks-api.std-900.ist.mospolytech.ru/api/tasks';
    let apyKey = 'api_key=50d2199a-42dc-447d-81ed-d68a443b697e';
    let tasksApi = `${host}/${task.id}?${apyKey}`;
    let url = new URL(tasksApi);

    await fetch(url, {
        method: 'PUT',
        body: new FormData(form),
    });

    showAlert('edit');
    amountTasks();

    form.reset();
    taskId++;
}

async function deleteTask() {
    let form = document.getElementById("deleteForm");
    let taskID = form.elements['taskID'].value;

    let host = 'http://tasks-api.std-900.ist.mospolytech.ru/api/tasks';
    let apyKey = 'api_key=50d2199a-42dc-447d-81ed-d68a443b697e';
    let tasksApi = `${host}/${taskID}?${apyKey}`;
    let url = new URL(tasksApi);

    await fetch(url, {
        method: 'DELETE'
    });

    let task = document.getElementById(taskID);
    task.remove();

    showAlert('delete');
    amountTasks();
}


async function LoadStorage() {
    let host = 'http://tasks-api.std-900.ist.mospolytech.ru/api/tasks';
    let apyKey = 'api_key=50d2199a-42dc-447d-81ed-d68a443b697e';
    let tasksApi = `${host}?${apyKey}`;
    let url = new URL(tasksApi);

    let response = await fetch(url);
    let result = await response.json();

    for (var key in result.tasks) {
        generateTask(result.tasks[key]);
    }
}

const editTaskModal = document.getElementById('editTaskModal');

if (editTaskModal) {
    editTaskModal.addEventListener('show.bs.modal', async event => {

        const button = event.relatedTarget;
        let taskID = button.closest('.task').id;

        let host = 'http://tasks-api.std-900.ist.mospolytech.ru/api/tasks';
        let apyKey = 'api_key=50d2199a-42dc-447d-81ed-d68a443b697e';
        let tasksApi = `${host}/${taskID}?${apyKey}`;
        let url = new URL(tasksApi);

        let response = await fetch(url);
        let result = await response.json();

        let form = event.target.querySelector('form');
        form.elements['editTaskName'].value = result.name;
        form.elements['editTaskDescription'].value = result.desc;
        form.elements['editTaskStatus'].value = result.status;
        form.elements['editTaskId'].value = result.id;
    });
}

const showTaskModal = document.getElementById('showTaskModal');

if (showTaskModal) {
    showTaskModal.addEventListener('show.bs.modal', async event => {
        const button = event.relatedTarget;
        let taskID = button.closest('.task').id;

        console.log(button.closest('.task'));

        let host = 'http://tasks-api.std-900.ist.mospolytech.ru/api/tasks';
        let apyKey = 'api_key=50d2199a-42dc-447d-81ed-d68a443b697e';
        let tasksApi = `${host}/${taskID}?${apyKey}`;
        let url = new URL(tasksApi);

        let response = await fetch(url);
        let result = await response.json();

        document.getElementById('showTaskName').textContent = result.name;
        document.getElementById('showTaskDesc').textContent = result.desc;
    });
}

const deleteTaskModal = document.getElementById('deleteTaskModal');

if (deleteTaskModal) {
    deleteTaskModal.addEventListener('show.bs.modal', event => {
        const button = event.relatedTarget;

        let taskID = button.closest('.task').id;
        let form = event.target.querySelector("form");

        form.elements['taskID'].value = taskID;
    });
}

document.getElementById('createTask').onclick = createTask;
document.getElementById('editTask').onclick = editTask;
document.getElementById('deleteTask').onclick = deleteTask;

LoadStorage();