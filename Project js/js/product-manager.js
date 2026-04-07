//gọi module thông báo toast
import {
  addCheckedToast,
  closeNotificarionHandler,
} from "./toast_notification.js";

//lấy data từ local
let userData = JSON.parse(localStorage.getItem("userData"));
let loginSession = localStorage.getItem("loginSession");
let loginSessionStorage = JSON.parse(
  localStorage.getItem("loginSessionStorage"),
);

let productsData = JSON.parse(localStorage.getItem("productsData"));
let categoriesData = JSON.parse(localStorage.getItem("categoriesData"));

if (!userData) {
  userData = [
    {
      id: 1,
      first_name: "Nguyễn Văn",
      last_name: "Nam",
      email: "nvnam@gmail.com",
      password: "123456elePerPage8",
      created_at: "2021-01-01T00:00:00Z",
    },
    {
      id: 2,
      first_name: "Nguyễn Văn",
      last_name: "Nem",
      email: "nvnem@gmail.com",
      password: "392elePerPage5923942",
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

if (!productsData) {
  productsData = {};
  localStorage.setItem("productsData", JSON.stringify(productsData));
}

if (!categoriesData) {
  categoriesData = {};
  localStorage.setItem("categoriesData", JSON.stringify(categoriesData));
}

//lấy các phần tử trong DOM
let currUserData =
  userData[loginSessionStorage[loginSession]] ||
  userData[loginSessionStorage[sessionStorage.getItem("loginSession")]];
const addModalButton = document.getElementById("btn-add-modal");
const modalFrame = document.getElementById("modal");
const pageButtonTable = document.getElementById("btn-page-table");
const logoutMenu = document.getElementById("logoutMenu");
const buttonUserProfile = document.getElementById("btn-user-profile");
const confirmModal = document.getElementById("confirm-modal");
const filterButton = document.getElementById("btn-filter");
const sortButton = document.getElementById("btn-sort");
const categoryFilterButton = document.getElementById("btn-category");
const searchBox = document.getElementById("input-search");
const categorySelect = document.getElementById("product-select");
const categoryPageButton = document.getElementById("btn-category-page");

const productDataTable = document.getElementById("catagories-table");
const validateList = document.getElementsByClassName("validate");

//Các biến global
let currEditIndex;
let currEditElement;
let currPage = 1;
let currFilter = "all";
let currCategorySortMode = "none";
let currSearchKeyWord;
let currCategoryFilter;
const elePerPage = 20;

//function

//#region Các hàm điều khiển validate

//hàm check ảnh
const checkImg = (imgLink) => {
  return /\.(jpg|jpeg|png|webp|gif)$/i.test(imgLink.trim());
};

// ẩn/hiện validate bằng cách truyền vào phần tử DOM và giá trị đúng sai
//input: indices(số hoặc arr), nếu là số sẽ chuyển về dạng array. Dùng để xác định target là validate nào
//input: isVisible(giá trị đúng hoặc sai), dùng để quyết định xem ẩn hay hiện
//output tùy thuộc vào isVisible mà sẽ ẩn hoặc hiện validate
const validateVisible = (indices, isVisible) => {
  const indexArray = Array.isArray(indices) ? indices : [indices]; //chuyển đổi số sang array

  indexArray.forEach((idx) => {
    //vì mặc định đã chuyển về array vì vậy vị trí nằm ở value
    const validateText = validateList[idx];

    if (!validateText) return; //không tìm thấy thì chặn luôn

    const inputElement =
      validateText.parentElement.querySelector("input") ||
      validateText.parentElement.querySelector("select"); //Lấy phần tử cha và truy cập vào input của validate đó

    //tùy thuộc vào giá trị isVisible mà thêm hoặc xóa class ẩn
    if (isVisible) {
      if (inputElement) inputElement.classList.add("input-error");
      validateText.classList.remove("hide");
    } else {
      if (inputElement) inputElement.classList.remove("input-error");
      validateText.classList.add("hide");
    }
  });
};

//validate của 2 input
//input: input product_input_code(giá input mã của danh mục), nhằm lấy giá trị để kiểm tra xem có trùng không
//input: product_input_name(giá trị input của tên danh mục ), nhằm lấy tên để kiểm tra xem có rỗng không
//output: giá trị đúng/sai, chỉ cần 1 điều kiện ko đáp ứng sẽ trả về sai
//validate của các input
//output: giá trị đúng/sai, chỉ cần 1 điều kiện ko đáp ứng sẽ trả về sai
const validateInput = (
  product_input_code,
  product_input_name,
  category_select,
  product_input_img,
  product_input_quantity,
  product_input_price,
) => {
  let isContinue = true; //giá trị cuối cùng được trả về

  //product validate (index 0, 1)
  const productValue = product_input_code.trim();
  const foundIndex = getProductDataIndexByProductCode(productValue);

  if (!productValue) {
    //nếu rỗng
    isContinue = false;
    validateVisible(0, true);
  } else if (foundIndex >= 0 && foundIndex !== currEditIndex) {
    // trùng và không phải chính nó
    isContinue = false;
    validateVisible(1, true);
  } else {
    //ẩn validate đi
    validateVisible([0, 1], false);
  }

  //product name validate (index 2, 3)
  const nameValue = product_input_name.trim();
  const foundIndex_name = getProductDataIndexByProductName(nameValue);

  if (!nameValue) {
    //nếu rỗng
    isContinue = false;
    validateVisible(2, true);
  } else if (foundIndex_name >= 0 && foundIndex !== currEditIndex) {
    isContinue = false;
    validateVisible(3, true);
  } else {
    //ẩn validate
    validateVisible([2, 3], false);
  }

  //category validate (index 4)
  const categoryValue = category_select;

  if (categoryValue == "none" || !categoryValue) {
    isContinue = false;
    validateVisible(4, true);
  } else {
    validateVisible(4, false);
  }

  //quantity validate (index 5)
  const quantityValue = Number(product_input_quantity);
  if (
    product_input_quantity === "" ||
    isNaN(quantityValue) ||
    quantityValue < 0 ||
    !Number.isInteger(quantityValue)
  ) {
    isContinue = false;
    validateVisible(5, true);
  } else {
    validateVisible(5, false);
  }

  //price validate (index 6)
  const priceValue = convertVND(product_input_price);

  if (product_input_price.toString().trim() === "" || priceValue <= 0) {
    isContinue = false;
    validateVisible(6, true);
  } else {
    validateVisible(6, false);
  }

  //img validate (index 7, 8)
  const img = product_input_img.trim();

  if (!img) {
    isContinue = false;
    validateVisible(7, true);
  } else if (!checkImg(img)) {
    isContinue = false;
    validateVisible(8, true);
  } else {
    validateVisible([7, 8], false);
  }

  // sales (giảm giá) không có thẻ <p class="validate hide"> trong HTML nên bỏ qua validate hiển thị

  return isContinue;
};

//getid: by id
const getUserDataIndex = (id) => {
  for (let i = 0; i < userData.length; i++) {
    const element = userData[i];
    if (element.id == id) {
      return i;
    }
  }
  return -1;
};

//#endregion

//#region Các hàm tìm kiếm, lọc dữ liệu từ mã,id,filter

//Hàm lọc dữ liệu
//input: filter(lọc), bộ lọc liên quan đến trạng thái của danh mục
//input: sortBy(sắp xếp), sắp xếp theo tên/ngày được tạo ra
//input: keyword: từ khóa tìm kiếm, nếu check includes có thì thêm vào
//output: mảng dữ liệu đã lọc
const getFilteredData = (
  filter = "all",
  sortBy,
  keyword = "",
  categoriFilter = "none",
) => {
  let dataWrapper = [];

  for (let i = 0; i < productsData[currUserData.id].length; i++) {
    //kiểm tra filter và từ khóa trước
    const element = productsData[currUserData.id][i];
    if (!element) continue; //nếu rỗng thì skip

    const name = element.product_name.toLowerCase();
    const code = element.product_code.toLowerCase();
    const keywordLower = keyword.toLowerCase();
    const category = element.category;
    //check xem có đúng filter và keyword không
    if (
      filter == "active" &&
      element.status == "ACTIVE" &&
      (name.includes(keywordLower) || code.includes(keywordLower)) &&
      (category === categoriFilter || categoriFilter === "none")
    ) {
      dataWrapper.push(element);
    } else if (
      filter == "inactive" &&
      element.status == "INACTIVE" &&
      (name.includes(keywordLower) || code.includes(keywordLower)) &&
      (category === categoriFilter || categoriFilter === "none")
    ) {
      dataWrapper.push(element);
    } else if (
      filter == "all" &&
      (name.includes(keywordLower) || code.includes(keywordLower)) &&
      (category === categoriFilter || categoriFilter === "none")
    ) {
      dataWrapper.push(element);
    }
  }

  //sắp xếp
  if (sortBy) {
    if (sortBy == "name") {
      dataWrapper.sort((a, b) => {
        const aName = a.product_name.toLowerCase();
        const bName = b.product_name.toLowerCase();
        if (aName < bName) return -1;
        if (aName > bName) return 1;
        return 0;
      });
    } else if (sortBy == "date") {
      dataWrapper.sort((a, b) => {
        const aDate = a.created_at.toLowerCase();
        const bDate = b.created_at.toLowerCase();
        if (aDate < bDate) return -1;
        if (aDate > bDate) return 1;
        return 0;
      });
    } else if (sortBy == "price") {
      dataWrapper.sort((a, b) => {
        const aDate = Math.ceil(Number(a.price));
        const bDate = Math.ceil(Number(b.price));
        if (aDate < bDate) return -1;
        if (aDate > bDate) return 1;
        return 0;
      });
    }
  }

  return dataWrapper;
};

//Lấy index dữ liệu của một sản phẩm từ mã danh mục(đầu vào mã danh mục)
const getProductDataIndexByProductCode = (product_code) => {
  for (let i = 0; i < productsData[currUserData.id].length; i++) {
    const element = productsData[currUserData.id][i];
    if (element.product_code == product_code) {
      return i;
    }
  }
  return -1;
};

//Lấy index dữ liệu của một sản phẩm từ tên danh mục(đầu vào mã danh mục)
const getProductDataIndexByProductName = (product_name) => {
  for (let i = 0; i < productsData[currUserData.id].length; i++) {
    const element = productsData[currUserData.id][i];
    if (element.product_name == product_name) {
      return i;
    }
  }
  return -1;
};
//Lấy index dữ liệu danh mục từ id của danh mục
const getProductDataIndexById = (id) => {
  for (let i = 0; i < productsData[currUserData.id].length; i++) {
    const element = productsData[currUserData.id][i];
    if (!element) {
      continue;
    }
    if (element.id == id) {
      return i;
    }
  }
  return -1;
};

//lấy id cao nhất tùy thuọc vào tên dữ liệu
//input: dataName(tên dữ liệu), data(arr hoặc key-value dữ liệu)
//output: trả về id cao nhất hiện tại
const getHightestID = (dataName, data) => {
  //kiểm tra data có null không, bảo vệ data
  if (typeof data !== "object" || data === null) {
    return;
  }
  let highestId = Number(localStorage.getItem(dataName)); //thử tìm kiếm dữ liệu sẵn có
  if (!highestId) {
    //nếu không có, tiến hành quét qua và kiểm tra toàn bộ thuộc tính "id" vào tạo dữ liệu
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

const convertVND = (value) => {
  // CASE 1: number -> format VND
  if (typeof value === "number") {
    if (isNaN(value)) return "0 ₫";
    return value.toLocaleString("vi-VN") + " ₫";
  }

  // CASE 2: string -> parse ngược về number
  if (typeof value === "string") {
    return Number(value.replace("₫", "").split(".").join("").trim()) || 0;
  }
  return 0;
};

const convertPercent = (value) => {
  if (typeof value === "number") {
    if (isNaN(value)) return "0 ";
    return value.toLocaleString() + "%";
  }

  // CASE 2: string -> parse ngược về number
  if (typeof value === "string") {
    return (
      Number(
        value
          .replace("%", "") // bỏ chữ cuối (₫)
          .trim(), // bỏ space đầu/cuối
      ) || 0
    );
  }
  return 0;
};

//#endregion

//#region Các hàm render
//hàm render ra DOM danh mục dựa trên dữ liệu
//input: data(dữ liệu keyvalue của 1 danh mục)
//output: string HTML hoàn chỉnh của danh mục đó
const dataToHTML = (data) => {
  // Đảm bảo có giá trị mặc định nếu data cũ chưa có các trường này
  const price = convertVND(Number(data.price));
  const stock = data.stock || "0";
  const discount = convertPercent(Number(data.discount));
  return `
      <tr class="category-element" sp-data-id="${data.id}">
        <td class="product-code">${data.product_code}</td>
        <td class="font-medium product-name">${data.product_name}</td>
        <td>${price}</td>
        <td>${stock}</td>
        <td>${discount}</td>
        <td class="status-display">
          <span class="status-badge status-${data.status == "ACTIVE" ? "active" : "inactive"}">
            <span class="dot"></span> ${data.status == "ACTIVE" ? "Đang" : "Ngừng"} hoạt động
          </span>
        </td>
        <td class="actions">
          <button class="btn-action btn-action-delete">
            <img
              src="../asset/icons/category-asset/Trash.svg"
              alt="Xóa"
            />
          </button>
          <button class="btn-action btn-action-edit">
            <img
              src="../asset/icons/category-asset/Edit.svg"
              alt="Sửa"
            />
          </button>
        </td>
      </tr>
      `;
};

//dùng hàm "dataToHTML" để chuyển hàng loạt dữ liệu thành DOM kết hợp với nhiều tính năng khác
//input: page(phân trang), nếu page < -1 mặc định render toàn bộ danh mục, nếu >= 1 thì sẽ thực hiện phân trang
//input: elementPerPage(số phần tử có trên 1 trang)
//input: filter(lọc theo status)
//output: Render ra các phần tử DOM theo thiết lập
const render = (
  page,
  elementPerPage = 7,
  filter = "all",
  sortBy,
  keyword,
  data,
) => {
  let htmlWrapper = []; // mảng chứa các html đã được convert
  let dataWrapper = data || getFilteredData(filter, sortBy, keyword); //mảng được truyền vào hoặc mảng lấy trực tiếp

  if (page < 1) {
    //render full
    for (let i = 0; i < dataWrapper.length; i++) {
      const element = dataWrapper[i];
      htmlWrapper.push(dataToHTML(element));
    }
  } else {
    //render theo page
    const startPage = (page - 1) * elementPerPage;
    const endPage = startPage + elementPerPage;

    for (let i = startPage; i < endPage; i++) {
      const element = dataWrapper[i];
      if (!element) break;
      htmlWrapper.push(dataToHTML(element));
    }
  }

  productDataTable.innerHTML = htmlWrapper.join("");
  return dataWrapper;
};

//render 2 nút page đầu và cuối, cập nhật nút cuối
//input: elementPerPage(giá trị để tính toán nút đầu và cuối)
//output: 2 nút đầu và cuối, khi gọi lại thì sẽ tính toán nút cuối
const startupButtonTable = (elementPerPage = 7) => {
  const totalPage = Math.ceil(
    //lấy tổng trang
    productsData[currUserData.id].length / elementPerPage,
  );
  //lấy DOM đầu và cuối
  const pageStart = pageButtonTable.querySelector(".page-start");
  const pageEnd = pageButtonTable.querySelector(".page-end");

  if (!pageStart.querySelector(".page-btn")) {
    pageStart.innerHTML = `<button class="page-btn">1</button>`;
  } else {
    //tìm thấy nút,nếu không phải 1 thì chỉnh thành 1
    const startBtn = pageStart.querySelector(".page-btn");
    if (Number(startBtn.textContent.trim()) !== 1) {
      startBtn.textContent = "1";
    }
  }

  if (!pageEnd.querySelector(".page-btn")) {
    pageEnd.innerHTML = `<button class="page-btn">${totalPage}</button>`;
  } else {
    //tìm thấy nút, page cuối khác page cuối hiện tại thì cập nhật
    const endBtn = pageEnd.querySelector(".page-btn");
    if (Number(endBtn.textContent.trim()) !== totalPage) {
      endBtn.textContent = totalPage;
    }
  }
};

//tạo nút,điều khiển hiển thị nút dựa vào page hiện tại
//input: currPage(page hiện tại), hàm sẽ tính toán xung quanh giá trị này
//input: range(phạm vi), tính toán mấy nút trước/sau currpage
//input: elementPerPage()
//input: fullpage(totalPage nhưng được đổi tên), nếu không có sẽ trực tiếp tính toán totalpage
//output: các nút chọn page
const pageButtonCreate = (
  currPage,
  range,
  elementPerPage = elePerPage,
  fullPage,
) => {
  const totalPage = //tổng page
    fullPage ||
    Math.ceil(productsData[currUserData.id].length / elementPerPage);
  const pageStart = pageButtonTable.querySelector(".page-start"); //phần đầu
  const pageEnd = pageButtonTable.querySelector(".page-end"); //phần cuối
  const pageMid = pageButtonTable.querySelector(".page-mid"); //phần giữa(phân tích chính)
  const pageDot = pageButtonTable.querySelectorAll(".page-dots"); //0: start dot, 1: end dot

  //biến quyết định render từ page nào đến page nào
  let start = null;
  let end = null;

  //kiểm tra xem page hiện tại có gần start không
  if (currPage - range <= range) {
    start = 1;
  }

  //kiểm tra xem page hiện tại có gần end không
  if (currPage + range >= totalPage) {
    end = totalPage;
  }

  //nếu không gần start thì render thêm số nút tương ứng với range
  if (!start) {
    if (currPage - range <= range) {
      start = 1;
    } else {
      start = currPage - range;
    }
  }

  //nếu không gần end thì render thêm số nút tương ứng với range
  if (!end) {
    if (currPage + range >= totalPage) {
      end = totalPage;
    } else {
      end = currPage + range;
    }
  }

  // Ẩn / hiện pageStart
  if (pageStart) {
    if (start > 1) pageStart.classList.remove("hide");
    else pageStart.classList.add("hide");
  }

  // Ẩn / hiện pageEnd
  if (pageEnd) {
    if (end < totalPage) pageEnd.classList.remove("hide");
    else pageEnd.classList.add("hide");
  }

  if (pageDot[0]) {
    if (start > 2) pageDot[0].classList.remove("hide");
    else pageDot[0].classList.add("hide");
  }

  if (pageDot[1]) {
    if (end < totalPage - 1) pageDot[1].classList.remove("hide");
    else pageDot[1].classList.add("hide");
  }
  //tạo các nút
  pageMid.innerHTML = "";
  for (let i = start; i <= end; i++) {
    pageMid.insertAdjacentHTML(
      "beforeend",
      `<button class="page-btn ${i == currPage ? "active" : ""}">${i}</button>`,
    );
  }
};
//#endregion

//#region Các hàm còn lại

// switch giữa 2 mode thêm và sửa bằng cách sửa class và title trong DOM
//Input: mode(string,add hoặc edit tương ứng với thêm và sửa), data(key-value,dữ liệu input điền sẵn cho sửa)
//output: class tương ứng với mode đã switch, edit mode đã được điền dữ liệu có sẵn vào input. DOM được hiển thị
// switch giữa 2 mode thêm và sửa bằng cách sửa class và title trong DOM
const switchModalMode = (mode, data) => {
  const modalTitle = modalFrame.querySelector(".modal-header h2");
  const saveButton = modalFrame.querySelector(".modal-footer .btn-save");
  const categoryButton = modalFrame.querySelector(".form-row .select-control");
  const inputs = modalFrame.querySelectorAll(".input-control");
  const statusRadios = modalFrame.querySelectorAll(".status-radio"); // Lấy danh sách radio button
  const validates = modalFrame.getElementsByClassName("validate");

  for (let i = 0; i < validates.length; i++) {
    validateVisible(i, false);
  }

  if (mode === "add") {
    //chuyển mode thêm vào bằng cách đổi class và clear input
    if (modalTitle) modalTitle.textContent = "Thêm mới sản phẩm";
    if (saveButton) saveButton.textContent = "Thêm";

    // Clear toàn bộ input text/number
    inputs.forEach((input) => {
      if (input) input.value = "";
    });

    if (categoryButton) {
      categoryButton.value = "none";
    }

    // Thêm mới mặc định tick chọn "Đang hoạt động"
    if (statusRadios.length >= 2) {
      statusRadios[0].checked = true;
    }

    currEditIndex = null;
    currEditElement = null;
    modalFrame.classList.remove("edit-mode");
    modalFrame.classList.add("add-mode");
  } else if (mode === "edit") {
    //chuyển mode sửa đổi bằng sửa class và thêm data được truyền vào
    if (modalTitle) modalTitle.textContent = "Cập nhật sản phẩm";
    if (saveButton) saveButton.textContent = "Lưu";

    if (data) {
      // Điền sẵn toàn bộ dữ liệu vào form
      if (inputs[0]) inputs[0].value = data.product_code || data.id;
      if (inputs[1]) inputs[1].value = data.product_name || data.name;
      if (inputs[2]) inputs[2].value = data.category || "";
      if (inputs[3]) inputs[3].value = data.stock || 1;
      if (inputs[4]) inputs[4].value = data.price || 0;
      if (inputs[5]) inputs[5].value = data.discount || 0;
      if (inputs[6]) inputs[6].value = data.image || "";
      if (inputs[7]) inputs[7].value = data.details || "";

      // Logic kiểm tra và check vào nút Radio trạng thái tương ứng
      if (data.status === "ACTIVE") {
        statusRadios[0].checked = true; // Check "Đang hoạt động"
      } else if (data.status === "INACTIVE") {
        statusRadios[1].checked = true; // Check "Ngừng hoạt động"
      }
    }

    modalFrame.classList.remove("add-mode");
    modalFrame.classList.add("edit-mode");
  }
};

//Lấy thời gian hiện tại
const getCurrentTime = () => {
  const now = new Date();
  const curr = now.toISOString().slice(0, 19) + "Z"; //cắt bớt phần thừa và + thêm "Z"
  return curr;
};

//Hiển thị DOM xác nhận và trả về kết quả
//input: title,msg,confirmBtnText -> là text display, trên DOM popup sẽ hiển thị nội dung
//input: element(chọn họp thoại, mặc định là confirmModal)
//output: hiện DOM xác nhận, nếu ấn xác nhận thì sẽ trả về đúng và ngược lại
const confirmPopUp = (
  title = "Xác nhận",
  msg = "none",
  confirmBtnText = "Xác nhận",
  element = confirmModal,
) => {
  //lấy biến element
  const confirmTitle = element.querySelector(".confirm-title");
  const confirmMsg = element.querySelector(".confirm-message");
  const cancelBtn = element.querySelector(".btn-cancel");
  const confirmBtn = element.querySelector(".btn-confirm");

  confirmTitle.innerHTML = title;
  confirmMsg.innerHTML = msg;
  confirmBtn.innerHTML = confirmBtnText;

  element.classList.remove("hide");

  //Trả về một Promise
  return new Promise((resolve) => {
    element.addEventListener("click", (event) => {
      let button = event.target;
      if (button === cancelBtn) {
        //trả về false
        element.classList.add("hide");
        resolve(false);
      } else if (button === confirmBtn) {
        //trả về true
        element.classList.add("hide");
        resolve(true);
      }
    });
  });
};

//hàm handler hiển thị page và nút page nhằm kiểm soát state
const handleChangeView = ({
  page = 1,
  filter = currFilter || "all",
  sortBy = currCategorySortMode || "none",
  keyword = currSearchKeyWord,
  categoriFilter = currCategoryFilter || "none",
} = {}) => {
  let isFilterChange = false;
  if (filter !== currFilter) {
    isFilterChange = true;
  }

  let isSortByChange = false;
  if (sortBy !== currCategorySortMode) {
    isSortByChange = true;
  }

  let isKeywordChange = false;
  if (keyword !== currSearchKeyWord) {
    isKeywordChange = true;
  }

  let isCategoriFilterChange = false;
  if (categoriFilter !== currCategoryFilter) {
    isCategoriFilterChange = true;
  }

  if (filter !== false) {
    currFilter = filter;
  }

  if (sortBy !== false) {
    currCategorySortMode = sortBy;
  }

  if (keyword !== false) {
    currSearchKeyWord = keyword;
  }

  if (categoriFilter !== false) {
    currCategoryFilter = categoriFilter;
  }

  if (page !== false) {
    currPage = page;
  }

  if (
    isFilterChange ||
    isSortByChange ||
    isKeywordChange ||
    isCategoriFilterChange
  ) {
    //reset về trang thứ nhất
    currPage = 1;
  }

  const filteredData = getFilteredData(
    currFilter,
    currCategorySortMode,
    currSearchKeyWord,
    currCategoryFilter,
  );

  const totalPage = Math.max(1, Math.ceil(filteredData.length / elePerPage));

  if (currPage < 1) currPage = 1;
  console.log(currPage);
  if (currPage > totalPage) currPage = totalPage;

  render(
    currPage,
    elePerPage,
    currFilter,
    currCategorySortMode,
    currSearchKeyWord,
    filteredData,
  );

  pageButtonCreate(
    currPage,
    2,
    elePerPage,
    Math.ceil(filteredData.length / elePerPage),
  );
};

//Lưu dữ liệu
const saveData = () => {
  localStorage.setItem("userData", JSON.stringify(userData));
  localStorage.setItem(
    "loginSessionStorage",
    JSON.stringify(loginSessionStorage),
  );
  localStorage.setItem("productsData", JSON.stringify(productsData));
  localStorage.setItem("loginSession", loginSession);
};

//đổi liên kết giựa trên địa chỉ được truyền vào, hoặc có thể dùng để đẩy người dùng về login nếu chưa có dữ liệu người dùng
const switchTab = (href) => {
  if (!currUserData) {
    window.location.href = "./login.html";
  }
  if (href) {
    window.location.href = href;
  }
};

const getCategory = (defaultButton) => {
  let categoryData = categoriesData[currUserData.id];
  let htmlWrapper = [];

  if (defaultButton) {
    htmlWrapper.push(`<option value="none">${defaultButton}</option>`);
  }
  for (let i = 0; i < categoryData.length; i++) {
    const element = categoryData[i];
    if (!element || !(element.status == "ACTIVE")) {
      continue;
    }
    htmlWrapper.push(`
      <option value="${element.category_code}">${element.category_name}</option>
      `);
  }
  return htmlWrapper.join("");
};

//#endregion

//#region startup

switchTab(); //kiểm tra xem có dữ liệu người dùng chưa
if (!productsData[currUserData.id]) {
  //kiểm tra xem liệu đã có dữ liệu của danh mục cho người dùng chưa, nếu chưa thì khởi tạo
  if (!productsData[currUserData.id]) {
    productsData[currUserData.id] = [
      {
        id: 1,
        product_code: "SP001",
        product_name: "Iphone 12 Pro",
        category: "DM001",
        price: 12000000,
        stock: 10,
        discount: 0,
        image:
          "https://suckhoedoisong.qltns.mediacdn.vn/Images/thanhloan/2016/06/05/tac-dung-cua-qua-cam-2.jpg", // Thêm link ảnh
        details: "Hàng chính hãng, nguyên seal.",
        status: "ACTIVE",
        created_at: "2021-01-01T00:00:00Z",
      },
      {
        id: 2,
        product_code: "SP002",
        product_name: "Samsung Galaxy X20",
        category: "DM002",
        price: 21000000,
        stock: 100,
        discount: 5,
        image:
          "https://suckhoedoisong.qltns.mediacdn.vn/Images/thanhloan/2016/06/05/tac-dung-cua-qua-cam-2.jpg", // Thêm link ảnh
        details: "Bản quốc tế, bảo hành 12 tháng.", // Thêm chi tiết sản phẩm
        status: "INACTIVE",
        created_at: "2021-01-01T00:00:00Z",
      },
    ];
    localStorage.setItem("productsData", JSON.stringify(productsData));
  }
  localStorage.setItem("productsData", JSON.stringify(productsData));
}

if (!categoriesData[currUserData.id]) {
  //kiểm tra xem liệu đã có dữ liệu của danh mục cho người dùng chưa, nếu chưa thì khởi tạo
  categoriesData[currUserData.id] = [
    //khởi tạo sẵn
    {
      id: 1,
      category_code: "DM001",
      category_name: "Hoa quả",
      status: "ACTIVE",
      created_at: "2021-01-01T00:00:00Z",
    },
    {
      id: 2,
      category_code: "DM002",
      category_name: "Rau củ",
      status: "INACTIVE",
      created_at: "2021-01-01T00:00:00Z",
    },
  ];
  localStorage.setItem("categoriesData", JSON.stringify(categoriesData));
}

render(currPage, elePerPage, currFilter, currCategorySortMode); //render mặc định
startupButtonTable(elePerPage); //tạo nút 2 đầu nút
pageButtonCreate(1, 2, elePerPage); //tạo nút mặc định
categorySelect.innerHTML = getCategory();
categoryFilterButton.innerHTML = getCategory("Danh mục: tất cả");

//Xóa phiên đăng nhập nếu người dùng không chọn "remember me"
// if (loginSessionStorage[sessionStorage.getItem("loginSession")]) {
//   delete loginSessionStorage[sessionStorage.getItem("loginSession")];
//   saveData();
// }

closeNotificarionHandler(); //khởi động hàm xử lý người dùng nhấn đóng thông báo
addCheckedToast("Xin chào", "bạn đang ở quản lý sản phẩm");
//#endregion

//event

//khi add(thêm danh mục), kích hoạt mode add và visible thẻ input
addModalButton.addEventListener("click", function () {
  switchModalMode("add");
  modalFrame.classList.remove("hide");
});

//theo dõi xem bấm nút đóng trong modalFrame, nếu đúng thì ẩn modalframe
modalFrame.addEventListener("click", function (event) {
  let button = event.target.closest("button");
  if (!button) {
    return;
  }
  if (
    button.classList.contains("btn-cancel") ||
    button.classList.contains("btn-close")
  ) {
    modalFrame.classList.add("hide");
  }
});

//xử lý các nút nằm trong DOM của hiển thị danh mục. Gồm có: sửa/xóa
productDataTable.addEventListener("click", async (event) => {
  //tìm button để xác định xem edit giữ liệu nào
  let button = event.target.closest("button");
  if (!button) {
    return;
  }

  //xem có đúng có class kích hoạt edit không
  if (button.classList.contains("btn-action-edit")) {
    const row = button.closest("tr"); //tìm phần tử DOM chứa dữ liệu cần thiết

    //lấy currEditIndex trước để có thể truy cập mảng data gốc
    currEditIndex = getProductDataIndexById(
      Number(row.getAttribute("sp-data-id")),
    );

    // lấy dữ liệu của sản phẩm đang được bấm sửa
    const currentProductData = productsData[currUserData.id][currEditIndex];

    switchModalMode("edit", currentProductData);
    currEditElement = row; //ghi vào biến phần tử DOM đang được sửa hiện tại
    modalFrame.classList.remove("hide"); //hiển thị DOM của phần sửa đổi
  } else if (button.classList.contains("btn-action-delete")) {
    const row = button.closest("tr"); //tìm phần tử DOM chứa dữ liệu cần thiết

    const dataIndex = getProductDataIndexById(
      Number(row.getAttribute("sp-data-id")),
    );

    if (
      await confirmPopUp(
        "Xác nhận",
        `Bạn có muốn xóa sản phẩm với mã <strong>${productsData[currUserData.id][dataIndex].product_code}<strong/>`,
        "Xóa",
      )
    ) {
      productsData[currUserData.id].splice(dataIndex, 1);
      saveData();
      handleChangeView({ page: currPage });
    }
  }
});

//lưu lại tùy vào trạng thái edit/add
modalFrame.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (button && button.classList.contains("btn-save")) {
    //nếu class của modalFrame là edit

    //Lấy input
    const product_input = modalFrame.getElementsByClassName("input-control");
    const status_input = modalFrame.getElementsByClassName("status-radio")[0];

    // Lấy đầy đủ các input mới dựa theo thứ tự class "input-control" trên DOM
    const product_input_code = product_input[0]; // input code product
    const product_input_name = product_input[1]; // input name product
    const category_select = product_input[2]; // select danh mục
    const quantity_input = product_input[3]; // input số lượng
    const price_input = product_input[4]; // input giá
    const discount_input = product_input[5]; // input giảm giá
    const image_input = product_input[6]; // input hình ảnh
    const details_input = product_input[7]; // textarea chi tiết sản phẩm

    //sử dụng hàm validate input trước đó để quyết định xem có lưu lại và ẩn/hiện validate hay không
    if (
      !validateInput(
        product_input_code.value,
        product_input_name.value,
        category_select.value,
        image_input.value,
        quantity_input.value,
        price_input.value,
        discount_input.value,
      )
    ) {
      return;
    }

    if (modalFrame.classList.contains("edit-mode")) {
      //sử dụng currEdit và currEditElement để điền
      productsData[currUserData.id][currEditIndex].product_code =
        product_input_code.value;
      productsData[currUserData.id][currEditIndex].product_name =
        product_input_name.value;
      productsData[currUserData.id][currEditIndex].category =
        category_select.value;
      productsData[currUserData.id][currEditIndex].stock = quantity_input.value;
      productsData[currUserData.id][currEditIndex].price = price_input.value;
      productsData[currUserData.id][currEditIndex].discount =
        discount_input.value;
      productsData[currUserData.id][currEditIndex].image = image_input.value;
      productsData[currUserData.id][currEditIndex].details =
        details_input.value;

      currEditElement.querySelector(".product-code").textContent =
        product_input_code.value;
      currEditElement.querySelector(".product-name").textContent =
        product_input_name.value;
      currEditElement.querySelector(".status-display").innerHTML = `
      <td class="status-display">
        <span class="status-badge status-${status_input.checked ? "active" : "inactive"}">
          <span class="dot"></span> ${status_input.checked ? "Đang" : "Không"} hoạt động
        </span>
      </td>
      `;

      if (status_input.checked) {
        productsData[currUserData.id][currEditIndex].status = "ACTIVE";
      } else {
        productsData[currUserData.id][currEditIndex].status = "INACTIVE";
      }
      handleChangeView({ page: currPage });
      addCheckedToast("Thành công", "Đã sửa danh mục thành công");
    } else if (modalFrame.classList.contains("add-mode")) {
      //nếu là addmode

      //gen ra một data mới
      const newProductData = {
        id:
          getHightestID(
            "productsDataHighestData",
            productsData[currUserData.id],
          ) + 1,
        product_name: product_input_name.value,
        product_code: product_input_code.value,
        category: category_select.value,
        stock: quantity_input.value,
        price: price_input.value,
        discount: discount_input.value,
        image: image_input.value,
        details: details_input.value,
        status: `${status_input.checked ? "ACTIVE" : "INACTIVE"}`,
        created_at: getCurrentTime(),
      };
      productsData[currUserData.id].push(newProductData); //thêm vào dữ liệu danh mục hiện tại của người dùng
      handleChangeView({ page: currPage }); //render lại
      addCheckedToast("Thành công", "Đã thêm danh mục thành công");
    }
    modalFrame.classList.add("hide"); //ẩn khi thêm/sửa thành công
    saveData();
  }
});

//xử lý chuyển page
pageButtonTable.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }
  if (button.classList.contains("page-btn")) {
    //nếu người dùng nhấn nút số trang
    const page = Number(button.innerText);
    handleChangeView({
      page: page,
      filter: currFilter,
      sortBy: currCategorySortMode,
    });
  } else if (button.classList.contains("page-btn-prev")) {
    //nếu người dùng nhấn nút quay lại
    const page =
      Number(pageButtonTable.querySelector(".page-btn.active").innerText) - 1;
    handleChangeView({
      page: page,
      filter: currFilter,
      sortBy: currCategorySortMode,
    });
  } else if (button.classList.contains("page-btn-next")) {
    //nếu người dùng nhấn nút tiếp theo
    const page =
      Number(pageButtonTable.querySelector(".page-btn.active").innerText) + 1;
    handleChangeView({
      page: page,
      filter: currFilter,
      sortBy: currCategorySortMode,
    });
  }
});

