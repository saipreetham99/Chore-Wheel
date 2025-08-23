import type { Chore } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

type TaskCardProps = {
  chore: Chore;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
};

export function TaskCard({ chore, isDragging, onDragStart, onDragEnd }: TaskCardProps) {
  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-all duration-200 mb-4 bg-card",
        isDragging ? "opacity-30 scale-105 shadow-2xl ring-2 ring-primary" : "shadow-md hover:shadow-lg hover:-translate-y-1"
      )}
    >
      <CardHeader className="p-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Icon name={chore.iconName} className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-md leading-tight">{chore.title}</CardTitle>
            <CardDescription className="text-xs mt-1 truncate">{chore.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
