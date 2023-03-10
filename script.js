const form = document.querySelector("#addForm");
const expenses = document.getElementById("expenses");
const expenseList = document.getElementById("expenses");
const msg = document.querySelector(".msg");
const expenseAmt = document.getElementById("expenamt");
const expenseDes = document.getElementById("expendesc");
const expenseCat = document.getElementById("cate");
let arr = [];

getLocalStorage();

// Form submit event
form.addEventListener("submit", addItem);
// Delete event
expenseList.addEventListener("click", removeItem);
expenseList.addEventListener("click", editItem);

function addItem(e) {
  e.preventDefault();
  let expenseid = Date.now();
  if (expenseAmt.value <= 0 || expenseDes.value === "") {
    msg.classList.add("error");
    msg.innerHTML = "Please enter description field and Amount greater than 0";
    setTimeout(() => msg.remove(), 3000);
  } else {
    const li = document.createElement("li");
    // Add class
    li.className = "list-group-item";
    li.id = `${expenseid}`;
    // Add text node with input value
    li.appendChild(document.createTextNode("Rs." + expenseAmt.value));
    li.appendChild(document.createTextNode(" " + ": "));
    li.appendChild(document.createTextNode(expenseDes.value + " : "));
    li.appendChild(document.createTextNode(expenseCat.value));
    // Create del button element
    const deleteBtn = document.createElement("button");

    // Add classes to del button
    deleteBtn.className = "btn btn-danger btn-sm float-right delete";

    // Append text node
    deleteBtn.appendChild(document.createTextNode("Delete "));

    // Append button to li
    li.appendChild(deleteBtn);

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-primary btn-sm float-right edit";
    editBtn.appendChild(document.createTextNode("Edit"));

    //Append edit button to li
    li.appendChild(editBtn);
    // Append li to list
    expenses.appendChild(li);

    arr.push({
      id: expenseid,
      expenseAmt: expenseAmt.value,
      expenseDescription: expenseDes.value,
      expenseType: expenseCat.value,
    });
    localStorage.setItem("expenses", JSON.stringify(arr));
    expenseAmt.value = "";
    expenseDes.value = "";
    expenseCat.value = "fuel";
  }
}

// Remove item
function removeItem(e) {
  if (e.target.classList.contains("delete")) {
    if (confirm("Are You Sure?")) {
      const li = e.target.parentElement;
      const identity = li.id;
      expenseList.removeChild(li);

      const newData = JSON.parse(localStorage.getItem("expenses")).filter(
        (data) => data.id != identity
      );

      localStorage.setItem("expenses", JSON.stringify(newData));
    }
  }
}

function editItem(e) {
  if (e.target.classList.contains("edit")) {
    const li = e.target.parentElement;
    const identity = li.id;
    expenseList.removeChild(li);

    const newData = JSON.parse(localStorage.getItem("expenses")).filter(
      (data) => data.id != identity
    );

    localStorage.setItem("expenses", JSON.stringify(newData));

    localStorage.setItem("expenses", JSON.stringify(newData));
    expenseAmt.value = e.target.parentElement.childNodes[0].data.replace(
      "Rs.",
      ""
    );
    expenseDes.value = e.target.parentElement.childNodes[2].data.replace(
      ":",
      ""
    );
    expenseCat.value = e.target.parentElement.childNodes[3].data;
  }
}

function getLocalStorage() {
  const data = JSON.parse(localStorage.getItem("expenses"));

  if (!data) return;
  arr = data;
  arr.forEach((obj) => {
    const li = document.createElement("li");
    // Add class
    li.className = "list-group-item";
    li.id = obj.id;
    // Add text node with input value
    li.appendChild(document.createTextNode("Rs." + obj.expenseAmt));
    li.appendChild(document.createTextNode(" " + ": "));
    li.appendChild(document.createTextNode(obj.expenseDescription + " : "));
    li.appendChild(document.createTextNode(obj.expenseType));
    // Create del button element
    const deleteBtn = document.createElement("button");

    // Add classes to del button
    deleteBtn.className = "btn btn-danger btn-sm float-right delete";

    // Append text node
    deleteBtn.appendChild(document.createTextNode("Delete "));

    // Append button to li
    li.appendChild(deleteBtn);

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-primary btn-sm float-right edit";
    editBtn.appendChild(document.createTextNode("Edit"));

    //Append edit button to li
    li.appendChild(editBtn);
    // Append li to list
    expenses.appendChild(li);
  });
}
