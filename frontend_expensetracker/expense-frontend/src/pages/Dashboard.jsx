import { useEffect, useMemo, useState } from "react";
import api from "../api/api";

import DashboardCard from "@/components/dashboard/DashboardCard";
import PendingCard from "@/components/dashboard/PendingCard";
import MonthlyBarChart from "@/components/dashboard/MonthlyBarChart";
import CategoryDonut from "@/components/dashboard/CategoryDonut";

import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const MONTHS = [
    "Jan", "Feb", "Mar", "Apr",
    "May", "Jun", "Jul", "Aug",
    "Sep", "Oct", "Nov", "Dec",
];

const COLORS = [
    "#4F46E5",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#EC4899",
    "#84CC16",
    "#F97316",
    "#6366F1",
];

const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 0,
    });

export default function Dashboard() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedYear, setSelectedYear] = useState(
        String(new Date().getFullYear())
    );

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            setLoading(true);

            const { data } = await api.get(
                "/pjsofttech/expense/expenses"
            );

            setExpenses(data || []);
        } catch (error) {
            console.error("Error loading dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const getDate = (item) => {
        if (!item.date) return null;

        const date = new Date(item.date);

        return Number.isNaN(date.getTime())
            ? null
            : date;
    };

    const getAmount = (item) =>
        Number(item.total ?? item.amount ?? 0);

    const today = new Date();

    const startOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    const startOf7Days = new Date(startOfToday);
    startOf7Days.setDate(startOf7Days.getDate() - 6);

    const startOf30Days = new Date(startOfToday);
    startOf30Days.setDate(startOf30Days.getDate() - 29);

    const startOf365Days = new Date(startOfToday);
    startOf365Days.setDate(startOf365Days.getDate() - 364);

    const calculateTotal = (
        type,
        startDate = null,
        endDate = null
    ) =>
        expenses
            .filter((item) => {
                if (item.type !== type) return false;

                const date = getDate(item);

                if (!date) return false;
                if (startDate && date < startDate) return false;
                if (endDate && date > endDate) return false;

                return true;
            })
            .reduce(
                (sum, item) => sum + getAmount(item),
                0
            );

    // ----------------------------------------
    // DASHBOARD TOTALS
    // ----------------------------------------

    const dashboardData = useMemo(() => {
        const periods = {
            today: startOfToday,
            sevenDays: startOf7Days,
            thirtyDays: startOf30Days,
            threeHundredSixtyFiveDays:
                startOf365Days,
            total: null,
        };

        const income = {};
        const expense = {};
        const savings = {};

        Object.entries(periods).forEach(
            ([key, start]) => {
                income[key] = calculateTotal(
                    "INCOME",
                    start
                );

                expense[key] = calculateTotal(
                    "EXPENSE",
                    start
                );

                savings[key] =
                    income[key] - expense[key];
            }
        );

        return {
            income,
            expense,
            savings,
        };
    }, [expenses]);

    // ----------------------------------------
    // AVAILABLE YEARS
    // ----------------------------------------

    const availableYears = useMemo(() => {
        const years = expenses
            .map((item) => getDate(item)?.getFullYear())
            .filter(Boolean);

        return [
            ...new Set([
                ...years,
                new Date().getFullYear(),
            ]),
        ].sort((a, b) => a - b);
    }, [expenses]);

    // ----------------------------------------
    // MONTHLY DATA
    // ----------------------------------------

    const monthlyData = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();

        return MONTHS.map((month, index) => {
            let income = 0;
            let expense = 0;

            expenses.forEach((item) => {
                const date = getDate(item);

                if (!date) return;

                if (
                    date.getFullYear() !==
                    Number(selectedYear)
                )
                    return;

                if (date.getMonth() !== index)
                    return;

                if (
                    Number(selectedYear) ===
                        currentYear &&
                    index > currentMonth
                )
                    return;

                const amount = getAmount(item);

                if (item.type === "INCOME")
                    income += amount;

                if (item.type === "EXPENSE")
                    expense += amount;
            });

            return {
                month,
                income,
                expense,
                saving: income - expense,
            };
        });
    }, [expenses, selectedYear]);

    // ----------------------------------------
    // CATEGORY DATA
    // ----------------------------------------

    const categoryData = useMemo(() => {
        const map = {};

        expenses.forEach((item) => {
            if (item.type !== "EXPENSE") return;

            const date = getDate(item);

            if (!date) return;

            if (
                selectedYear !== "All" &&
                date.getFullYear() !==
                    Number(selectedYear)
            )
                return;

            const amount = getAmount(item);

            if (amount <= 0) return;

            const category =
                item.category?.name ||
                "Uncategorized";

            map[category] =
                (map[category] || 0) + amount;
        });

        const total = Object.values(map).reduce(
            (sum, value) => sum + value,
            0
        );

        return Object.entries(map)
            .map(([category, amount], index) => ({
                category,
                amount,
                percentage:
                    total > 0
                        ? (amount / total) * 100
                        : 0,
                color:
                    COLORS[index % COLORS.length],
            }))
            .sort((a, b) => b.amount - a.amount);
    }, [expenses, selectedYear]);

    const categoryExpenseTotal =
        categoryData.reduce(
            (sum, item) => sum + item.amount,
            0
        );

    // ----------------------------------------
    // CHART MAX
    // ----------------------------------------

    const chartMax = useMemo(
        () =>
            Math.max(
                ...monthlyData.flatMap((item) => [
                    Math.abs(item.income),
                    Math.abs(item.expense),
                    Math.abs(item.saving),
                ]),
                1
            ),
        [monthlyData]
    );

    // ----------------------------------------
    // PENDING
    // ----------------------------------------

    const pendingIncome = useMemo(
        () =>
            expenses
                .filter(
                    (item) => item.type === "INCOME"
                )
                .reduce(
                    (sum, item) =>
                        sum +
                        Number(item.pending || 0),
                    0
                ),
        [expenses]
    );

    const pendingExpense = useMemo(
        () =>
            expenses
                .filter(
                    (item) =>
                        item.type === "EXPENSE"
                )
                .reduce(
                    (sum, item) =>
                        sum +
                        Number(item.pending || 0),
                    0
                ),
        [expenses]
    );

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                Loading dashboard...
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">

            {/* CARDS */}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <DashboardCard
                    title="INCOME"
                    values={dashboardData.income}
                    valueClass="text-emerald-600"
                />

                <DashboardCard
                    title="EXPENSE"
                    values={dashboardData.expense}
                    valueClass="text-red-600"
                />

                <DashboardCard
                    title="SAVINGS / LOSS"
                    values={dashboardData.savings}
                    valueClass={
                        dashboardData.savings.total >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                    }
                />

                <PendingCard
                    title="PENDING INCOME"
                    amount={pendingIncome}
                    description="Amount to be received"
                />

                <PendingCard
                    title="PENDING EXPENSE"
                    amount={pendingExpense}
                    description="Amount to be paid"
                />
            </div>

            {/* CHARTS */}

            <div className="grid gap-6 lg:grid-cols-2">

                <MonthlyBarChart
                    data={monthlyData}
                    max={chartMax}
                    formatAmount={formatAmount}
                />

                <CategoryDonut
                    data={categoryData}
                    total={categoryExpenseTotal}
                    formatAmount={formatAmount}
                />

            </div>

            {/* YEAR SELECTOR */}

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <h3 className="font-semibold">
                        {selectedYear === "All"
                            ? "Yearly Trends"
                            : "Monthly Trends"}
                    </h3>

                    <Select
                        value={selectedYear}
                        onValueChange={setSelectedYear}
                    >
                        <SelectTrigger className="w-[120px]">
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                            {availableYears.map(
                                (year) => (
                                    <SelectItem
                                        key={year}
                                        value={String(
                                            year
                                        )}
                                    >
                                        {year}
                                    </SelectItem>
                                )
                            )}

                            <SelectItem value="All">
                                All
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>

                <CardContent>
                    {/* Trend chart component goes here */}
                </CardContent>
            </Card>
        </div>
    );
}