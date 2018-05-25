import axios from "axios";

const todoAPI = axios.create({
  baseURL: process.env.API_URL
});

const rootEl = document.querySelector(".root");

function login(token) {
  localStorage.setItem("token", token);
  todoAPI.defaults.headers["Authorization"] = `Bearer ${token}`;
  // rootEl.classList.add("root--authed");
}

function logout() {
  localStorage.removeItem("token");
  delete todoAPI.defaults.headers["Authorization"];
}

const templates = {
  todoList: document.querySelector("#todo-list").content,
  todoItem: document.querySelector("#todo-item").content,
  login: document.querySelector("#login").content,
  newTodo: document.querySelector("#newTodo").content
  // logout: document.querySelector('#logout').content
};

function render(frag) {
  rootEl.textContent = "";
  rootEl.appendChild(frag);
}

async function indexPage() {
  const res = await todoAPI.get("/todos");
  const todoFrag = document.importNode(templates.todoList, true);

  todoFrag
    .querySelector(".todo-list__login-btn")
    .addEventListener("click", e => {
      loginPage();
    });

  todoFrag
    .querySelector(".todo-list__logout-btn")
    .addEventListener("click", e => {
      console.log('wwwww');
      logout();
      loginPage();
    });

  todoFrag
    .querySelector(".todo-list__new-todo-btn")
    .addEventListener("click", e => {
      newTodoPage();
    });

  res.data.forEach(item => {
    const fragment = document.importNode(templates.todoItem, true);
    const contentEl = fragment.querySelector(".todo-item__content");
    const completeButton = fragment.querySelector(".option--complete");
    const deleteButton = fragment.querySelector(".option--delete");
    fragment.querySelector(".todo-item__content").textContent = item.body;

    // const pEl = fragment.querySelector('.todo-item__content');
    // // pEl.addEventListener('click', e => {
    // //   console.log('asfdasdfsad');
    // //   todoOption();
    // // });

    fragment
      .querySelector(".option--complete")
      .addEventListener("click", async e => {
        console.log("aaaaa");
        const payload = {
          complete: true
        };
        const res = await todoAPI.patch(`/todos/${item.id}`, payload);
        contentEl.textContent = "done";
      });

    fragment
      .querySelector(".option--delete")
      .addEventListener("click", async e => {
        console.log("ssssss");
        const res = await todoAPI.delete(`/todos/${item.id}`);
        contentEl.textContent = "";
        completeButton.classList.add("hide");
        deleteButton.classList.add("hide");
      });

    todoFrag.querySelector(".todo-list").appendChild(fragment);
  });

  render(todoFrag);
}

async function loginPage() {
  const fragment = document.importNode(templates.login, true);
  const formEl = fragment.querySelector(".login__form");

  formEl.addEventListener("submit", async e => {
    const payload = {
      username: e.target.elements.username.value,
      password: e.target.elements.password.value
    };
    e.preventDefault();

    const res = await todoAPI.post("/users/login", payload);

    login(res.data.token);
    indexPage();
  });

  render(fragment);
}

async function newTodoPage() {
  // const res = await todoAPI.get(`/todos/${todoId}`)

  const fragment = document.importNode(templates.newTodo, true);
  const formEl = fragment.querySelector(".newTodo__form");

  formEl.addEventListener("submit", async e => {
    const payload = {
      body: e.target.elements.body.value,
      complete: false
    };
    e.preventDefault();

    const res = await todoAPI.post("/todos", payload);
    indexPage();
  });
  render(fragment);
};

if (localStorage.getItem("token")) {
  login(localStorage.getItem("token"));
}

loginPage();
