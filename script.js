"use strict";
const $ = (query) => document.querySelector(query);

const form = $("#addForm");
const message = $("#displayAlert");
const expenseList = $("#expenses");
const expenseAmt = $("#expenseamt");
const expenseComment = $("#expensedesc");
const expenseType = $("#expensetype");
const expenseCategory = $("#expenseCategory");
const expenseDate = $("#expensedate");
const expensesContainer = $("#expensesCard");
const formContainer = $("#mainCard");
const expenseComFilter = $("#expenseSearch");
const filterByType = $("#filtertype");
const filterByCategory = $("#filterCategory");
const filterCatform = $("#filCategory");
const filterTypeform = $("#filType");
const searchMsgDiv = $("#containerAlert");
const key = "userData";
const URL = `https://crudcrud.com/api/e9e88ab4fb63471098dc7e76764f906f/${key}`;
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

//Get request
const getRequest = () => axios.get(`${URL}`);

//POST request
const postRequest = (load) => axios.post(`${URL}`, load);

//PUT request
const putRequest = (id, load) => axios.put(`${URL}/${id}`, load);

//Delete request
const deleteRequest = (id) => axios.delete(`${URL}/${id}`);

//Create local
const createLocal = function (userArr) {
  localStorage.setItem(key, JSON.stringify({ data: userArr }));
};

//acces Local storage
const accessLocal = (keyName) => {
  return new Promise((resolve) => {
    const localMemory = localStorage.getItem(keyName);
    if (!localMemory) resolve(null);
    else resolve(JSON.parse(localMemory));
  });
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
const init = async function (key) {
  setState("POST");
  try {
    const Msg = "you don't have any save data";
    const local = await accessLocal(key);
    if (local) {
      if (local.data.length === 0) throw new Error(Msg);
      else {
        local.data.forEach((item) => ShowOnUi(item));
      }
    } else {
      const dataBase = await getRequest();
      if (dataBase.data.length === 0) {
        createLocal(dataBase.data);
        throw new Error(Msg);
      } else {
        createLocal(dataBase.data);
        dataBase.data.forEach((item) => ShowOnUi(item));
      }
    }
    displayContainer("remove");
    errormsg("Database Data are displayed in UI", "d-none", "alert-primary");
  } catch (error) {
    errormsg(error, "d-none", "alert-danger");
  }
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

//update LocalStorage
const updateLocal = function (userObj) {
  const { data } = JSON.parse(localStorage.getItem(key));
  data.push(userObj);
  createLocal(data);
  ShowOnUi(userObj);
  if (expensesContainer.childElementCount === 1) displayContainer("remove");
  defaultFormData();
  errormsg("Data Added in Database", "d-none", "alert-primary");
};

//Edit localStorage DAta
const editLocalStorage = function (userdata) {
  const localData = JSON.parse(localStorage.getItem(key)).data.filter(
    (item) => item._id !== userdata._id
  );
  localData.push(userdata);
  createLocal(localData);
};

//Update dataBase
const updateDatabase = async function ({ ...userData }) {
  try {
    await putRequest(stateObj._id, userData);
    userData._id = stateObj._id;
    editLocalStorage(userData);
    ShowOnUi(userData);
    if (expensesContainer.childElementCount === 1) displayContainer("remove");
    defaultFormData();
    setState("POST");
    errormsg("Data updated in the Database", "d-none", "alert-primary");
  } catch (error) {
    setState("POST");
    errormsg(
      "Error in updating Data : Please reload Page to get your previous data",
      "d-none",
      "alert-danger"
    );
    defaultFormData();
  }
};

//Remove LocalStorage Data
const removeFromLocal = function (li) {
  const filterData = JSON.parse(localStorage.getItem(key)).data.filter(
    (data) => data._id !== li._id
  );
  createLocal(filterData);
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
const addNewData = async function (userData) {
  if (util(userData)) return;
  try {
    const response = await postRequest(userData);
    updateLocal(response.data);
  } catch (error) {
    errormsg("Error: Your data is not added", "d-none", "alert-danger");
  }
};

// Removing Existing Data
const removeData = async function (li) {
  if (confirm("Are you Sure?")) {
    try {
      await deleteRequest(li._id);
      removeFromLocal(li);
      expenseList.removeChild(li);
      if (expenseList.childElementCount === 0) displayContainer("add");
      errormsg("Data Deleted From Database", "d-none", "alert-danger");
    } catch (error) {
      errormsg("Error: Data not deleted", "d-none", "alert-primary");
    }
  }
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
  else if (stateObj.stateName === "PUT") updateDatabase(userData);
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
window.addEventListener("DOMContentLoaded", init.bind(undefined, key));
expenseComFilter.addEventListener("keyup", searchComment);
filterByType.addEventListener("change", filterType);
filterByCategory.addEventListener("change", filterCategory);
