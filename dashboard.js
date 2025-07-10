const currentMonth = document.getElementById("currentMonth");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const totalBalanceDisplay = document.getElementById("total-balance");
const totalPeriodExpenseDisplay = document.getElementById(
  "total-period-expense"
);
const totalPeriodIncomeDisplay = document.getElementById("total-period-income");

let currentDate = new Date();

function getMonthlyBalances(month, year) {
  const trnArray = JSON.parse(localStorage.getItem("trnData"));
  const monthlyTransactions = trnArray.filter((trn) => {
    const trnDate = new Date(trn.date);

    return trnDate.getMonth() === month && trnDate.getFullYear() === year;
  });

  const income = monthlyTransactions
    .filter((trn) => trn.category === "Income")
    .reduce((sum, trn) => sum + Number(trn.amount), 0);

  const expense = monthlyTransactions
    .filter((trn) => trn.category === "Expenses")
    .reduce((sum, trn) => sum + Number(trn.amount), 0);

  return {
    income,
    expense,
    balance: income - expense,
    transactions: monthlyTransactions,
  };
}

function updateMonthlyDisplay() {
  const options = { year: "numeric", month: "short" };
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  currentMonth.textContent = currentDate.toLocaleDateString("en-US", options);

  const { income, expense, balance } = getMonthlyBalances(month, year);

  totalBalanceDisplay.textContent = balance.toLocaleString();
  totalPeriodExpenseDisplay.textContent = Number(expense).toLocaleString();
  totalPeriodIncomeDisplay.textContent = Number(income).toLocaleString();
}

prevBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  updateMonthlyDisplay();
});

nextBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  updateMonthlyDisplay();
});

document.addEventListener("DOMContentLoaded", updateMonthlyDisplay);
