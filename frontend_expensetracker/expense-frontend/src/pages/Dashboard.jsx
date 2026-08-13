import React, { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import "./Dashboard.css";

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear()
  );

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/pjsofttech/expense/expenses"
      );

      console.log("Dashboard expenses:", response.data);

      setExpenses(response.data || []);

    } catch (error) {
      console.error(
        "Error loading dashboard:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const getAmount = (expense) => {
    return Number(expense.total ?? expense.amount ?? 0);
  };

  const getDate = (expense) => {
    if (!expense.date) return null;

    const date = new Date(expense.date);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  };

  const isIncome = (expense) => {
    return expense.type === "INCOME";
  };

  const isExpense = (expense) => {
    return expense.type === "EXPENSE";
  };

  const today = new Date();

  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const startOf7Days = new Date(startOfToday);
  startOf7Days.setDate(
    startOf7Days.getDate() - 6
  );

  const startOf30Days = new Date(startOfToday);
  startOf30Days.setDate(
    startOf30Days.getDate() - 29
  );

  const startOf365Days = new Date(startOfToday);
  startOf365Days.setDate(
    startOf365Days.getDate() - 364
  );

  const isBetween = (date, startDate) => {
    if (!date) return false;

    return (
      date >= startDate &&
      date <= today
    );
  };

  // --------------------------------------------------
  // CALCULATE PERIOD TOTAL
  // --------------------------------------------------

  const calculateIncome = (
    startDate = null,
    endDate = null
  ) => {
    return expenses
      .filter((item) => {
        if (!isIncome(item)) {
          return false;
        }

        const date = getDate(item);

        if (!date) {
          return false;
        }

        if (startDate && date < startDate) {
          return false;
        }

        if (endDate && date > endDate) {
          return false;
        }

        return true;
      })
      .reduce(
        (sum, item) =>
          sum + getAmount(item),
        0
      );
  };

  const calculateExpense = (
    startDate = null,
    endDate = null
  ) => {
    return expenses
      .filter((item) => {
        if (!isExpense(item)) {
          return false;
        }

        const date = getDate(item);

        if (!date) {
          return false;
        }

        if (startDate && date < startDate) {
          return false;
        }

        if (endDate && date > endDate) {
          return false;
        }

        return true;
      })
      .reduce(
        (sum, item) =>
          sum + getAmount(item),
        0
      );
  };

  // --------------------------------------------------
  // CARD VALUES
  // --------------------------------------------------

  const dashboardData = useMemo(() => {

    const incomeToday =
      calculateIncome(startOfToday);

    const income7Days =
      calculateIncome(startOf7Days);

    const income30Days =
      calculateIncome(startOf30Days);

    const income365Days =
      calculateIncome(startOf365Days);

    const incomeTotal =
      calculateIncome();

    const expenseToday =
      calculateExpense(startOfToday);

    const expense7Days =
      calculateExpense(startOf7Days);

    const expense30Days =
      calculateExpense(startOf30Days);

    const expense365Days =
      calculateExpense(startOf365Days);

    const expenseTotal =
      calculateExpense();

    return {
      income: {
        today: incomeToday,
        sevenDays: income7Days,
        thirtyDays: income30Days,
        threeHundredSixtyFiveDays:
          income365Days,
        total: incomeTotal
      },

      expense: {
        today: expenseToday,
        sevenDays: expense7Days,
        thirtyDays: expense30Days,
        threeHundredSixtyFiveDays:
          expense365Days,
        total: expenseTotal
      },

      savings: {
        today:
          incomeToday -
          expenseToday,

        sevenDays:
          income7Days -
          expense7Days,

        thirtyDays:
          income30Days -
          expense30Days,

        threeHundredSixtyFiveDays:
          income365Days -
          expense365Days,

        total:
          incomeTotal -
          expenseTotal
      }
    };

  }, [expenses]);

  // --------------------------------------------------
  // PENDING
  // --------------------------------------------------

  const pendingIncome = useMemo(() => {

    return expenses
      .filter(item =>
        item.type === "INCOME"
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.pending || 0),
        0
      );

  }, [expenses]);

  const pendingExpense = useMemo(() => {

    return expenses
      .filter(item =>
        item.type === "EXPENSE"
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.pending || 0),
        0
      );

  }, [expenses]);

  // --------------------------------------------------
  // MONTHLY DATA
  // --------------------------------------------------

  const monthlyData = useMemo(() => {

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];

    return months.map((month, index) => {

      let income = 0;
      let expense = 0;

      expenses.forEach((item) => {

        const date = getDate(item);

        if (!date) return;

        if (
          date.getFullYear() !==
          Number(selectedYear)
        ) {
          return;
        }

        if (
          date.getMonth() !== index
        ) {
          return;
        }

        const amount = getAmount(item);

        if (item.type === "INCOME") {
          income += amount;
        }

        if (item.type === "EXPENSE") {
          expense += amount;
        }

      });

      return {
        month,
        income,
        expense,
        saving: income - expense
      };
    });

  }, [expenses, selectedYear]);

  // --------------------------------------------------
  // FORMAT MONEY
  // --------------------------------------------------

  const formatAmount = (amount) => {

    const value = Number(amount || 0);

    return value.toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 0
      }
    );
  };

  // --------------------------------------------------
  // CHART MAX VALUE
  // --------------------------------------------------

  const chartMax = useMemo(() => {

    const values = monthlyData.flatMap(
      item => [
        Math.abs(item.income),
        Math.abs(item.expense),
        Math.abs(item.saving)
      ]
    );

    const max =
      Math.max(...values, 1);

    return max;

  }, [monthlyData]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* ============================= */}
      {/* TOP CARDS */}
      {/* ============================= */}

      <div className="dashboard-cards">

        {/* INCOME */}

        <div className="dashboard-card income-card">

          <div className="card-top">

            <div>
              <h3>INCOME</h3>
            </div>

            <div className="card-icon">
              ₹
            </div>

          </div>

          <div className="card-row">
            <span>Today's</span>
            <strong>
              ₹{formatAmount(
                dashboardData.income.today
              )}
            </strong>
          </div>

          <div className="card-row">
            <span>7 Day's</span>
            <strong>
              ₹{formatAmount(
                dashboardData.income.sevenDays
              )}
            </strong>
          </div>

          <div className="card-row">
            <span>30 Day's</span>
            <strong>
              ₹{formatAmount(
                dashboardData.income.thirtyDays
              )}
            </strong>
          </div>

          <div className="card-row">
            <span>365 Day's</span>
            <strong>
              ₹{formatAmount(
                dashboardData
                  .income
                  .threeHundredSixtyFiveDays
              )}
            </strong>
          </div>

          <div className="card-row total-row">
            <span>Total</span>
            <strong>
              ₹{formatAmount(
                dashboardData.income.total
              )}
            </strong>
          </div>

        </div>


        {/* EXPENSE */}

        <div className="dashboard-card expense-card">

          <div className="card-top">

            <div>
              <h3>EXPENSE</h3>
            </div>

            <div className="card-icon">
              ₹
            </div>

          </div>

          <div className="card-row">
            <span>Today's</span>
            <strong>
              ₹{formatAmount(
                dashboardData.expense.today
              )}
            </strong>
          </div>

          <div className="card-row">
            <span>7 Day's</span>
            <strong>
              ₹{formatAmount(
                dashboardData.expense.sevenDays
              )}
            </strong>
          </div>

          <div className="card-row">
            <span>30 Day's</span>
            <strong>
              ₹{formatAmount(
                dashboardData.expense.thirtyDays
              )}
            </strong>
          </div>

          <div className="card-row">
            <span>365 Day's</span>
            <strong>
              ₹{formatAmount(
                dashboardData
                  .expense
                  .threeHundredSixtyFiveDays
              )}
            </strong>
          </div>

          <div className="card-row total-row">
            <span>Total</span>
            <strong>
              ₹{formatAmount(
                dashboardData.expense.total
              )}
            </strong>
          </div>

        </div>


        {/* SAVINGS / LOSS */}

        <div className="dashboard-card savings-card">

          <div className="card-top">

            <div>
              <h3>SAVINGS / LOSS</h3>
            </div>

            <div className="card-icon">
              ₹
            </div>

          </div>

          <div className="card-row">
            <span>Today's</span>

            <strong
              className={
                dashboardData.savings.today >= 0
                  ? "positive"
                  : "negative"
              }
            >
              ₹{formatAmount(
                dashboardData.savings.today
              )}
            </strong>
          </div>

          <div className="card-row">
            <span>7 Day's</span>

            <strong
              className={
                dashboardData.savings.sevenDays >= 0
                  ? "positive"
                  : "negative"
              }
            >
              ₹{formatAmount(
                dashboardData.savings.sevenDays
              )}
            </strong>
          </div>

          <div className="card-row">
            <span>30 Day's</span>

            <strong
              className={
                dashboardData.savings.thirtyDays >= 0
                  ? "positive"
                  : "negative"
              }
            >
              ₹{formatAmount(
                dashboardData.savings.thirtyDays
              )}
            </strong>
          </div>

          <div className="card-row">
            <span>365 Day's</span>

            <strong
              className={
                dashboardData.savings
                  .threeHundredSixtyFiveDays >= 0
                  ? "positive"
                  : "negative"
              }
            >
              ₹{formatAmount(
                dashboardData
                  .savings
                  .threeHundredSixtyFiveDays
              )}
            </strong>
          </div>

          <div className="card-row total-row">
            <span>Total</span>

            <strong
              className={
                dashboardData.savings.total >= 0
                  ? "positive"
                  : "negative"
              }
            >
              ₹{formatAmount(
                dashboardData.savings.total
              )}
            </strong>
          </div>

        </div>


        {/* PENDING INCOME */}

        <div className="dashboard-card pending-income-card">

          <div className="card-top">

            <h3>PENDING INCOME</h3>

            <div className="card-icon">
              ₹
            </div>

          </div>

          <div className="pending-main">
            ₹{formatAmount(pendingIncome)}
          </div>

          <p>
            Amount to be received
          </p>

        </div>


        {/* PENDING EXPENSE */}

        <div className="dashboard-card pending-expense-card">

          <div className="card-top">

            <h3>PENDING EXPENSE</h3>

            <div className="card-icon">
              ₹
            </div>

          </div>

          <div className="pending-main">
            ₹{formatAmount(pendingExpense)}
          </div>

          <p>
            Amount to be paid
          </p>

        </div>

      </div>


      {/* ============================= */}
      {/* CHARTS */}
      {/* ============================= */}

      <div className="dashboard-chart-grid">

        {/* BAR CHART */}

        <div className="chart-card">

          <div className="chart-title">
            Income, Expense & Savings/Loss Comparison
          </div>

          <div className="chart-legend">

            <span>
              <i className="legend income"></i>
              Income
            </span>

            <span>
              <i className="legend expense"></i>
              Expense
            </span>

            <span>
              <i className="legend saving"></i>
              Saving
            </span>

            <span>
              <i className="legend loss"></i>
              Loss
            </span>

          </div>

          <div className="bar-chart">

            {monthlyData.map((item) => (

              <div
                className="bar-group"
                key={item.month}
              >

                <div className="bars">

                  <div
                    className="bar income-bar"
                    style={{
                      height: `${Math.max(
                        (item.income /
                          chartMax) *
                        100,
                        item.income > 0
                          ? 3
                          : 0
                      )}%`
                    }}
                    title={`Income ₹${formatAmount(
                      item.income
                    )}`}
                  />

                  <div
                    className="bar expense-bar"
                    style={{
                      height: `${Math.max(
                        (item.expense /
                          chartMax) *
                        100,
                        item.expense > 0
                          ? 3
                          : 0
                      )}%`
                    }}
                    title={`Expense ₹${formatAmount(
                      item.expense
                    )}`}
                  />

                  <div
                    className={
                      `bar ${item.saving >= 0
                        ? "saving-bar"
                        : "loss-bar"
                      }`
                    }
                    style={{
                      height: `${Math.max(
                        Math.abs(
                          item.saving
                        ) /
                        chartMax *
                        100,
                        item.saving !== 0
                          ? 3
                          : 0
                      )}%`
                    }}
                    title={`Saving/Loss ₹${formatAmount(
                      item.saving
                    )}`}
                  />

                </div>

                <span className="month-label">
                  {item.month}
                </span>

              </div>

            ))}

          </div>

        </div>


        {/* MONTHLY TREND */}

        <div className="chart-card">

          <div className="monthly-header">

            <div className="chart-title">
              Monthly Trends
            </div>

            <select
              value={selectedYear}
              onChange={(e) =>
                setSelectedYear(
                  Number(e.target.value)
                )
              }
            >
              {[
                selectedYear - 2,
                selectedYear - 1,
                selectedYear,
                selectedYear + 1
              ].map(year => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              ))}
            </select>

          </div>

          <div className="chart-legend">

            <span>
              <i className="legend loss"></i>
              Loss
            </span>

            <span>
              <i className="legend saving"></i>
              Saving
            </span>

            <span>
              <i className="legend expense"></i>
              Expense
            </span>

            <span>
              <i className="legend income"></i>
              Income
            </span>

          </div>

          <div className="trend-chart">

            <div className="trend-grid">

              {monthlyData.map(item => {

                const incomeHeight =
                  (item.income /
                    chartMax) *
                  100;

                const expenseHeight =
                  (item.expense /
                    chartMax) *
                  100;

                const savingHeight =
                  Math.abs(
                    item.saving
                  ) /
                  chartMax *
                  100;

                return (
                  <div
                    className="trend-column"
                    key={item.month}
                  >

                    <div className="trend-area">

                      <div
                        className="trend-point income-point"
                        style={{
                          bottom:
                            `${Math.min(
                              incomeHeight,
                              100
                            )}%`
                        }}
                        title={`Income ₹${formatAmount(
                          item.income
                        )}`}
                      />

                      <div
                        className="trend-point expense-point"
                        style={{
                          bottom:
                            `${Math.min(
                              expenseHeight,
                              100
                            )}%`
                        }}
                        title={`Expense ₹${formatAmount(
                          item.expense
                        )}`}
                      />

                      <div
                        className="trend-point saving-point"
                        style={{
                          bottom:
                            `${Math.min(
                              savingHeight,
                              100
                            )}%`
                        }}
                        title={`Saving ₹${formatAmount(
                          item.saving
                        )}`}
                      />

                    </div>

                    <span>
                      {item.month}
                    </span>

                  </div>
                );

              })}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;