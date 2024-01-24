'use strict';
const $ = query => document.querySelector(query);

const form = $('#addForm');
const message = $('#displayAlert');
const expenseList = $('#expenses');
const expenseAmt = $('#expenseamt');
const expenseComment = $('#expensedesc');
const expenseType = $('#expensetype');
const expenseCategory = $('#expenseCategory');
const expenseDate = $('#expensedate');
const expensesContainer = $('#expensesCard');
const formContainer = $('#mainCard');
const expenseComFilter = $('#expenseSearch');
const filterByType = $('#filtertype');
const filterByCategory = $('#filterCategory');
const filterCatform = $('#filCategory');
const filterTypeform = $('#filType');
const searchMsgDiv = $('#containerAlert');
const key = 'userData';
const URL = `https://crudcrud.com/api/8f622230647a4825b81deaf31e6b5e47/${key}`;

class CreateState {
  #stateName;
  #id;

  setState(state) {
    this.#stateName = state;
  }
  setId(id) {
    this.#id = id;
  }
  get getState() {
    return this.#stateName;
  }
  get getId() {
    return this.#id;
  }
}
/////////////////////////////////////////Functions////////////////////////////////////////////////
///////////////////////////Utility functions//////////////////////////////
//Helper Obj to manage edit state
const state = new CreateState();

const getRequest = () => axios.get(`${URL}`);

const postRequest = load => axios.post(`${URL}`, load);

const putRequest = (id, load) => axios.put(`${URL}/${id}`, load);

const deleteRequest = id => axios.delete(`${URL}/${id}`);

//reject a network call
const rejectCall = function () {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request took too long')), 10000);
  });
};

// Message
const MESSAGE = function (msg, clremove, cladd, element = message) {
  element.innerHTML = `${msg}`;
  element.classList.remove(clremove);
  element.classList.add(cladd);
  if (element === message) {
    setTimeout(() => {
      element.classList.add(clremove);
      element.classList.remove(cladd);
    }, 2000);
  }
};

//Create local
const createLocal = function (userArr) {
  localStorage.setItem(key, JSON.stringify({ data: userArr }));
};

//acces Local storage
const accessLocal = async keyName => {
  return new Promise(resolve => {
    let localMemory = localStorage.getItem(keyName);
    if (!localMemory) {
      createLocal([]);
      localMemory = localStorage.getItem(keyName);
    }
    resolve(JSON.parse(localMemory));
  });
};

//update LocalStorage
const updateLocal = async function (userObj) {
  try {
    const local = await accessLocal(key);
    const { data } = local;
    data.push(userObj);
    createLocal(data);
  } catch (error) {
    MESSAGE(`${error.message}`, 'd-none', 'alert-danger');
    throw error;
  }
};

//Remove LocalStorage Data
const removeFromLocal = function (li) {
  const filterData = JSON.parse(localStorage.getItem(key)).data.filter(
    data => data._id !== li.id
  );
  createLocal(filterData);
};

//Check for field errors
const util = async function (formData) {
  if (formData.money <= 0) {
    throw new Error('Please enter amount greater than 0');
  } else if (formData.expensecomment === '') {
    throw new Error('Please enter Comment field');
  } else if (formData.expensedate === '') {
    throw new Error('Please select Date');
  }
};

// default form data
const defaultFormData = function (data) {
  expenseAmt.value = data?.money || '';
  expenseComment.value = data?.expensecomment || '';
  expenseType.value = data?.expensetype || 'Card';
  expenseCategory.value = data?.expensecategory || 'Grocery';
  expenseDate.value = data?.expensedate || '';
};

//Container Hide/unhide
const displayContainer = function (task, element = expensesContainer) {
  if (task === 'remove') element.classList.remove('d-none');
  else if (task === 'add') element.classList.add('d-none');
};

// div search message remove
const removeSearchMsg = function (add) {
  searchMsgDiv.classList.add(add);
};

//ShowonUi
const ShowOnUi = function (userData) {
  const li = document.createElement('li');
  li.className = 'list-group-item';
  li.classList.add('mb-2');
  li.classList.add('border-1');
  li.classList.add('border-dark-subtle');
  li.classList.add('rounded');
  li.id = userData._id;
  const [year, month, day] = userData.expensedate.split('-');
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

  li.insertAdjacentHTML('afterbegin', html);
  // Append li to list
  expenseList.appendChild(li);
};

/// Initial for every loading
const init = async function (key) {
  try {
    state.setState('POST');
    const Msg = "you don't have any Data";
    let dataBase = JSON.parse(localStorage.getItem(key));
    if (!dataBase) {
      dataBase = await Promise.race([getRequest(), rejectCall()]);
    }

    if (dataBase?.data.length === 0) {
      throw new Error(Msg);
    } else {
      createLocal(dataBase.data);
      dataBase.data.forEach(item => ShowOnUi(item));
    }
    displayContainer('remove');

    MESSAGE('Database Data are displayed in UI', 'd-none', 'alert-success');
  } catch (error) {
    MESSAGE(error.message, 'd-none', 'alert-danger');
  }
};

//to update UI
const updateUI = function (arr, set) {
  if (!set) {
    arr.forEach(item => item.classList.remove('d-none'));
  } else {
    arr.forEach(item => {
      if (!set.has(item.id)) item.classList.add('d-none');
      else item.classList.remove('d-none');
    });
  }
  displayContainer('remove', expenseList);
  removeSearchMsg('d-none');
};

