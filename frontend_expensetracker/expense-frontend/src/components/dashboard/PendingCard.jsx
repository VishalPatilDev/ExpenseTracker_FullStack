import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PendingCard({
    title,
    amount,
    description,
}) {
    const formattedAmount = Number(amount || 0).toLocaleString(
        "en-IN",
        {
            maximumFractionDigits: 0,
        }
    );

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-sm font-semibold">
                    {title}
                </h3>

                <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                    ₹
                </div>
            </CardHeader>

            <CardContent>
                <div className="text-2xl font-bold">
                    ₹{formattedAmount}
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}