//Xử lý logout
logoutMenu.addEventListener("click", async (event) => {
  if (
    await confirmPopUp("Xác nhận", "Bạn có muốn đăng xuất không", "Đăng xuất")
  ) {
    //chỉnh phiên đăng nhập về null, tận dụng switchTab để đẩy về login
    currUserData = null;
    delete loginSessionStorage[loginSession]; //xóa phiên đăng nhập trong lưu trữ các phiên đăng nhập
    loginSession = null; // vì loginSession được dùng làm để ghi dữ liệu nên sẽ tận dụng
    saveData();
    switchTab(); //switchTab được tận dụng
  }
});

//xử ký hiển thị logout
buttonUserProfile.addEventListener("click", (event) => {
  if (logoutMenu.classList.contains("hide")) {
    logoutMenu.classList.remove("hide");
  } else {
    logoutMenu.classList.add("hide");
  }
});

//xử lý chuyển filter
filterButton.addEventListener("click", (event) => {
  const value = filterButton.value;
  handleChangeView({ filter: value });
});

//xử lý chuyển sort
sortButton.addEventListener("click", (event) => {
  const value = sortButton.value;
  handleChangeView({ sortBy: value });
});

//xử lý chuyển danh mục
categoryFilterButton.addEventListener("click", (event) => {
  const value = categoryFilterButton.value;
  handleChangeView({ categoriFilter: value });
});

