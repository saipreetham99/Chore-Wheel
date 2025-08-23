
"use client";

import { useState, useEffect, useMemo } from 'react';
import { initialTasks as defaultInitialTasks, chores as defaultChoores, teamMembers as defaultTeamMembers } from '@/lib/initial-data';
import { FlameKindling, Trash2, PlusCircle, Pencil, Save, ArrowRight, ArrowLeft, Minus, Plus, Printer } from 'lucide-react';
import { MonthlyCalendarView } from '@/components/monthly-calendar-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TeamMemberName, Chore, Task } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { shuffle } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export default function Home() {
  const [teamMembers, setTeamMembers] = useState<TeamMemberName[]>([]);
  const [chores, setChores] = useState<Record<string, Chore>>({});
  const [isMounted, setIsMounted] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberName | null>(null);
  const [editingChore, setEditingChore] = useState<string | null>(null);
  const [startDate] = useState(() => new Date());
  const [monthOffset, setMonthOffset] = useState(0);

  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedMembers = localStorage.getItem('teamMembers');
      const storedChores = localStorage.getItem('chores');
      
      setTeamMembers(storedMembers ? JSON.parse(storedMembers) : defaultTeamMembers);
      setChores(storedChores ? JSON.parse(storedChores) : defaultChoores);
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
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
      // Initialize history for the current month if it doesn't exist
      if (!history[0]) {
        try {
          const storedHistory = localStorage.getItem('choreHistory');
          const parsedHistory = storedHistory ? JSON.parse(storedHistory) : { 0: initialTasks };
          setHistory(parsedHistory);
        } catch (error) {
          console.error("Failed to parse history from localStorage", error);
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

  const handleNextMonth = () => {
    setMonthOffset(prev => prev + 1);
  };

  const handlePreviousMonth = () => {
    setMonthOffset(prev => Math.max(0, prev - 1));
  };
  
  const displayDate = useMemo(() => {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + monthOffset);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [monthOffset, startDate]);
  
  const handleAddMember = () => {
    const newMemberName = `Person ${teamMembers.length + 1}` as TeamMemberName;
    if (teamMembers.includes(newMemberName)) return;
    setTeamMembers([...teamMembers, newMemberName]);
  };
  
  const handleRemoveMember = (name: TeamMemberName) => {
    setTeamMembers(teamMembers.filter(m => m !== name));
  };

  const handleUpdateMemberName = (oldName: TeamMemberName, newName: string) => {
    if (!newName.trim() || teamMembers.includes(newName.trim() as TeamMemberName)) {
      setEditingMember(null);
      return;
    }
    const newTeamMembers = teamMembers.map(m => m === oldName ? newName.trim() as TeamMemberName : m);
    setTeamMembers(newTeamMembers);

    const updateHistory = (prevHistory: Record<number, Task[]>) => {
      const newHistory: Record<number, Task[]> = {};
      for (const month in prevHistory) {
        newHistory[month] = prevHistory[month].map(task => 
          task.assignee === oldName ? { ...task, assignee: newName.trim() as TeamMemberName } : task
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
      title: 'New Task',
      description: 'Task description',
      iconName: 'ClipboardList',
      frequency: 1,
    };
    setChores({ ...chores, [newChoreId]: newChore });
  };
  
  const handleRemoveChore = (choreId: string) => {
    const newChores = { ...chores };
    delete newChores[choreId];
    setChores(newChores);
  };

  const handleUpdateChore = (choreId: string, field: keyof Chore, value: string | number) => {
     let updatedValue = value;
      if (field === 'frequency') {
        const numValue = Number(value);
        updatedValue = isNaN(numValue) || numValue < 1 ? 1 : numValue;
      }
     setChores(prev => ({
      ...prev,
      [choreId]: { ...prev[choreId], [field]: updatedValue }
    }));
  };

  const handleFrequencyChange = (choreId: string, amount: number) => {
    setChores(prev => {
        const currentFrequency = prev[choreId].frequency || 1;
        const newFrequency = Math.max(1, currentFrequency + amount);
        return {
            ...prev,
            [choreId]: { ...prev[choreId], frequency: newFrequency }
        };
    });
  };

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-body text-foreground">
      <header className="p-4 sm:p-6 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10 no-print">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary rounded-lg">
                <FlameKindling className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold font-headline text-foreground">
                  Chore Wheel
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  Monthly Tasks for {displayDate}
                </p>
              </div>
            </div>
             <div className="flex gap-2">
              <Button onClick={handlePreviousMonth} disabled={monthOffset === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous Month
              </Button>
              <Button onClick={handleNextMonth}>
                Next Month <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 printable-area">
          <div className="lg:col-span-2">
            <MonthlyCalendarView
              key={`${teamMembers.length}-${Object.keys(chores).length}-${monthOffset}`}
              chores={chores}
              teamMembers={teamMembers}
              monthOffset={monthOffset}
            />
          </div>
          <div className="space-y-6 no-print">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div key={member} className="flex items-center gap-2">
                      {editingMember === member ? (
                        <Input
                          defaultValue={member}
                          onBlur={(e) => handleUpdateMemberName(member, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdateMemberName(member, e.currentTarget.value)
                          }}
                          autoFocus
                          className="flex-grow"
                        />
                      ) : (
                        <span className="flex-grow p-2">{member}</span>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => setEditingMember(member)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(member)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button onClick={handleAddMember} className="mt-4 w-full">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Member
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.values(chores).map((chore) => (
                    <div key={chore.id} className="flex flex-col gap-2 p-3 border rounded-lg">
                       {editingChore === chore.id ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-start">
                                <Input
                                    defaultValue={chore.title}
                                    placeholder="Task Title"
                                    onBlur={(e) => handleUpdateChore(chore.id, 'title', e.target.value)}
                                    className="text-lg font-semibold flex-grow"
                                />
                                <div className="flex items-center gap-2 ml-2">
                                    <Button variant="ghost" size="icon" onClick={() => setEditingChore(null)}>
                                        <Save className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveChore(chore.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                             <Input
                                defaultValue={chore.description}
                                placeholder="Task Description"
                                onBlur={(e) => handleUpdateChore(chore.id, 'description', e.target.value)}
                            />
                             <Input
                                defaultValue={chore.iconName}
                                placeholder="Lucide Icon Name"
                                onBlur={(e) => handleUpdateChore(chore.id, 'iconName', e.target.value)}
                            />
                        </div>
                       ) : (
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{chore.title}</p>
                            <p className="text-sm text-muted-foreground">{chore.description}</p>
                          </div>
                           <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" onClick={() => setEditingChore(chore.id)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveChore(chore.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                           </div>
                        </div>
                       )}

                        <div className="flex items-center justify-between gap-4 pt-2">
                            <Label htmlFor={`frequency-${chore.id}`} className="text-xs font-medium text-muted-foreground">
                                Frequency (per week)
                            </Label>
                            <div className="flex items-center gap-2">
                                <Button size="icon" variant="outline" onClick={() => handleFrequencyChange(chore.id, -1)}>
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="font-bold text-lg w-6 text-center">{chore.frequency || 1}</span>
                                <Button size="icon" variant="outline" onClick={() => handleFrequencyChange(chore.id, 1)}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                  ))}
                </div>
                <Button onClick={handleAddChore} className="mt-4 w-full">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Task
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 flex justify-end no-print">
            <Button onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Print Schedule
            </Button>
        </div>
      </main>
    </div>
  );
}
