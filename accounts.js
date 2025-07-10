const budgetpopup = document.getElementById("budgetpopup");
const closeBtn = document.getElementById("close");
const createBtn = document.getElementById("add-transcation");
const popupform = document.getElementById("popupform");
const trnForm = document.getElementById("transactionForm");
const formCategory = document.getElementById("category");
const incomeCategory = document.getElementById("incomeCategory");
const expenseCategory = document.getElementById("expenseCategory");
const accountDiv = document.getElementById("accountInfo");

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

formCategory.addEventListener("change", () => {
  if (formCategory.value == "Income") {
    incomeCategory.style.display = "block";
    expenseCategory.style.display = "none";
  } else {
    incomeCategory.style.display = "none";
    expenseCategory.style.display = "block";
  }
});

trnForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(trnForm);
  const formCategory = formData.get("Category");
  const formType =
    formCategory === "Income"
      ? formData.get("incomeType")
      : formData.get("expenseType");
  const formDate = formData.get("date");
  const formAmount = formData.get("amount");

  const trnData = {
    category: formCategory,
    type: formType,
    date: formDate,
    amount: formAmount,
  };

  const dataArray = JSON.parse(localStorage.getItem("trnData")) || [];

  dataArray.push(trnData);

  localStorage.setItem("trnData", JSON.stringify(dataArray));
  getTransaction();
});

function getTransaction() {
  const trnArray = JSON.parse(localStorage.getItem("trnData")) || [];
  trnArray.sort((a, b) => new Date(b.date) - new Date(a.date));
  let currentBalances = [];
  const groupedTrnArray = trnArray.reduce((acc, trn) => {
    const date = trn.date;

    if (!acc[date]) {
      acc[date] = [];
    }

    acc[date].push(trn);
    return acc;
  }, {});
  accountDiv.textContent = "";
  Object.entries(groupedTrnArray).forEach(([date, transactions]) => {
    const trnHead = document.createElement("p");
    trnHead.classList.add("date-account-row");
    const trnMain = document.createElement("div");
    const options = { year: "numeric", month: "short", day: "2-digit" };
    let total = 0;
    transactions.forEach((trnData) => {
      if (trnData.category === "Income") {
        total += Number(trnData.amount);
      } else {
        total -= Number(trnData.amount);
      }
    });
    const currentBalance = { date, balance: total };
    let dateHead = new Date(date).toLocaleDateString("en-US", options);
    if (total > 0) {
      trnHead.innerHTML = `<span class="date-heading">${dateHead}</span
            ><span class="amount-heading">+${Number(total)
              .toFixed(2)
              .toLocaleString()} NGN</span>`;
    } else {
      trnHead.innerHTML = `<span class="date-heading">${dateHead}</span
            ><span class="amount-heading">${Number(total)
              .toFixed(2)
              .toLocaleString()} NGN</span>`;
    }
    trnMain.append(trnHead);
    currentBalances.push(currentBalance);
    localStorage.setItem("DailyBalances", JSON.stringify(currentBalances));

    transactions.forEach((trnData) => {
      const trnLine = document.createElement("p");
      trnLine.classList.add("date-account-row");
      if (trnData.category === "Income") {
        trnLine.innerHTML = `
              <span>${trnData.type}</span>
              <span class="income">+${Number(trnData.amount)
                .toFixed(2)
                .toLocaleString()}NGN</span>
              `;
        trnMain.append(trnLine);
      } else {
        trnLine.innerHTML = `
              <span>${trnData.type}</span>
              <span class="expense">-${Number(trnData.amount)
                .toFixed(2)
                .toLocaleString()}NGN</span>
              `;
        trnMain.append(trnLine);
      }
    });
    accountDiv.append(trnMain);
  });
}

document.addEventListener("DOMContentLoaded", getTransaction());