//xử lý tìm kiếm
searchBox.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const value = searchBox.value;
    handleChangeView({ keyword: value });
  }
});

categoryPageButton.addEventListener("click", (event) => {
  switchTab("./category-manager.html");
});

// const getRandomDate = (start, end) => {
//   const date = new Date(
//     start.getTime() + Math.random() * (end.getTime() - start.getTime()),
//   );
//   return date.toISOString().slice(0, 19) + "Z";
// };

// productsData[currUserData.id] = [];

// const categoryList = categoriesData[currUserData.id] || [
//   { category_code: "DM001" },
//   { category_code: "DM002" },
// ];

// for (let i = 1; i <= 100; i++) {
//   const randomCategory =
//     categoryList[Math.floor(Math.random() * categoryList.length)];

//   const newProductData = {
//     id:
//       getHightestID(
//         "productsDataHighestData",
//         productsData[currUserData.id],
//       ) + 1,

//     product_name: "SP_" + Math.floor(Math.random() * 1000),
//     product_code: "CODE_" + Math.floor(Math.random() * 1000),

//     category: randomCategory.category_code,

//     price: Math.floor(Math.random() * 10000000),
//     stock: Math.floor(Math.random() * 100),
//     discount: Math.floor(Math.random() * 50),

//     image: "https://picsum.photos/200?random=" + i,
//     details: "Sản phẩm test " + i,

//     status: Math.random() < 0.5 ? "ACTIVE" : "INACTIVE",

//     created_at: getRandomDate(
//       new Date(2023, 0, 1),
//       new Date(),
//     ),
//   };

//   productsData[currUserData.id].push(newProductData);
// }

// saveData();
// handleChangeView({ page: 1 });
