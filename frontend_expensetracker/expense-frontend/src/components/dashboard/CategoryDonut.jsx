import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CategoryDonut({
    data,
    total,
    formatAmount,   
}) {
    if (!data.length) {
        return (
            <Card>
                <CardHeader>
                    <h3 className="font-semibold">
                        Expense by Category
                    </h3>
                </CardHeader>

                <CardContent>
                    <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                        No expense data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    let current = 0;

    const gradients = data.map((item) => {
        const start = current;
        const end = current + item.percentage;

        current = end;

        return `${item.color} ${start}% ${end}%`;
    });

    return (
        <Card>
            <CardHeader>
                <h3 className="font-semibold">
                    Expense by Category
                </h3>
            </CardHeader>

            <CardContent>
                <div className="flex flex-col items-center gap-8 md:flex-row">
                    {/* DONUT */}

                    <div
                        className="relative flex size-48 shrink-0 items-center justify-center rounded-full"
                        style={{
                            background: `conic-gradient(${gradients.join(
                                ", "
                            )})`,
                        }}
                    >
                        <div className="flex size-32 flex-col items-center justify-center rounded-full bg-background">
                            <span className="text-xs text-muted-foreground">
                                Total Expense
                            </span>

                            <strong className="text-lg">
                                ₹{formatAmount(total)}
                            </strong>
                        </div>
                    </div>

                    {/* LIST */}

                    <div className="w-full space-y-3">
                        {data.map((item) => (
                            <div
                                key={item.category}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className="size-3 rounded-full"
                                        style={{
                                            backgroundColor:
                                                item.color,
                                        }}
                                    />

                                    <span className="text-sm">
                                        {item.category}
                                    </span>
                                </div>

                                <div className="text-right">
                                    <strong className="text-sm">
                                        ₹
                                        {formatAmount(
                                            item.amount
                                        )}
                                    </strong>

                                    <span className="ml-2 text-xs text-muted-foreground">
                                        {item.percentage.toFixed(
                                            1
                                        )}
                                        %
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}