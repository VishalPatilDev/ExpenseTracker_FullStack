import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardCard({
    title,
    values,
    icon = "₹",
    valueClass = "",
}) {
    const rows = [
        ["Today's", values.today],
        ["7 Days", values.sevenDays],
        ["30 Days", values.thirtyDays],
        ["365 Days", values.threeHundredSixtyFiveDays],
        ["Total", values.total],
    ];

    const formatAmount = (amount) =>
        Number(amount || 0).toLocaleString("en-IN", {
            maximumFractionDigits: 0,
        });

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <h3 className="font-semibold text-sm">{title}</h3>

                <div className="flex size-9 items-center justify-center rounded-full bg-muted font-semibold">
                    {icon}
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {rows.map(([label, value], index) => (
                    <div
                        key={label}
                        className={`flex justify-between text-sm ${
                            index === rows.length - 1
                                ? "border-t pt-3 font-semibold"
                                : ""
                        }`}
                    >
                        <span className="text-muted-foreground">
                            {label}
                        </span>

                        <strong className={valueClass}>
                            ₹{formatAmount(value)}
                        </strong>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}