const form = document.querySelector("#addForm");
const message = document.querySelector("#displayAlert");
const expenses = document.querySelector("#expenses");
const expenseList = document.querySelector("#expenses");
const expenseAmt = document.querySelector("#expenseamt");
const expenseDes = document.querySelector("#expensedesc");
const expenseCat = document.querySelector("#expensetype");
const expensesContainer = document.querySelector("#expensesCard");
const formContainer = document.querySelector("#mainCard");
const expenseFilter = document.querySelector("#expenseSearch");

//Helper Class to manage edit state
class State {
  static state = "";
  static userID = "";

  static stateUpdate(key) {
    State.state = key;
  }

  static userIDUpdate(id) {
    State.userID = id;
  }
}

//Functions
////Helper functions
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

///Access Localstore
const storeData = function (obj) {
  const localData = JSON.parse(localStorage.getItem("expenses"));
  localData.push(obj);
  localStorage.setItem("expenses", JSON.stringify(localData));
};

//ShowonUi
const ShowOnUi = function (obj) {
  const li = document.createElement("li");
  li.id = obj.id;
  // Add class
  li.className = "list-group-item";
  li.appendChild(document.createTextNode("Rs." + obj.money));
  li.appendChild(document.createTextNode(" " + ": "));
  li.appendChild(document.createTextNode(obj.expDescription + " : "));
  li.appendChild(document.createTextNode(obj.expType));

  //delbutton element
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn btn-outline-danger btn-sm float-end delete";
  deleteBtn.appendChild(document.createTextNode("Delete"));
  li.appendChild(deleteBtn);
  //editbutton element
  const editBtn = document.createElement("button");
  editBtn.className = "btn btn-outline-primary btn-sm  float-end edit me-1";
  editBtn.appendChild(document.createTextNode("Edit"));
  li.appendChild(editBtn);

  // Append li to list
  expenses.appendChild(li);
};

//localStorage set
const initialised = function () {
  State.stateUpdate("POST");
  if (!localStorage.getItem("expenses"))
    localStorage.setItem("expenses", JSON.stringify([]));
  else {
    const localData = JSON.parse(localStorage.getItem("expenses"));
    if (!localData.length) return;

    localData.forEach((item) => {
      ShowOnUi(item);
    });
    expensesContainer.classList.remove("d-none");
    errormsg("Your Data displayed in UI", "d-none", "alert-primary");
  }
};

//Delete from localStorage
const deleteFromLocal = function (id) {
  const updatedData = JSON.parse(localStorage.getItem("expenses")).filter(
    (item) => item.id != id
  );
  localStorage.setItem("expenses", JSON.stringify(updatedData));
};

//Utility
const util = function (obj) {
  if (obj.money <= 0) {
    errormsg("Please enter amount greater than 0", "d-none", "alert-danger");
    return true;
  } else if (obj.expDescription === "") {
    errormsg("Please enter description field", "d-none", "alert-danger");
    return true;
  }
};

// Adding new Data
const newData = function (obj) {
  if (util(obj)) return;

  ShowOnUi(obj);

  if (expenses.childElementCount === 1) {
    expensesContainer.classList.remove("d-none");
  }

  // store in local storage
  storeData(obj);

  expenseAmt.value = "";
  expenseDes.value = "";
  expenseCat.value = "fuel";

  //Alert
  errormsg("Your Expense added successfully", "d-none", "alert-success");
};

//updating edited data
const updateEditedData = function (obj) {
  if (util(obj)) return;

  async function asyncCall() {
    const editData = JSON.parse(localStorage.getItem("expenses"));
    for (const item of editData) {
      if (item.id == obj.id) {
        item.money = obj.money;
        item.expDescription = obj.expDescription;
        item.expType = obj.expType;
      }
    }

    localStorage.setItem("expenses", JSON.stringify(editData));

    ShowOnUi(obj);

    if (expenses.childElementCount === 1) {
      expensesContainer.classList.remove("d-none");
    }

    expenseAmt.value = "";
    expenseDes.value = "";
    expenseCat.value = "fuel";

    //Alert
    errormsg("Your Response Updated Successfully", "d-none", "alert-success");
    State.stateUpdate("POST");
    State.userIDUpdate("");
  }
  asyncCall();
};

///Callback Functions
//Add Expense
const onSubmit = function (e) {
  e.preventDefault();

  const userData = {
    id: State.state === "POST" ? Date.now() : State.userID,
    money: expenseAmt.value,
    expDescription: expenseDes.value,
    expType: expenseCat.value,
  };

  if (State.state === "POST") newData(userData);
  else if (State.state === "PUT") updateEditedData(userData);
};

// Remove Expense
const removeItem = function (e) {
  if (e.target.classList.contains("delete")) {
    if (confirm("Are You Sure?")) {
      const li = e.target.parentElement;
      expenseList.removeChild(li);
      if (expenses.childElementCount === 0) {
        expensesContainer.classList.add("d-none");
      }
      //Deleting data from local
      deleteFromLocal(li.id);
    }
  }
};

//Edit Expense
const editItem = function (e) {
  if (e.target.classList.contains("edit")) {
    State.stateUpdate("PUT");

    const li = e.target.parentElement;
    const editData = {
      id: li.id,
      money: e.target.parentElement.childNodes[0].data.replace("Rs.", ""),
      expDescription: e.target.parentElement.childNodes[2].data.replace(
        ":",
        ""
      ),
      expType: e.target.parentElement.childNodes[3].data,
    };

    expenseList.removeChild(li);

    if (expenses.childElementCount === 0) {
      expensesContainer.classList.add("d-none");
    }

    expenseAmt.value = editData.money;
    expenseDes.value = editData.expDescription;
    expenseCat.value = editData.expType;

    //update state storage
    State.userIDUpdate(editData.id);
  }
};

// search Expense
const searchExpense = function (e) {
  const text = e.target.value.toLowerCase().trim();

  if (!expenses.childElementCount) {
    return;
  }

  const items = [...expenseList.childNodes];

  const data = items.filter(
    (item) => item.childNodes[3].data.trim().toLowerCase().indexOf(text) !== -1
  );

  if (data.length === 0) expensesContainer.classList.add("d-none");
  else expensesContainer.classList.remove("d-none");

  items.forEach((item) => {
    const itemVal = item.childNodes[3].data.trim();
    if (itemVal.toLowerCase().indexOf(text) == -1) item.classList.add("d-none");
    else item.classList.remove("d-none");
  });
};

//event Handlers
form.addEventListener("submit", onSubmit);
expenseList.addEventListener("click", removeItem);
expenseList.addEventListener("click", editItem);
expenseFilter.addEventListener("keyup", searchExpense);
window.addEventListener("DOMContentLoaded", initialised);
