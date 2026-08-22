import { useEffect, useMemo, useState } from "react";
import api from "../api/api";

import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const MONTHS = [
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
    "Dec",
];

const COLORS = [
    "#42A5F5",
    "#32CD32",
    "#FF9800",
    "#EF4444",
    "#9C27B0",
    "#00BCD4",
    "#E91E63",
    "#8BC34A",
];

const fmt = (value) =>
    Number(value ?? 0).toLocaleString("en-IN", {
        maximumFractionDigits: 0,
    });

const fmtK = (value) => {
    const n = Number(value ?? 0);

    if (Math.abs(n) >= 100000) {
        return `${(n / 100000).toFixed(0)}L`;
    }

    if (Math.abs(n) >= 1000) {
        return `${(n / 1000).toFixed(0)}k`;
    }

    return String(n);
};

// ─────────────────────────────────────────────────────────────
// SUMMARY CARD
// ─────────────────────────────────────────────────────────────

function SummaryCard({
    title,
    icon,
    values,
    color,
    background,
    iconBackground,
}) {
    const rows = [
        ["Today's", values.today],
        ["7 Day's", values.sevenDays],
        ["30 Day's", values.thirtyDays],
        ["365 Day's", values.threeHundredSixtyFiveDays],
        ["Total", values.total],
    ];

    return (
        <div
            className="rounded-xl border p-4 shadow-sm"
            style={{
                backgroundColor: background,
                borderColor: `${color}18`,
            }}
        >
            <div className="mb-3 flex items-center justify-between">
                <h3
                    className="text-xs font-bold tracking-wider"
                    style={{ color }}
                >
                    {title}
                </h3>

                <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-lg font-bold"
                    style={{
                        color,
                        backgroundColor: iconBackground || "#ffffff",
                    }}
                >
                    {icon}
                </div>
            </div>

            <div className="space-y-2">
                {rows.map(([label, value], index) => (
                    <div
                        key={label}
                        className={`flex items-center justify-between text-xs ${
                            index === rows.length - 1
                                ? "mt-1 border-t border-black/5 pt-2"
                                : ""
                        }`}
                    >
                        <span
                            className={
                                index === rows.length - 1
                                    ? "font-semibold"
                                    : ""
                            }
                            style={{ color }}
                        >
                            {label}
                        </span>

                        <strong
                            className="font-semibold"
                            style={{ color }}
                        >
                            ₹{fmt(value)}
                        </strong>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// PENDING CARD
// ─────────────────────────────────────────────────────────────

function PendingSummaryCard({
    title,
    icon,
    amount,
    color,
    background,
}) {
    return (
        <div
            className="rounded-xl border p-4 shadow-sm"
            style={{
                backgroundColor: background,
                borderColor: `${color}18`,
            }}
        >
            <div className="mb-3 flex items-center justify-between">
                <h3
                    className="text-xs font-bold tracking-wider"
                    style={{ color }}
                >
                    {title}
                </h3>

                <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-lg"
                    style={{ color }}
                >
                    {icon}
                </div>
            </div>

            <div
                className="mb-2 text-xs font-medium"
                style={{ color }}
            >
                Today's
            </div>

            <div
                className="mb-2 text-xs font-medium"
                style={{ color }}
            >
                7 Day's
            </div>

            <div
                className="mb-2 text-xs font-medium"
                style={{ color }}
            >
                30 Day's
            </div>

            <div
                className="mb-2 flex items-center justify-between text-xs font-semibold"
                style={{ color }}
            >
                <span>365 Day's</span>
                <span>₹{fmt(amount)}</span>
            </div>

            <div
                className="flex items-center justify-between border-t border-black/5 pt-2 text-xs font-semibold"
                style={{ color }}
            >
                <span>Total</span>
                <span>₹{fmt(amount)}</span>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// CHART LEGEND
// ─────────────────────────────────────────────────────────────

function ChartLegend() {
    const legends = [
        ["#42A5F5", "Income"],
        ["#FF8000", "Expense"],
        ["#32CD32", "Saving"],
        ["#FF0000", "Loss"],
    ];

    return (
        <div className="flex flex-wrap items-center justify-center gap-5">
            {legends.map(([color, label]) => (
                <div
                    key={label}
                    className="flex items-center gap-2 text-xs text-gray-500"
                >
                    <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: color }}
                    />
                    <span>{label}</span>
                </div>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// TOOLTIP
// ─────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-lg border bg-white px-3 py-2 shadow-lg">
            <p className="mb-1 text-xs font-semibold text-gray-700">
                {label}
            </p>

            {payload.map((entry) => (
                <div
                    key={entry.dataKey}
                    className="flex items-center justify-between gap-4 text-xs"
                >
                    <span style={{ color: entry.color }}>
                        {entry.name}
                    </span>

                    <strong>
                        ₹{fmt(Math.abs(entry.value))}
                    </strong>
                </div>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// DONUT CHART
// ─────────────────────────────────────────────────────────────

function CategoryDonut({
    title,
    data,
    total,
    emptyText = "No data available",
}) {
    return (
        <div className="rounded-lg bg-white p-5">
            <div className="mb-5 flex justify-center">
                <div className="rounded-full border border-blue-300 px-8 py-2">
                    <h3 className="text-sm font-bold text-blue-600">
                        {title}
                    </h3>
                </div>
            </div>

            {!data.length ? (
                <div className="flex h-64 items-center justify-center text-sm text-gray-400">
                    {emptyText}
                </div>
            ) : (
                <div className="relative h-[330px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={120}
                                paddingAngle={2}
                                dataKey="value"
                                nameKey="name"
                                labelLine
                                label={({ name, value }) =>
                                    `${name} (${fmt(value)})`
                                }
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`${entry.name}-${index}`}
                                        fill={entry.color}
                                    />
                                ))}
                            </Pie>

                            <Tooltip
                                formatter={(value) =>
                                    `₹${fmt(value)}`
                                }
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center">
                        <span className="text-xs text-gray-400">
                            Total
                        </span>

                        <strong className="text-base text-gray-700">
                            ₹{fmt(total)}
                        </strong>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────

export default function Dashboard() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    const currentDate = new Date();

    const [selectedYear, setSelectedYear] = useState(
        String(currentDate.getFullYear())
    );

    const [chartMode, setChartMode] = useState(
        "Income & Expense"
    );

    const [chartType, setChartType] = useState("PIE");

    const [chartMonth, setChartMonth] = useState(
        String(currentDate.getMonth())
    );

    // ─────────────────────────────────────────────────────────
    // API
    // ─────────────────────────────────────────────────────────

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            setLoading(true);

            const { data } = await api.get(
                "/pjsofttech/expense/expenses"
            );

            setExpenses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch expenses:", error);
        } finally {
            setLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────

    const getDate = (item) => {
        if (!item?.date) return null;

        const date = new Date(item.date);

        return Number.isNaN(date.getTime()) ? null : date;
    };

    const getAmount = (item) =>
        Number(item?.total ?? item?.amount ?? 0);

    const startOfDay = (date) =>
        new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );

    const today = startOfDay(new Date());

    const daysAgo = (days) => {
        const date = new Date(today);
        date.setDate(date.getDate() - days);
        return date;
    };

    const calculateTotal = (type, from = null) => {
        return expenses
            .filter((item) => {
                if (item.type !== type) return false;

                const date = getDate(item);

                if (!date) return false;

                if (from && date < from) return false;

                return true;
            })
            .reduce(
                (sum, item) => sum + getAmount(item),
                0
            );
    };

    // ─────────────────────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────────────────────

    const dashboardData = useMemo(() => {
        const periods = {
            today: today,
            sevenDays: daysAgo(6),
            thirtyDays: daysAgo(29),
            threeHundredSixtyFiveDays: daysAgo(364),
            total: null,
        };

        const income = {};
        const expense = {};
        const savings = {};

        Object.entries(periods).forEach(([key, from]) => {
            income[key] = calculateTotal("INCOME", from);
            expense[key] = calculateTotal("EXPENSE", from);

            savings[key] = income[key] - expense[key];
        });

        return {
            income,
            expense,
            savings,
        };
    }, [expenses]);

    // ─────────────────────────────────────────────────────────
    // PENDING
    // ─────────────────────────────────────────────────────────

    const pendingIncome = useMemo(() => {
        return expenses
            .filter((item) => item.type === "INCOME")
            .reduce(
                (sum, item) =>
                    sum + Number(item.pending || 0),
                0
            );
    }, [expenses]);

    const pendingExpense = useMemo(() => {
        return expenses
            .filter((item) => item.type === "EXPENSE")
            .reduce(
                (sum, item) =>
                    sum + Number(item.pending || 0),
                0
            );
    }, [expenses]);

    // ─────────────────────────────────────────────────────────
    // YEARS
    // ─────────────────────────────────────────────────────────

    const availableYears = useMemo(() => {
        const years = expenses
            .map((item) => getDate(item)?.getFullYear())
            .filter(Boolean);

        years.push(new Date().getFullYear());

        return [...new Set(years)].sort((a, b) => b - a);
    }, [expenses]);

    // ─────────────────────────────────────────────────────────
    // TOP BAR CHART
    // Today / 7 Days / 30 Days / 365 Days / Total
    // ─────────────────────────────────────────────────────────

    const comparisonData = useMemo(() => {
        const keys = [
            ["Today's", "today"],
            ["7 Day's", "sevenDays"],
            ["30 Day's", "thirtyDays"],
            ["365 Day's", "threeHundredSixtyFiveDays"],
            ["Total", "total"],
        ];

        return keys.map(([label, key]) => {
            const saving =
                dashboardData.savings[key] > 0
                    ? dashboardData.savings[key]
                    : 0;

            const loss =
                dashboardData.savings[key] < 0
                    ? Math.abs(dashboardData.savings[key])
                    : 0;

            return {
                period: label,
                income: dashboardData.income[key],
                expense: dashboardData.expense[key],
                saving,
                loss,
            };
        });
    }, [dashboardData]);

    const comparisonMax = useMemo(() => {
        const values = comparisonData.flatMap((item) => [
            item.income,
            item.expense,
            item.saving,
            item.loss,
        ]);

        return Math.max(...values, 1);
    }, [comparisonData]);

    // ─────────────────────────────────────────────────────────
    // MONTHLY LINE DATA
    // ─────────────────────────────────────────────────────────

    const monthlyData = useMemo(() => {
        const year = Number(selectedYear);

        return MONTHS.map((month, index) => {
            let income = 0;
            let expense = 0;

            expenses.forEach((item) => {
                const date = getDate(item);

                if (!date) return;

                if (
                    selectedYear !== "All" &&
                    date.getFullYear() !== year
                ) {
                    return;
                }

                if (date.getMonth() !== index) return;

                if (item.type === "INCOME") {
                    income += getAmount(item);
                }

                if (item.type === "EXPENSE") {
                    expense += getAmount(item);
                }
            });

            const saving = income - expense;

            return {
                month,
                income,
                expense,
                saving: saving > 0 ? saving : 0,
                loss: saving < 0 ? saving : 0,
            };
        });
    }, [expenses, selectedYear]);

    // ─────────────────────────────────────────────────────────
    // CATEGORY DATA
    // ─────────────────────────────────────────────────────────

    const incomeByCategory = useMemo(() => {
        const map = {};

        expenses
            .filter((item) => item.type === "INCOME")
            .forEach((item) => {
                const date = getDate(item);

                if (!date) return;

                if (
                    selectedYear !== "All" &&
                    date.getFullYear() !== Number(selectedYear)
                ) {
                    return;
                }

                if (
                    chartType &&
                    Number(chartMonth) >= 0 &&
                    date.getMonth() !== Number(chartMonth)
                ) {
                    return;
                }

                const category =
                    item.category?.name ||
                    "Uncategorized";

                map[category] =
                    (map[category] || 0) +
                    getAmount(item);
            });

        const entries = Object.entries(map);

        return entries.map(([name, value], index) => ({
            name,
            value,
            color: COLORS[index % COLORS.length],
        }));
    }, [
        expenses,
        selectedYear,
        chartMonth,
        chartType,
    ]);

    const expenseByCategory = useMemo(() => {
        const map = {};

        expenses
            .filter((item) => item.type === "EXPENSE")
            .forEach((item) => {
                const date = getDate(item);

                if (!date) return;

                if (
                    selectedYear !== "All" &&
                    date.getFullYear() !== Number(selectedYear)
                ) {
                    return;
                }

                if (
                    chartType &&
                    Number(chartMonth) >= 0 &&
                    date.getMonth() !== Number(chartMonth)
                ) {
                    return;
                }

                const category =
                    item.category?.name ||
                    "Uncategorized";

                const status =
                    item.paymentStatus === "COMPLETE" ||
                    item.paymentStatus === "PAID"
                        ? "Paid"
                        : "Pending";

                const key = `${category} (${status})`;

                map[key] =
                    (map[key] || 0) +
                    getAmount(item);
            });

        return Object.entries(map).map(
            ([name, value], index) => ({
                name,
                value,
                color: COLORS[index % COLORS.length],
            })
        );
    }, [
        expenses,
        selectedYear,
        chartMonth,
        chartType,
    ]);

    const incomeCategoryTotal = incomeByCategory.reduce(
        (sum, item) => sum + item.value,
        0
    );

    const expenseCategoryTotal =
        expenseByCategory.reduce(
            (sum, item) => sum + item.value,
            0
        );

    // ─────────────────────────────────────────────────────────
    // LOADING
    // ─────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">
                <div className="text-sm text-gray-400">
                    Loading dashboard...
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────
    // UI
    // ─────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-[#f8f9fb] p-1">
            {/* SUMMARY */}
            <div className="grid gap-2 xl:grid-cols-5">
                <SummaryCard
                    title="INCOME"
                    icon="$"
                    values={dashboardData.income}
                    color="#2196F3"
                    background="#EAF5FF"
                />

                <SummaryCard
                    title="EXPENSE"
                    icon="↯"
                    values={dashboardData.expense}
                    color="#FF7600"
                    background="#FFF0E1"
                />

                <SummaryCard
                    title="SAVINGS / LOSS"
                    icon="▣"
                    values={dashboardData.savings}
                    color="#16A81A"
                    background="#E8F8E8"
                />

                <SummaryCard
                    title="PENDING INCOME"
                    icon="▣"
                    values={{
                        today: 0,
                        sevenDays: 0,
                        thirtyDays: 0,
                        threeHundredSixtyFiveDays:
                            pendingIncome,
                        total: pendingIncome,
                    }}
                    color="#A020C0"
                    background="#F6E9F8"
                />

                <SummaryCard
                    title="PENDING EXPENSE"
                    icon="▣"
                    values={{
                        today: 0,
                        sevenDays: 0,
                        thirtyDays: 0,
                        threeHundredSixtyFiveDays:
                            pendingExpense,
                        total: pendingExpense,
                    }}
                    color="#20A820"
                    background="#E8F8E8"
                />
            </div>

            {/* CHARTS */}
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {/* COMPARISON BAR */}
                <div className="rounded-lg border bg-white p-5 shadow-sm">
                    <div className="mb-4 flex justify-center">
                        <div className="rounded-full border border-blue-300 px-8 py-2">
                            <h3 className="text-sm font-bold text-blue-600">
                                Income, Expense & Saving/Loss
                                Comparison
                            </h3>
                        </div>
                    </div>

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >
                        <BarChart
                            data={comparisonData}
                            margin={{
                                top: 10,
                                right: 10,
                                left: 5,
                                bottom: 10,
                            }}
                            barCategoryGap="25%"
                        >
                            <XAxis
                                dataKey="period"
                                tick={{
                                    fontSize: 11,
                                }}
                            />

                            <YAxis
                                tickFormatter={fmtK}
                                tick={{
                                    fontSize: 10,
                                }}
                            />

                            <Tooltip
                                content={<ChartTooltip />}
                            />

                            <Bar
                                dataKey="income"
                                name="Income"
                                fill="#42A5F5"
                                radius={[2, 2, 0, 0]}
                            />

                            <Bar
                                dataKey="expense"
                                name="Expense"
                                fill="#FF8000"
                                radius={[2, 2, 0, 0]}
                            />

                            <Bar
                                dataKey="saving"
                                name="Saving"
                                fill="#32CD32"
                                radius={[2, 2, 0, 0]}
                            />

                            <Bar
                                dataKey="loss"
                                name="Loss"
                                fill="#FF0000"
                                radius={[2, 2, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>

                    <ChartLegend />
                </div>

                {/* MONTHLY LINE */}
                <div className="rounded-lg border bg-white p-5 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-1 justify-center">
                            <div className="rounded-full border border-blue-300 px-8 py-2">
                                <h3 className="text-sm font-bold text-blue-600">
                                    Monthly Trends (Income,
                                    Expense & Saving/Loss)
                                </h3>
                            </div>
                        </div>

                        <select
                            value={selectedYear}
                            onChange={(event) =>
                                setSelectedYear(
                                    event.target.value
                                )
                            }
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs outline-none"
                        >
                            {availableYears.map((year) => (
                                <option
                                    key={year}
                                    value={String(year)}
                                >
                                    {year}
                                </option>
                            ))}

                            <option value="All">All</option>
                        </select>
                    </div>

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >
                        <LineChart
                            data={monthlyData}
                            margin={{
                                top: 10,
                                right: 10,
                                left: 5,
                                bottom: 10,
                            }}
                        >
                            <XAxis
                                dataKey="month"
                                tick={{
                                    fontSize: 10,
                                }}
                            />

                            <YAxis
                                tickFormatter={fmtK}
                                tick={{
                                    fontSize: 10,
                                }}
                            />

                            <Tooltip
                                content={<ChartTooltip />}
                            />

                            <Line
                                type="monotone"
                                dataKey="income"
                                name="Income"
                                stroke="#42A5F5"
                                strokeWidth={2}
                                dot={{
                                    r: 4,
                                    fill: "#42A5F5",
                                }}
                            />

                            <Line
                                type="monotone"
                                dataKey="expense"
                                name="Expense"
                                stroke="#FF8000"
                                strokeWidth={2}
                                dot={{
                                    r: 4,
                                    fill: "#FF8000",
                                }}
                            />

                            <Line
                                type="monotone"
                                dataKey="saving"
                                name="Saving"
                                stroke="#32CD32"
                                strokeWidth={2}
                                dot={{
                                    r: 4,
                                    fill: "#32CD32",
                                }}
                            />

                            <Line
                                type="monotone"
                                dataKey="loss"
                                name="Loss"
                                stroke="#FF0000"
                                strokeWidth={2}
                                dot={{
                                    r: 4,
                                    fill: "#FF0000",
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>

                    <ChartLegend />
                </div>
            </div>

            {/* CATEGORY CONTROLS */}
            <div className="mt-4 rounded-lg border bg-white px-5 pt-3 shadow-sm">
                <div className="flex flex-wrap items-end gap-6">
                    <div className="flex gap-6">
                        {[
                            "Income & Expense",
                            "Income Only",
                            "Expense Only",
                        ].map((mode) => (
                            <button
                                key={mode}
                                onClick={() =>
                                    setChartMode(mode)
                                }
                                className={`border-b-2 pb-2 text-sm font-medium transition ${
                                    chartMode === mode
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    <div className="ml-auto flex flex-wrap gap-2 pb-1">
                        <select
                            value={chartMonth}
                            onChange={(event) =>
                                setChartMonth(
                                    event.target.value
                                )
                            }
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs outline-none"
                        >
                            {MONTHS.map((month, index) => (
                                <option
                                    key={month}
                                    value={String(index)}
                                >
                                    {month}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedYear}
                            onChange={(event) =>
                                setSelectedYear(
                                    event.target.value
                                )
                            }
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs outline-none"
                        >
                            {availableYears.map((year) => (
                                <option
                                    key={year}
                                    value={String(year)}
                                >
                                    {year}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={() =>
                                setChartType("PIE")
                            }
                            className={`rounded px-3 py-2 text-xs font-semibold ${
                                chartType === "PIE"
                                    ? "bg-gray-200 text-gray-700"
                                    : "border text-gray-500"
                            }`}
                        >
                            PIE
                        </button>

                        <button
                            onClick={() =>
                                setChartType("BAR")
                            }
                            className={`rounded px-3 py-2 text-xs font-semibold ${
                                chartType === "BAR"
                                    ? "bg-gray-200 text-gray-700"
                                    : "border text-gray-500"
                            }`}
                        >
                            BAR
                        </button>
                    </div>
                </div>
            </div>

            {/* CATEGORY CHARTS */}
            <div
                className={`mt-0 grid gap-4 ${
                    chartMode === "Income Only" ||
                    chartMode === "Expense Only"
                        ? "grid-cols-1"
                        : "lg:grid-cols-2"
                }`}
            >
                {chartMode !== "Expense Only" && (
                    <CategoryDonut
                        title="Income by Category"
                        data={incomeByCategory}
                        total={incomeCategoryTotal}
                        emptyText="No income data available"
                    />
                )}

                {chartMode !== "Income Only" && (
                    <CategoryDonut
                        title="Expense by Category"
                        data={expenseByCategory}
                        total={expenseCategoryTotal}
                        emptyText="No expense data available"
                    />
                )}
            </div>

            {/* FOOTER */}
            <div className="mt-1 flex items-center justify-center border-t bg-white py-2 text-xs text-gray-600">
                <span className="mr-1">🙏</span>
                Software Designed By
                <span className="mx-1 font-semibold text-gray-700">
                    PJ SOFTTECH Pvt. Ltd.
                </span>
                <span className="text-red-500">
                    © All Rights Reserved
                </span>
            </div>
        </div>
    );
}