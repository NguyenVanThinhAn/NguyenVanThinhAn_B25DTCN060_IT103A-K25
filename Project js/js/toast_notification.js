//support
const removeToast = (toast) => {
  if (!toast) return;

  toast.classList.add("noti-close");

  setTimeout(() => {
    toast.remove();
  }, 500);
};

//main
export function addCheckedToast(title, desc) {
  const notiTable = document.querySelector(".notification-table");
  if (!notiTable) {
    console.error("notification-table(div/tag) not found");
    return;
  }

  const wrapper = document.createElement("div");

  wrapper.innerHTML = `
        <div class="noti-toast">
            <div class="noti-icon">
                <img src="../asset/icons/check_circle.svg" alt="notification icon">
            </div>
            <div class="noti-content">
                <p class="noti-title"></p>
                <p class="noti-desc"></p>
            </div>
            <div class="noti-func">
                <button class="btn-close-noti">
                    <img src="../asset/icons/close_button.svg" alt="">
                </button>
            </div>
        </div>
    `;

  const toast = wrapper.firstElementChild;

  toast.querySelector(".noti-title").textContent = title;
  toast.querySelector(".noti-desc").textContent = desc;
  notiTable.appendChild(toast);

  toast.classList.add("noti-close");
  setTimeout(() => {
    toast.classList.remove("noti-close");
  }, 1);

  if (notiTable.children.length >= 5) {
    const extra = notiTable.children.length - 5;

    for (let i = 0; i < extra; i++) {
      removeToast(notiTable.children[i]);
    }
  }

  setTimeout(() => {
    removeToast(toast);
  }, 5000);
}

export function closeNotificarionHandler() {
  const notiTable = document.querySelector(".notification-table");
  if (!notiTable) {
    console.error("notification-table(div/tag) not found");
    return;
  }

  notiTable.addEventListener("click", (event) => {
    const button = event.target.closest(".btn-close-noti");
    if (button) {
      const toast = button.closest(".noti-toast");
      removeToast(toast);
    }
  });
}
