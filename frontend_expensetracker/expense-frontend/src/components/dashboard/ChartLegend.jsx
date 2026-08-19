const legends = [
    ["bg-emerald-500", "Income"],
    ["bg-red-500", "Expense"],
    ["bg-blue-500", "Saving"],
    ["bg-orange-500", "Loss"],
];

export default function ChartLegend() {
    return (
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {legends.map(([color, label]) => (
                <div
                    key={label}
                    className="flex items-center gap-2"
                >
                    <span
                        className={`size-3 rounded-sm ${color}`}
                    />

                    {label}
                </div>
            ))}
        </div>
    );
}