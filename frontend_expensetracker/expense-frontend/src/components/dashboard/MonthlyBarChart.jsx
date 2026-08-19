import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ChartLegend from "./ChartLegend";

export default function MonthlyBarChart({
    data,
    max,
    formatAmount,
}) {
    return (
        <Card>
            <CardHeader>
                <h3 className="font-semibold">
                    Income, Expense & Savings/Loss Comparison
                </h3>

                <ChartLegend />
            </CardHeader>

            <CardContent>
                <div className="flex h-64 items-end justify-between gap-2">
                    {data.map((item) => (
                        <div
                            key={item.month}
                            className="flex h-full flex-1 flex-col justify-end"
                        >
                            <div className="flex h-full items-end justify-center gap-1">
                                <Bar
                                    value={item.income}
                                    max={max}
                                    color="bg-emerald-500"
                                    title={`Income ₹${formatAmount(item.income)}`}
                                />

                                <Bar
                                    value={item.expense}
                                    max={max}
                                    color="bg-red-500"
                                    title={`Expense ₹${formatAmount(item.expense)}`}
                                />

                                <Bar
                                    value={Math.abs(item.saving)}
                                    max={max}
                                    color={
                                        item.saving >= 0
                                            ? "bg-blue-500"
                                            : "bg-orange-500"
                                    }
                                    title={`${
                                        item.saving >= 0
                                            ? "Saving"
                                            : "Loss"
                                    } ₹${formatAmount(
                                        Math.abs(item.saving)
                                    )}`}
                                />
                            </div>

                            <span className="mt-2 text-center text-xs text-muted-foreground">
                                {item.month}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function Bar({
    value,
    max,
    color,
    title,
}) {
    const height =
        value > 0
            ? Math.max((value / max) * 100, 3)
            : 0;

    return (
        <div
            title={title}
            className={`w-full max-w-4 rounded-t ${color}`}
            style={{
                height: `${height}%`,
            }}
        />
    );
}