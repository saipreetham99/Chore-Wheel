
import type { LucideIcon, LucideProps } from 'lucide-react';
import * as icons from "lucide-react";

export const teamMemberNames = ["Person 1", "Person 2", "Person 3", "Person 4"] as const;
export type TeamMemberName = (typeof teamMemberNames)[number] | string;

export type Chore = {
  id: string;
  title: string;
  description: string;
  iconName: keyof typeof icons;
  frequency: number;
};

export type Task = {
  id: string;
  choreId: string;
  assignee: TeamMemberName;
};

export type PastAssignments = Record<TeamMemberName, number>;

    
