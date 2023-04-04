"use strict";
const form = document.querySelector("#addForm");
const message = document.querySelector("#displayAlert");
const expenseList = document.querySelector("#expenses");
const expenseAmt = document.querySelector("#expenseamt");
const expenseComment = document.querySelector("#expensedesc");
const expenseType = document.querySelector("#expensetype");
const expenseCategory = document.querySelector("#expenseCategory");
const expenseDate = document.querySelector("#expensedate");
const expensesContainer = document.querySelector("#expensesCard");
const formContainer = document.querySelector("#mainCard");
const expenseComFilter = document.querySelector("#expenseSearch");
const filterByType = document.querySelector("#filtertype");
const filterByCategory = document.querySelector("#filterCategory");
const filterCatform = document.querySelector("#filCategory");
const filterTypeform = document.querySelector("#filType");
const searchMsgDiv = document.querySelector("#containerAlert");

/////////////////////////////////////////Functions////////////////////////////////////////////////
///////////////////////////Utility functions//////////////////////////////
//Helper Obj to manage edit state
const stateObj = {
  stateName: "",
  _id: "",
};

///Set State
const setState = function (state, id = "") {
  stateObj.stateName = state;
  stateObj._id = id;
};

// Message
const errormsg = function (msg, clremove, cladd) {
  message.innerHTML = `${msg}`;
  message.classList.remove(clremove);
  message.classList.add(cladd);
  setTimeout(() => {
    message.classList.add(clremove);
    message.classList.remove(cladd);
  }, 2000);
};

//expenseContainer Hide and unhide
const displayContainer = function (task, element = expensesContainer) {
  if (task === "remove") element.classList.remove("d-none");
  else if (task === "add") element.classList.add("d-none");
};

//Div Search Message display
const searchMessage = function (msg, clremove, cladd) {
  searchMsgDiv.innerHTML = `${msg}`;
  searchMsgDiv.classList.remove(clremove);
  searchMsgDiv.classList.add(cladd);
};

// div search message remove
const removeSearchMsg = function (add) {
  searchMsgDiv.classList.add(add);
};

//Check for field errors
const util = function (formData) {
  if (formData.money <= 0) {
    errormsg("Please enter amount greater than 0", "d-none", "alert-danger");
    return true;
  } else if (formData.expensecomment === "") {
    errormsg("Please enter Comment field", "d-none", "alert-danger");
    return true;
  } else if (formData.expensedate === "") {
    errormsg("Please select Date", "d-none", "alert-danger");
    return true;
  }
};

//ShowonUi
const ShowOnUi = function (userData) {
  const li = document.createElement("li");

  li.className = "list-group-item";
  li.classList.add("mb-2");
  li.classList.add("border-1");
  li.classList.add("border-dark-subtle");
  li.classList.add("rounded");
  li._id = userData._id;
  const [year, month, day] = userData.expensedate.split("-");
  const dateStr = new Date(year, `${month - 1}`, day);

  const html = `
    <div><strong>Expense Date : </strong>${dateStr.toDateString()}</div>
    <div><strong>Expense Amount : </strong>Rs.${userData.money}</div>
    <div><strong>Expense Type : </strong>${userData.expensetype}</div>
    <div><strong>Expense Category : </strong>${userData.expensecategory}</div>
    <div><strong>Expense Description : </strong>${userData.expensecomment}</div>
    <div id="btnGrp" class="d-grid gap-2 mt-2 d-md-flex justify-content-md-end">
      <button class="btn btn-outline-primary edit btn-sm" type="button">Edit</button>
      <button class="btn btn-outline-danger delete btn-sm" type="button">Delete</button>
    </div>
  `;

  li.insertAdjacentHTML("afterbegin", html);
  // Append li to list
  expenseList.appendChild(li);
};

// default form data
const defaultFormData = function (data) {
  expenseAmt.value = data?.money || "";
  expenseComment.value = data?.expensecomment || "";
  expenseType.value = data?.expensetype || "Card";
  expenseCategory.value = data?.expensecategory || "Grocery";
  expenseDate.value = data?.expensedate || "";
};

/// Initial for every loading
const init = function () {
  setState("POST");
  const local = localStorage.getItem("userData");
  if (!local || JSON.parse(local).length === 0) return;

  JSON.parse(local).forEach((item) => ShowOnUi(item));
  displayContainer("remove");
  errormsg("Database  Data are displayed in UI", "d-none", "alert-primary");
};

//to update UI
const updateUI = function (arr, set) {
  if (!set) {
    arr.forEach((item) => item.classList.remove("d-none"));
  } else {
    arr.forEach((item) => {
      if (!set.has(item._id)) item.classList.add("d-none");
      else item.classList.remove("d-none");
    });
  }
  displayContainer("remove", expenseList);
  removeSearchMsg("d-none");
};

//Set localStorage Data
const setLocalStore = function ({ ...data }) {
  data._id = Date.now();
  if (!localStorage.getItem("userData")) {
    localStorage.setItem("userData", JSON.stringify([data]));
  } else {
    const localdata = JSON.parse(localStorage.getItem("userData"));
    localdata.push(data);
    localStorage.setItem("userData", JSON.stringify(localdata));
  }
  ShowOnUi(data);
  if (expensesContainer.childElementCount === 1) displayContainer("remove");
  defaultFormData();
  errormsg("Data Added in Database", "d-none", "alert-primary");
};

