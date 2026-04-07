// Lấy dữ liệu từ local
let userData = JSON.parse(localStorage.getItem("userData"));
let loginSession = localStorage.getItem("loginSession");
let loginSessionStorage = JSON.parse(
  localStorage.getItem("loginSessionStorage"),
);

// Tạo dữ liệu mẫu khi local không có dữ liệu
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

  // Lưu danh sách lên local
  localStorage.setItem("userData", JSON.stringify(userData));
}

if (!loginSessionStorage) {
  loginSessionStorage = {};
  localStorage.setItem(
    "loginSessionStorage",
    JSON.stringify(loginSessionStorage),
  );
}

// Lấy các phân tử trong DOM

// Các phần tử trong Form
const registerForm = document.getElementById("form-register");
const inputFullName = document.getElementById("input-full-name");
const inputName = document.getElementById("input-name");
const inputEmail = document.getElementById("input-email");
const inputPassword = document.getElementById("input-password");
const inputConfirmPassword = document.getElementById("input-password-confirm");
const redirectLoginButton = document.getElementById("btn-login-redirect");
const passwordToggleButtons = document.getElementsByClassName(
  "btn-password-visible",
);

// Các phần từ liên qua đến lỗi
const checkBoxClause = document.getElementById("checkbox-clause");

const validateList = document.getElementsByClassName("validate");

//fullname: 0, name: 1, email: 2, email(format): 3, email(exits): 3, password: 5, password(length): 6, password(match): 7

//function

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

  // 1. Full Name
  if (!Boolean(inputFullName.value)) {
    isContinue = false;
    validateVisible(0, true);
  } else {
    validateVisible(0, false);
  }

  // 2. Name
  if (!Boolean(inputName.value)) {
    isContinue = false;
    validateVisible(1, true);
  } else {
    validateVisible(1, false);
  }

  validateVisible([2, 3, 4], false);
  if (!Boolean(inputEmail.value)) {
    isContinue = false;
    validateVisible(2, true);
  } else if (!isValidEmail(inputEmail.value)) {
    isContinue = false;
    validateVisible(3, true);
  } else if (exitsEmailCheck(inputEmail.value)) {
    isContinue = false;
    validateVisible(4, true);
  }

  validateVisible([5, 6], false);
  if (!Boolean(inputPassword.value)) {
    isContinue = false;
    validateVisible(5, true);
  } else if (inputPassword.value.length < 8) {
    isContinue = false;
    validateVisible(6, true);
  }

  // 5. Confirm Password
  if (inputConfirmPassword.value != inputPassword.value) {
    isContinue = false;
    validateVisible(7, true);
  } else {
    validateVisible(7, false);
  }

  // 6. Checkbox Clause
  if (!checkBoxClause.checked) {
    isContinue = false;
    validateVisible(8, true);
  } else {
    validateVisible(8, false);
  }

  return isContinue;
};

const exitsEmailCheck = (email) => {
  for (const index in userData) {
    if (userData[index].email == email) {
      console.log(userData[index].email, email);

      return true;
    }
  }
  return false;
};

const getUserDataIndex = (id) => {
  for (let i = 0; i < userData.length; i++) {
    const element = userData[i];
    if (element.id == id) {
      return i;
    }
  }
  return -1;
};

//getHighestID
const getHightestID = (dataName, data) => {
  if (typeof data !== "object" || data === null) {
    console.error("data is corrupt");
    return;
  }
  let highestId = Number(localStorage.getItem(dataName));
  if (!highestId) {
    highestId = 0;
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      if (element.id > highestId) {
        highestId = element.id;
      }
    }
  }
  localStorage.setItem(dataName, highestId + 1);
  return highestId;
};

const saveData = () => {
  localStorage.setItem("userData", JSON.stringify(userData));
  localStorage.setItem(
    "loginSessionStorage",
    JSON.stringify(loginSessionStorage),
  );
  localStorage.setItem("loginSession", loginSession);
};

const getCurrentTime = () => {
  const now = new Date();
  const curr = now.toISOString().slice(0, 19) + "Z";
  return curr;
};

const switchTab = () => {
  window.location.href = "./login.html";
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

//startup

if (loginSession && loginSessionStorage[loginSession]) {
  window.location.href = "./category-manager.html";
}

//event
registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateInput()) {
    return;
  }

  let newUserData = {
    id: getHightestID("userDataHighestData", userData) + 1,
    first_name: inputFullName.value,
    last_name: inputName.value,
    email: inputEmail.value,
    password: inputPassword.value,
    created_at: getCurrentTime(),
  };

  userData.push(newUserData);

  //   const newLoginSession = crypto.randomUUID();
  //   loginSession = newLoginSession;
  //   loginSessionStorage[loginSession] = getUserDataIndex(newUserData.id);
  sessionStorage.setItem(
    "notification",
    JSON.stringify({ title: "Tài khoản", desc: "Đã đăng kí thành công" }),
  );
  saveData();
  switchTab();
});

redirectLoginButton.addEventListener("click", (event) => {
  switchTab();
  //window.location.href = "./login.html";
});

for (const btn of passwordToggleButtons) {
  btn.addEventListener("click", () => toggleShowPassword(btn));
}