//Update dataBase
const updateDatabase = async function ({ ...userData }) {
  try {
    await Promise.race([putRequest(state.getId, userData), rejectCall()]);
    userData._id = state.getId;

    updateLocal(userData);
    ShowOnUi(userData);
    if (expensesContainer.childElementCount === 1) displayContainer('remove');

    defaultFormData();
    MESSAGE('Data succesfully in the updated', 'd-none', 'alert-success');
  } catch (error) {
    MESSAGE(
      'Error in updating Data : Please reload Page to get your previous data',
      'd-none',
      'alert-danger'
    );
  }
  defaultFormData();
  state.setState('POST');
  state.setId();
};

//FilteredData
const filterData = function (val, index, totalData) {
  const data = totalData
    .filter(item => [...item.children][index].childNodes[1].textContent === val)
    .map(item => item.id);
  return new Set(data);
};

////////////////////////////////////////CallBack Functions for event callback function ///////////////////////////
// Adding new data
const addNewData = async function (userData) {
  try {
    await util(userData);
    const response = await Promise.race([postRequest(userData), rejectCall()]);
    updateLocal(response.data);
    ShowOnUi(response.data);
    if (expensesContainer.childElementCount === 1) displayContainer('remove');
    defaultFormData();
    MESSAGE('Data succesfully in added', 'd-none', 'alert-success');
  } catch (error) {
    MESSAGE(`${error.message}`, 'd-none', 'alert-danger');
  }
};

// Removing Existing Data
const removeData = async function (li) {
  if (confirm('Are you Sure?')) {
    try {
      await Promise.race([deleteRequest(li.id), rejectCall()]);
      removeFromLocal(li);
      expenseList.removeChild(li);
      if (expenseList.childElementCount === 0) displayContainer('add');
      MESSAGE('Data succesfully deleted', 'd-none', 'alert-success');
    } catch (error) {
      MESSAGE(`${error.message}`, 'd-none', 'alert-danger');
    }
  }
};

//Editing existing Data
const editData = function (li) {
  state.setState('PUT');
  state.setId(li.id);
  removeFromLocal(li);
  expenseList.removeChild(li);
  if (expenseList.childElementCount === 0) displayContainer('add');

  const [date, amt, type, cat, des] = [...li.children];
  const editData = {
    money: amt.childNodes[1].textContent.replaceAll('Rs.', ''),
    expensecomment: des.childNodes[1].textContent,
    expensetype: type.childNodes[1].textContent,
    expensecategory: cat.childNodes[1].textContent,
    expensedate: new Date(`${date.childNodes[1].textContent}"14:48:34 "`)
      .toISOString()
      .slice(0, 10),
  };

  defaultFormData(editData);
  MESSAGE(
    'Your Previous Data will persist in Database untill you again submits',
    'd-none',
    'alert-primary'
  );
};

// Filtering data against comments
const filterComment = function (text) {
  const totalChild = [...expenseList.children];

  const li = totalChild
    .filter(
      item =>
        [...item.children][4].childNodes[1].textContent
          .toLowerCase()
          .trim()
          .indexOf(text) !== -1
    )
    .map(item => item.id);

  const hashSet = new Set(li);

  if (!hashSet.size) {
    4('add', expenseList);
    MESSAGE(`NO MATCHED DATA`, 'd-none', 'alert-info', searchMsgDiv);
  } else updateUI(totalChild, hashSet);
};

//Filter BY Type Data
const filtertypeFun = function (type, cb) {
  const allData = [...expenseList.children];
  if (type === 'All') {
    updateUI(allData);
    return;
  }
  const data = cb(type, 2, allData);
  if (!data.size) {
    displayContainer('add', expenseList);
    MESSAGE(`DATA NOT FOUND`, 'd-none', 'alert-info', searchMsgDiv);
  } else {
    updateUI(allData, data);
  }
};

//Filter BY Category Data
const filterCategoryFun = function (cat, cb) {
  const allData = [...expenseList.children];

  if (cat === 'NoChoice') {
    updateUI(allData);
    return;
  }
  const data = cb(cat, 3, allData);
  if (!data.size) {
    displayContainer('add', expenseList);
    MESSAGE(`DATA NOT FOUND`, 'd-none', 'alert-info', searchMsgDiv);
  } else {
    updateUI(allData, data);
  }
};

////////////////////////////////Event CallBack Function/////////////////////////
// Data adding event Callback
const formSubmit = function (e) {
  try {
    e.preventDefault();
    const userData = {
      money: expenseAmt.value,
      expensecomment: expenseComment.value,
      expensecategory: expenseCategory.value,
      expensedate: expenseDate.value,
      expensetype: expenseType.value,
    };
    if (state.getState === 'POST') addNewData(userData);
    else if (state.getState === 'PUT') updateDatabase(userData);
  } catch (error) {}
};

//Data removing and editing event Callback
const universalBtn = function (e) {
  const li = e.target.parentElement.parentElement;
  if (e.target.classList.contains('delete')) removeData(li);
  else if (e.target.classList.contains('edit')) editData(li);
};

// Data(comment) matches Search
const searchComment = function (e) {
  const val = e.target.value.toLowerCase().trim();
  if (!expenseList.childElementCount) {
    MESSAGE('NO DATA', 'd-none', 'alert-info');
    return;
  }
  filterComment(val);
};

//Data(filterType) matches
const filterType = function (e) {
  filterByCategory.value = 'NoChoice';
  const typeVal = e.target.value;
  filtertypeFun(typeVal, filterData);
};

//Data(filterCategory) matches
const filterCategory = function (e) {
  filterByType.value = 'All';
  const categoryVal = e.target.value;
  filterCategoryFun(categoryVal, filterData);
};

//eventListener
form.addEventListener('submit', formSubmit);
expenseList.addEventListener('click', universalBtn);
window.addEventListener('DOMContentLoaded', init.bind(null, key));
expenseComFilter.addEventListener('keyup', searchComment);
filterByType.addEventListener('change', filterType);
filterByCategory.addEventListener('change', filterCategory);
