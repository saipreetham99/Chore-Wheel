"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  initialTasks as defaultInitialTasks,
  chores as defaultChoores,
  teamMembers as defaultTeamMembers,
} from '@/lib/initial-data';
import {
  RefreshCw,
  Trash2,
  PlusCircle,
  Pencil,
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Printer,
} from 'lucide-react';
import { MonthlyCalendarView } from '@/components/monthly-calendar-view';
import { PrintSheet } from '@/components/print-sheet';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TeamMemberName, Chore, Task } from '@/lib/types';
import { shuffle } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { memberAccent, memberInitials } from '@/lib/member-style';

export default function Home() {
  const [teamMembers, setTeamMembers] = useState<TeamMemberName[]>([]);
  const [chores, setChores] = useState<Record<string, Chore>>({});
  const [isMounted, setIsMounted] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberName | null>(null);
  const [editingChore, setEditingChore] = useState<string | null>(null);
  const [startDate] = useState(() => new Date());
  const [monthOffset, setMonthOffset] = useState(0);

  useEffect(() => {
    try {
      const storedMembers = localStorage.getItem('teamMembers');
      const storedChores = localStorage.getItem('chores');

      setTeamMembers(storedMembers ? JSON.parse(storedMembers) : defaultTeamMembers);
      setChores(storedChores ? JSON.parse(storedChores) : defaultChoores);
    } catch (error) {
      console.error('Failed to parse from localStorage', error);
      setTeamMembers(defaultTeamMembers);
      setChores(defaultChoores);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
    }
  }, [teamMembers, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('chores', JSON.stringify(chores));
    }
  }, [chores, isMounted]);

  const uniqueChoreIds = useMemo(() => Object.keys(chores), [chores]);

  // NOTE: `history` is written but never read for rendering — MonthlyCalendarView
  // derives the schedule itself. Left in place here; step 3 removes it.
  const [history, setHistory] = useState<Record<number, Task[]>>({});

  const initialTasks: Task[] = useMemo(() => {
    if (!teamMembers.length || !uniqueChoreIds.length) return [];

    const shuffledChores = shuffle([...uniqueChoreIds]);

    return teamMembers.map((member, index) => {
      const choreId = shuffledChores[index % shuffledChores.length];
      return {
        id: `task-${member}-${choreId}-m0`,
        choreId: choreId,
        assignee: member as TeamMemberName,
      };
    });
  }, [teamMembers, uniqueChoreIds]);

  useEffect(() => {
    if (initialTasks.length > 0 && isMounted) {
      if (!history[0]) {
        try {
          const storedHistory = localStorage.getItem('choreHistory');
          const parsedHistory = storedHistory
            ? JSON.parse(storedHistory)
            : { 0: initialTasks };
          setHistory(parsedHistory);
        } catch (error) {
          console.error('Failed to parse history from localStorage', error);
          setHistory({ 0: initialTasks });
        }
      }
    }
  }, [initialTasks, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('choreHistory', JSON.stringify(history));
    }
  }, [history, isMounted]);

  const handleNextMonth = () => setMonthOffset((prev) => prev + 1);
  const handlePreviousMonth = () => setMonthOffset((prev) => Math.max(0, prev - 1));

  const displayDate = useMemo(() => {
    const d = new Date(startDate);
    d.setDate(1);
    d.setMonth(d.getMonth() + monthOffset);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [monthOffset, startDate]);

  const handleAddMember = () => {
    const newMemberName = `Person ${teamMembers.length + 1}` as TeamMemberName;
    if (teamMembers.includes(newMemberName)) return;
    setTeamMembers([...teamMembers, newMemberName]);
  };

  const handleRemoveMember = (name: TeamMemberName) => {
    setTeamMembers(teamMembers.filter((m) => m !== name));
  };

  const handleUpdateMemberName = (oldName: TeamMemberName, newName: string) => {
    if (!newName.trim() || teamMembers.includes(newName.trim() as TeamMemberName)) {
      setEditingMember(null);
      return;
    }
    const newTeamMembers = teamMembers.map((m) =>
      m === oldName ? (newName.trim() as TeamMemberName) : m
    );
    setTeamMembers(newTeamMembers);

    const updateHistory = (prevHistory: Record<number, Task[]>) => {
      const newHistory: Record<number, Task[]> = {};
      for (const month in prevHistory) {
        newHistory[month] = prevHistory[month].map((task) =>
          task.assignee === oldName
            ? { ...task, assignee: newName.trim() as TeamMemberName }
            : task
        );
      }
      return newHistory;
    };
    setHistory(updateHistory);

    setEditingMember(null);
  };

  const handleAddChore = () => {
    const newChoreId = `new-chore-${Object.keys(chores).length + 1}`;
    const newChore: Chore = {
      id: newChoreId,
      title: 'New task',
      description: 'Task description',
      iconName: 'ClipboardList',
      frequency: 1,
    };
    setChores({ ...chores, [newChoreId]: newChore });
    setEditingChore(newChoreId);
  };

  const handleRemoveChore = (choreId: string) => {
    const newChores = { ...chores };
    delete newChores[choreId];
    setChores(newChores);
  };

  const handleUpdateChore = (
    choreId: string,
    field: keyof Chore,
    value: string | number
  ) => {
    let updatedValue = value;
    if (field === 'frequency') {
      const numValue = Number(value);
      updatedValue = isNaN(numValue) || numValue < 1 ? 1 : numValue;
    }
    setChores((prev) => ({
      ...prev,
      [choreId]: { ...prev[choreId], [field]: updatedValue },
    }));
  };

  const handleFrequencyChange = (choreId: string, amount: number) => {
    setChores((prev) => {
      const currentFrequency = prev[choreId].frequency || 1;
      const newFrequency = Math.max(1, currentFrequency + amount);
      return {
        ...prev,
        [choreId]: { ...prev[choreId], frequency: newFrequency },
      };
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
    <div className="app-shell flex min-h-screen flex-col bg-background font-body text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary">
            <RefreshCw className="h-[18px] w-[18px] text-primary-foreground" />
          </div>

          <div className="mr-auto min-w-0">
            <h1 className="font-headline text-lg font-bold leading-none tracking-tight">
              Chore Wheel
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {teamMembers.length} people · {Object.keys(chores).length} tasks
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handlePreviousMonth}
              disabled={monthOffset === 0}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[9.5rem] text-center text-sm font-semibold tabular-nums">
              {displayDate}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={handlePrint} size="sm" className="h-10">
            <Printer className="h-4 w-4" />
            Print schedule
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <MonthlyCalendarView
              key={`${teamMembers.length}-${Object.keys(chores).length}-${monthOffset}`}
              chores={chores}
              teamMembers={teamMembers}
              monthOffset={monthOffset}
            />
          </div>

          <div className="space-y-5">
            <Card className="surface-shadow rounded-lg border-border">
              <CardHeader className="pb-3">
                <CardTitle className="font-headline text-base font-semibold tracking-tight">
                  People
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {teamMembers.map((member, index) => (
                    <div
                      key={member}
                      style={{ '--rail': memberAccent(index) } as React.CSSProperties}
                      className="flex items-center gap-2.5 rounded-md px-1 py-1 transition-colors hover:bg-muted/60"
                    >
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[hsl(var(--rail)/0.12)] text-[11px] font-bold text-[hsl(var(--rail))]">
                        {memberInitials(member)}
                      </span>
                      {editingMember === member ? (
                        <Input
                          defaultValue={member}
                          onBlur={(e) => handleUpdateMemberName(member, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter')
                              handleUpdateMemberName(member, e.currentTarget.value);
                          }}
                          autoFocus
                          className="h-8 flex-grow"
                        />
                      ) : (
                        <span className="flex-grow truncate text-sm font-medium">
                          {member}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => setEditingMember(member)}
                        aria-label={`Rename ${member}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => handleRemoveMember(member)}
                        aria-label={`Remove ${member}`}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button onClick={handleAddMember} variant="outline" className="mt-3 w-full">
                  <PlusCircle className="h-4 w-4" /> Add person
                </Button>
              </CardContent>
            </Card>

            <Card className="surface-shadow rounded-lg border-border">
              <CardHeader className="pb-3">
                <CardTitle className="font-headline text-base font-semibold tracking-tight">
                  Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {Object.values(chores).map((chore) => (
                    <div
                      key={chore.id}
                      className="rounded-md border border-border bg-card p-3"
                    >
                      {editingChore === chore.id ? (
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <Input
                              defaultValue={chore.title}
                              placeholder="Task name"
                              onBlur={(e) =>
                                handleUpdateChore(chore.id, 'title', e.target.value)
                              }
                              className="h-9 flex-grow font-semibold"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 shrink-0"
                              onClick={() => setEditingChore(null)}
                              aria-label="Done editing"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            defaultValue={chore.description}
                            placeholder="What it involves"
                            onBlur={(e) =>
                              handleUpdateChore(chore.id, 'description', e.target.value)
                            }
                            className="h-9"
                          />
                          <Input
                            defaultValue={chore.iconName}
                            placeholder="Lucide icon name, e.g. Bath"
                            onBlur={(e) =>
                              handleUpdateChore(chore.id, 'iconName', e.target.value)
                            }
                            className="h-9"
                          />
                        </div>
                      ) : (
                        <div className="flex items-start gap-2.5">
                          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/10">
                            <Icon
                              name={chore.iconName}
                              className="h-4 w-4 text-primary"
                            />
                          </span>
                          <div className="min-w-0 flex-grow">
                            <p className="truncate text-sm font-semibold">{chore.title}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {chore.description}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => setEditingChore(chore.id)}
                            aria-label={`Edit ${chore.title}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => handleRemoveChore(chore.id)}
                            aria-label={`Remove ${chore.title}`}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      )}

                      <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-border pt-2.5">
                        <Label
                          htmlFor={`frequency-${chore.id}`}
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Times per week
                        </Label>
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => handleFrequencyChange(chore.id, -1)}
                            aria-label={`Fewer ${chore.title}`}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span
                            id={`frequency-${chore.id}`}
                            className="w-5 text-center text-sm font-bold tabular-nums"
                          >
                            {chore.frequency || 1}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => handleFrequencyChange(chore.id, 1)}
                            aria-label={`More ${chore.title}`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={handleAddChore} variant="outline" className="mt-3 w-full">
                  <PlusCircle className="h-4 w-4" /> Add task
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>

    <PrintSheet
      chores={chores}
      teamMembers={teamMembers}
      monthOffset={monthOffset}
      monthLabel={displayDate}
    />
    </>
  );
}
