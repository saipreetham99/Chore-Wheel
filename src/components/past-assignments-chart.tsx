"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PastAssignments } from "@/lib/types";

type ChartData = {
  name: string;
  tasks: number;
}[];

const chartConfig = {
  tasks: {
    label: "Tasks",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function PastAssignmentsChart({ assignments }: { assignments: PastAssignments }) {
  const chartData: ChartData = Object.entries(assignments).map(([name, tasks]) => ({
    name,
    tasks,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Completed Tasks History</CardTitle>
        <CardDescription>Total tasks completed by each team member over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
                allowDecimals={false}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="tasks" fill="var(--color-tasks)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