//Edit localStorage DAta
const editLocalStorage = function ({ ...data }) {
  data._id = stateObj._id;

  const localData = JSON.parse(localStorage.getItem("userData")).filter(
    (item) => item._id !== data._id
  );
  localData.push(data);

  localStorage.setItem("userData", JSON.stringify(localData));
  ShowOnUi(data);
  defaultFormData();
  setState("POST");
  errormsg("Data updated in the Database", "d-none", "alert-primary");
};

//Remove LocalStorage Data
const removeFromLocal = function (li) {
  const filterData = JSON.parse(localStorage.getItem("userData")).filter(
    (data) => data._id !== li._id
  );
  localStorage.setItem("userData", JSON.stringify(filterData));
  expenseList.removeChild(li);
  if (expenseList.childElementCount === 0) displayContainer("add");
  errormsg("Data Deleted From Database", "d-none", "alert-danger");
};

//FilteredData
const filterData = function (val, index, totalData) {
  const data = totalData
    .filter(
      (item) => [...item.children][index].childNodes[1].textContent === val
    )
    .map((item) => item._id);
  return new Set(data);
};

//////////////////////////CallBack Functions for event callback function ///////////////////////////
// Adding new data
const addNewData = function (userData) {
  if (util(userData)) return;
  setLocalStore(userData);
};

// Removing Existing Data
const removeData = function (li) {
  if (confirm("Are you Sure?")) removeFromLocal(li);
};

//Editing existing Data
const editData = function (li) {
  setState("PUT", li._id);
  expenseList.removeChild(li);
  if (expenseList.childElementCount === 0) displayContainer("add");

  const [date, amt, type, cat, des] = [...li.children];
  const editData = {
    money: amt.childNodes[1].textContent.replaceAll("Rs.", ""),
    expensecomment: des.childNodes[1].textContent,
    expensetype: type.childNodes[1].textContent,
    expensecategory: cat.childNodes[1].textContent,
    expensedate: new Date(`${date.childNodes[1].textContent}"14:48:34 "`)
      .toISOString()
      .slice(0, 10),
  };

  defaultFormData(editData);

  errormsg(
    "Your Previous Data will persist in Database untill you again submits",
    "d-none",
    "alert-primary"
  );
};

// Filtering data against comments
const filterComment = function (text) {
  const totalChild = [...expenseList.children];
  const li = totalChild
    .filter(
      (item) =>
        [...item.children][4].childNodes[1].textContent
          .toLowerCase()
          .trim()
          .indexOf(text) !== -1
    )
    .map((item) => item._id);

  const hashSet = new Set(li);

  if (!hashSet.size) {
    displayContainer("add", expenseList);
    searchMessage(
      `Data with letter "${text}" not exist`,
      "d-none",
      "alert-danger"
    );
  } else updateUI(totalChild, hashSet);
};

//Filter BY Type Data
const filtertypeFun = function (type) {
  const allData = [...expenseList.children];
  if (type === "All") {
    updateUI(allData);
    return;
  }
  const data = filterData(type, 2, allData);
  if (!data.size) {
    displayContainer("add", expenseList);
    searchMessage(`Data with ${type} type not exist`, "d-none", "alert-danger");
  } else {
    updateUI(allData, data);
  }
};

//Filter BY Category Data
const filterCategoryFun = function (cat) {
  const allData = [...expenseList.children];
  if (cat === "NoChoice") {
    updateUI(allData);
    return;
  }
  const data = filterData(cat, 3, allData);
  if (!data.size) {
    displayContainer("add", expenseList);
    searchMessage(
      `Data with ${cat} Category not exist`,
      "d-none",
      "alert-danger"
    );
  } else {
    updateUI(allData, data);
  }
};

////////////////////////////////Event CallBack Function/////////////////////////
// Data adding event Callback
const formSubmit = function (e) {
  e.preventDefault();
  const userData = {
    money: expenseAmt.value,
    expensecomment: expenseComment.value,
    expensecategory: expenseCategory.value,
    expensedate: expenseDate.value,
    expensetype: expenseType.value,
  };
  if (stateObj.stateName === "POST") addNewData(userData);
  else if (stateObj.stateName === "PUT") editLocalStorage(userData);
};

// Data(comment) matches Search
const searchComment = function (e) {
  const val = e.target.value.toLowerCase().trim();
  if (!expenseList.childElementCount) {
    errormsg("You don't have any saved data", "d-none", "alert-danger");
    return;
  }
  filterComment(val);
};

//Data(filterType) matches
const filterType = function (e) {
  filterByCategory.value = "NoChoice";
  const typeVal = e.target.value;
  filtertypeFun(typeVal);
};

//Data(filterCategory) matches
const filterCategory = function (e) {
  filterByType.value = "All";
  const categoryVal = e.target.value;
  filterCategoryFun(categoryVal);
};

//Data removing and editing event Callback
const universalBtn = function (e) {
  const li = e.target.parentElement.parentElement;
  if (e.target.classList.contains("delete")) removeData(li);
  else if (e.target.classList.contains("edit")) editData(li);
};

//eventListener
form.addEventListener("submit", formSubmit);
expenseList.addEventListener("click", universalBtn);
window.addEventListener("DOMContentLoaded", init);
expenseComFilter.addEventListener("keyup", searchComment);
filterByType.addEventListener("change", filterType);
filterByCategory.addEventListener("change", filterCategory);
