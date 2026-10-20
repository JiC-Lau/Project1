// Get the form elements

const expenseForm = document.getElementById("expenseForm");
const expenseDate = document.getElementById("expenseDate");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const expenseDescription = document.getElementById("expenseDescription");


// Get the error message elements

const dateError = document.getElementById("dateError");
const amountError = document.getElementById("amountError");
const categoryError = document.getElementById("categoryError");
const descriptionError = document.getElementById("descriptionError");


// Get the result and summary elements

const formMessage = document.getElementById("formMessage");
const monthFilter = document.getElementById("monthFilter");
const totalSpent = document.getElementById("totalSpent");
const categorySummary = document.getElementById("categorySummary");
const expenseList = document.getElementById("expenseList");
const noExpenses = document.getElementById("noExpenses");


// Load existing expenses from localStorage

const savedExpenses = localStorage.getItem("expenses");

let expenses;

if (savedExpenses) {
    expenses = JSON.parse(savedExpenses);
} else {
    expenses = [];
}


// Set the current date and month

const today = new Date();
const currentDate = today.toISOString().slice(0, 10);
const currentMonth = today.toISOString().slice(0, 7);

expenseDate.value = currentDate;
monthFilter.value = currentMonth;


// Listen for form submission

expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();

    clearErrors();

    const date = expenseDate.value;
    const amount = Number(expenseAmount.value);
    const category = expenseCategory.value;
    const description = expenseDescription.value.trim();

    let isValid = true;


    // Validate date

    if (date === "") {
        dateError.textContent = "Please select a date.";
        expenseDate.classList.add("invalid");
        isValid = false;
    }


    // Validate amount

    if (
        expenseAmount.value.trim() === "" ||
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        amountError.textContent =
            "Please enter an amount greater than €0.";
        expenseAmount.classList.add("invalid");
        isValid = false;
    }


    // Validate category

    if (category === "") {
        categoryError.textContent = "Please select a category.";
        expenseCategory.classList.add("invalid");
        isValid = false;
    }


    // Validate description

    if (description.length > 100) {
        descriptionError.textContent =
            "Description must not exceed 100 characters.";
        expenseDescription.classList.add("invalid");
        isValid = false;
    }


    // Stop if the form is invalid

    if (!isValid) {
        formMessage.textContent =
            "Please correct the highlighted fields.";
        return;
    }


    // Create an expense object

    const expense = {
        id: Date.now(),
        date: date,
        amount: amount,
        category: category,
        description: description
    };


    // Add the expense to the array

    expenses.push(expense);


    // Save the updated expense array

    saveExpenses();


    // Show the month containing the new expense

    monthFilter.value = date.slice(0, 7);


    // Update the displayed information

    displayExpenses();


    // Show confirmation

    formMessage.textContent = "Expense added successfully.";


    // Clear the form

    expenseForm.reset();


    // Restore today's date after resetting the form

    expenseDate.value = currentDate;
});


// Clear previous validation errors

function clearErrors() {
    dateError.textContent = "";
    amountError.textContent = "";
    categoryError.textContent = "";
    descriptionError.textContent = "";
    formMessage.textContent = "";

    expenseDate.classList.remove("invalid");
    expenseAmount.classList.remove("invalid");
    expenseCategory.classList.remove("invalid");
    expenseDescription.classList.remove("invalid");
}


// Save the expenses in localStorage

function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}


// Display expenses for the selected month

function displayExpenses() {
    const selectedMonth = monthFilter.value;

    expenseList.textContent = "";


    // Filter expenses by month

    const filteredExpenses = expenses.filter(function (expense) {
        return expense.date.slice(0, 7) === selectedMonth;
    });


    // Show or hide the empty-list message

    if (filteredExpenses.length === 0) {
        noExpenses.style.display = "block";
    } else {
        noExpenses.style.display = "none";
    }


    // Create a table row for every expense

    filteredExpenses.forEach(function (expense) {
        const row = document.createElement("tr");

        const dateCell = document.createElement("td");
        const categoryCell = document.createElement("td");
        const descriptionCell = document.createElement("td");
        const amountCell = document.createElement("td");
        const actionCell = document.createElement("td");


        // Add expense information

        dateCell.textContent = formatDate(expense.date);
        categoryCell.textContent = expense.category;

        if (expense.description === "") {
            descriptionCell.textContent = "No description";
        } else {
            descriptionCell.textContent = expense.description;
        }

        amountCell.textContent = "€" + expense.amount.toFixed(2);


        // Create the delete button

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete-button");

        deleteButton.addEventListener("click", function () {
            deleteExpense(expense.id);
        });


        // Add the button to the action cell

        actionCell.appendChild(deleteButton);


        // Add the cells to the row

        row.appendChild(dateCell);
        row.appendChild(categoryCell);
        row.appendChild(descriptionCell);
        row.appendChild(amountCell);
        row.appendChild(actionCell);


        // Add the row to the table

        expenseList.appendChild(row);
    });


    // Update the monthly summary

    displaySummary(filteredExpenses);
}


// Display the monthly total and category totals

function displaySummary(filteredExpenses) {
    let monthlyTotal = 0;
    const categoryTotals = {};


    filteredExpenses.forEach(function (expense) {
        monthlyTotal = monthlyTotal + expense.amount;

        if (categoryTotals[expense.category]) {
            categoryTotals[expense.category] =
                categoryTotals[expense.category] + expense.amount;
        } else {
            categoryTotals[expense.category] = expense.amount;
        }
    });


    // Show the total with two decimal places

    totalSpent.textContent = "€" + monthlyTotal.toFixed(2);


    // Remove the previous category summary

    categorySummary.textContent = "";


    // Show a message when the month has no expenses

    if (filteredExpenses.length === 0) {
        const message = document.createElement("p");
        message.textContent = "No expenses recorded for this month.";

        categorySummary.appendChild(message);
        return;
    }


    // Display each category and its total

    for (const category in categoryTotals) {
        const categoryLine = document.createElement("p");

        categoryLine.textContent =
            category +
            ": €" +
            categoryTotals[category].toFixed(2);

        categorySummary.appendChild(categoryLine);
    }
}


// Delete an expense

function deleteExpense(expenseId) {
    expenses = expenses.filter(function (expense) {
        return expense.id !== expenseId;
    });

    saveExpenses();
    displayExpenses();

    formMessage.textContent = "Expense deleted.";
}


// Format date from 2026-10-15 to 15.10.2026

function formatDate(date) {
    const dateParts = date.split("-");

    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];

    return day + "." + month + "." + year;
}


// Update the page when the selected month changes

monthFilter.addEventListener("change", function () {
    displayExpenses();
});


// Display saved expenses when the page opens

displayExpenses();