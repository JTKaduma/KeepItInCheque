const budgetpopup = document.getElementById("budgetpopup");
const closeBtn = document.getElementById("close");
const createBtn = document.getElementById("create");
const popupform = document.getElementById("popupform");
const recurrenceBtn = document.querySelectorAll(".recurrence-btn");
const budgetForm = document.getElementById("budgetForm");
const budgetCollection = document.getElementById("budget-collection");

function show() {
  budgetpopup.style.display = "block";
  setTimeout(() => {
    popupform.classList.add("active");
  }, 50);
}

function hide() {
  popupform.classList.remove("active");
  setTimeout(() => {
    budgetpopup.style.display = "none";
  }, 300);
}
createBtn.addEventListener("click", show);

closeBtn.addEventListener("click", hide);

let selectedRecurrence = null;

recurrenceBtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    recurrenceBtn.forEach((b) => b.classList.remove("rec-active"));

    btn.classList.add("rec-active");

    selectedRecurrence = btn.value;
  });
});

budgetForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let isValid = true;

  [...budgetForm.elements].forEach((input) => {
    if (input.type !== "submit") {
      if (!input.value.trim()) {
        isValid = false;
        input.style.border = "2px solid red";
      } else {
        input.style.border = "2px solid green";
      }
    }
  });

  if (isValid) {
    const formData = new FormData(budgetForm);
    let dataArray = JSON.parse(localStorage.getItem("data")) || [];
    const date = new Date(formData.get("startDate"));
    let budgetData = {
      name: formData.get("budgetName"),
      amount: formData.get("budgetAmount"),
      category: formData.get("budgetCategories"),
      dateStarted: formData.get("startDate"),
      recurrence: selectedRecurrence,
      month: date.getMonth(),
      year: date.getFullYear(),
    };

    const exists = dataArray.some(
      (item) =>
        item.name == budgetData.name &&
        item.dateStarted == budgetData.dateStarted
    );
    if (!exists) {
      dataArray.push(budgetData);
      localStorage.setItem("data", JSON.stringify(dataArray));
    } else {
      console.log("Already created budget!");
    }

    hide();
  } else {
    console.log("Fill all fields");
  }
  getBudgetData();
});

function getBudgetSummary() {
  const budgets = JSON.parse(localStorage.getItem("data")) || [];
  const trn = JSON.parse(localStorage.getItem("trnData")) || [];

  const summaries = budgets.map((budget) => {
    const { category, amount } = budget;

    const matchingTrn = trn.filter((trn) => {
      const trnDate = new Date(trn.date);
      const startDate = new Date(budget.dateStarted);
      const endDate = new Date(startDate);
      if (budget.recurrence === "yearly") {
        endDate.setFullYear(startDate.getFullYear() + 1);
      } else if (budget.recurrence === "monthly") {
        endDate.setMonth(startDate.getMonth() + 1);
      } else if (budget.recurrence === "biweekly") {
        endDate.setDate(startDate.getDate() + 14);
      } else if (budget.recurrence === "weekly") {
        endDate.setDate(startDate.getDate() + 7);
      } else if (budget.recurrence === "daily") {
        endDate.setDate(startDate.getDate() + 1);
      } else {
        endDate = null;
      }

      if (endDate) {
        return (
          trn.type === category && trnDate >= startDate && trnDate <= endDate
        );
      } else {
        return trn.type === category && trnDate >= startDate;
      }
    });

    const spentTrn = matchingTrn.reduce(
      (sum, trn) => sum + Number(trn.amount),
      0
    );

    const remTrn = amount - spentTrn;
    const budgetStatus = remTrn < 0 ? "over" : "under";

    return {
      ...budget,
      spentTrn,
      remTrn,
      budgetStatus,
    };
  });

  return summaries;
}

function getBudgetData() {
  const summaries = getBudgetSummary();
  budgetCollection.textContent = "";
  summaries.forEach((data) => {
    const info = document.createElement("div");
    info.classList.add("budget-summary");
    const startDate = new Date(data.dateStarted);
    const today = new Date();
    const endDate = new Date(startDate);

    if (data.recurrence === "yearly") {
      endDate.setFullYear(startDate.getFullYear() + 1);
    } else if (data.recurrence === "monthly") {
      endDate.setMonth(startDate.getMonth() + 1);
    } else if (data.recurrence === "biweekly") {
      endDate.setDate(startDate.getDate() + 14);
    } else if (data.recurrence === "weekly") {
      endDate.setDate(startDate.getDate() + 7);
    } else if (data.recurrence === "daily") {
      endDate.setDate(startDate.getDate() + 1);
    }

    const timeLeft = endDate - today;
    const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));

    if (daysLeft > 0) {
      if (data.budgetStatus === "over") {
        info.innerHTML = `
    <h3 class="budget-name">${data.name}</h3>
            <p>Budget: ${Number(data.amount).toFixed(2).toLocaleString()}</p>
            <p>Spent: ${Number(data.spentTrn).toFixed(2).toLocaleString()}</p>
            <p>Remaining: ${Number(data.remTrn).toFixed(2).toLocaleString()}</p>
            <p class="over">Status: ${data.budgetStatus}</p>
            <p class="${
              daysLeft < 5 ? "urgent" : ""
            }">Days left: ${daysLeft}</p>
    `;
      } else {
        info.innerHTML = `
    <h3 class="budget-name">${data.name}</h3>
            <p>Budget: ${Number(data.amount).toFixed(2).toLocaleString()}</p>
            <p>Spent: ${Number(data.spentTrn).toFixed(2).toLocaleString()}</p>
            <p>Remaining: ${Number(data.remTrn).toFixed(2).toLocaleString()}</p>
            <p class="under">Status: ${data.budgetStatus}</p>
            <p class="${
              daysLeft < 5 ? "urgent" : ""
            }">Days left: ${daysLeft}</p>
    `;
      }
    }
    budgetCollection.appendChild(info);
  });
}

document.addEventListener("DOMContentLoaded", getBudgetData);
