//import module
import {
  addCheckedToast,
  closeNotificarionHandler,
} from "./toast_notification.js";

let userData = JSON.parse(localStorage.getItem("userData"));
let loginSession = localStorage.getItem("loginSession");
let loginSessionStorage = JSON.parse(
  localStorage.getItem("loginSessionStorage"),
);

if (!userData) {
  userData = [
    {
      id: 1,
      first_name: "Nguyễn Văn",
      last_name: "Nam",
      email: "nvnam@gmail.com",
      password: "12345678",
      created_at: "2021-01-01T00:00:00Z",
    },
    {
      id: 2,
      first_name: "Nguyễn Văn",
      last_name: "Nem",
      email: "nvnem@gmail.com",
      password: "39275923942",
      created_at: "2021-01-01T00:00:00Z",
    },
  ];
  localStorage.setItem("userData", JSON.stringify(userData));
}

if (!loginSessionStorage) {
  loginSessionStorage = {};
  localStorage.setItem(
    "loginSessionStorage",
    JSON.stringify(loginSessionStorage),
  );
}

//get element

const loginForm = document.getElementById("form-login");
const inputEmail = document.getElementById("input-email");
const inputPassword = document.getElementById("input-password");
const passwordToggleButtons = document.getElementsByClassName(
  "btn-password-visible",
);
const redirectRegisterButton = document.getElementById("btn-register-redirect");

const checkboxRemember = document.getElementById("checkbox-remember");

const validateList = document.getElementsByClassName("validate");
//email: 0, incorrect password or name: 1 & 2, password: 3

//func

const switchTab = () => {
  if (loginSession && loginSessionStorage[loginSession]) {
    window.location.href = "./category-manager.html";
  } else if (loginSessionStorage[sessionStorage.getItem("loginSession")]) {
    window.location.href = "./category-manager.html";
  }
};

const toggleShowPassword = (btn) => {
  const container = btn.parentElement;
  const input = container.querySelector("input");

  const hideIcon = btn.querySelector(".password-hide-icon");
  const showIcon = btn.querySelector(".password-show-icon");

  const isHidden = !hideIcon.classList.contains("hide");

  if (isHidden) {
    input.type = "text";
    hideIcon.classList.add("hide");
    showIcon.classList.remove("hide");
  } else {
    input.type = "password";
    showIcon.classList.add("hide");
    hideIcon.classList.remove("hide");
  }
};

//#region Các hàm liên quan đến validate dữ liệu
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validateVisible = (indices, isVisible) => {
  const indexArray = Array.isArray(indices) ? indices : [indices];

  indexArray.forEach((idx) => {
    const validateText = validateList[idx];

    if (!validateText) return;

    const inputElement = validateText.parentElement.querySelector("input");

    if (isVisible) {
      if (inputElement) inputElement.classList.add("input-error");
      validateText.classList.remove("hide");
    } else {
      if (inputElement) inputElement.classList.remove("input-error");
      validateText.classList.add("hide");
    }
  });
};

const validateInput = () => {
  let isContinue = true;

  validateVisible([0, 1, 2, 3], false);

  if (!Boolean(inputEmail.value) || !isValidEmail(inputEmail.value)) {
    isContinue = false;
    validateVisible(0, true);
  }

  if (!Boolean(inputPassword.value)) {
    isContinue = false;
    validateVisible(3, true);
  }

  return isContinue;
};

//#endregion

const saveData = () => {
  localStorage.setItem(
    "loginSessionStorage",
    JSON.stringify(loginSessionStorage),
  );
  localStorage.setItem("loginSession", loginSession);
};

const checkAccout = (email, password) => {
  for (let i = 0; i < userData.length; i++) {
    const element = userData[i];
    let checkingEmail = element.email;
    let checkingPassword = element.password;
    if (email === checkingEmail && password === checkingPassword) {
      return i;
    }
  }
  return -1;
};

//startup
switchTab();

let notifiMsg = JSON.parse(sessionStorage.getItem("notification"));
if (notifiMsg) {
  addCheckedToast(notifiMsg.title, notifiMsg.desc);
  sessionStorage.removeItem("notification");
}

//event
for (const btn of passwordToggleButtons) {
  btn.addEventListener("click", () => toggleShowPassword(btn));
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateInput()) {
    return;
  }
  const dataIndex = checkAccout(inputEmail.value, inputPassword.value);
  if (dataIndex < 0) {
    validateVisible([1, 2], true);
    return;
  }

  const newLoginSession = crypto.randomUUID();
  if (checkboxRemember.checked) {
    loginSession = newLoginSession;
    loginSessionStorage[newLoginSession] = dataIndex;
    saveData();
    switchTab();
    console.log("daNhan");
  } else {
    sessionStorage.setItem("loginSession", newLoginSession);
    loginSessionStorage[newLoginSession] = dataIndex;
    saveData();
    switchTab();
    console.log("yeah");
  }
});

redirectRegisterButton.addEventListener("click", (event) => {
  window.location.href = "./register.html";
});
