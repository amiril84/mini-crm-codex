"use client";

import { ArrowDownLeft, ArrowUpRight, CalendarClock, CheckSquare, PhoneCall, Plus, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type ActiveTab = "tasks" | "events" | "calls";

export type TaskRow = {
  id: string;
  taskName: string;
  dueDate: string;
  status: string;
  priority: string;
  ownerName: string;
};

export type EventRow = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  ownerName: string;
};

export type CallRow = {
  id: string;
  contactName: string;
  direction: string;
  startTime: string;
  durationSeconds: number;
  ownerName: string;
};

export type ContactOption = {
  id: string;
  name: string;
};

export type OwnerOption = {
  id: string;
  name: string;
};

type TaskForm = {
  taskName: string;
  dueDate: string;
  status: string;
  priority: string;
  ownerId: string;
};

type EventForm = {
  title: string;
  startTime: string;
  endTime: string;
  ownerId: string;
};

type CallForm = {
  contactId: string;
  direction: string;
  startTime: string;
  durationSeconds: string;
  ownerId: string;
};

const tabs: Array<{ id: ActiveTab; label: string }> = [
  { id: "tasks", label: "Tasks" },
  { id: "events", label: "Events" },
  { id: "calls", label: "Calls" }
];

function dateInputValue(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function dateTimeInputValue(offsetHours = 0) {
  const date = new Date();
  date.setHours(date.getHours() + offsetHours, 0, 0, 0);
  return date.toISOString().slice(0, 16);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function emptyTaskForm(ownerId: string): TaskForm {
  return {
    taskName: "",
    dueDate: dateInputValue(1),
    status: "Pending",
    priority: "Normal",
    ownerId
  };
}

function emptyEventForm(ownerId: string): EventForm {
  return {
    title: "",
    startTime: dateTimeInputValue(1),
    endTime: dateTimeInputValue(2),
    ownerId
  };
}

function emptyCallForm(ownerId: string, contactId: string): CallForm {
  return {
    contactId,
    direction: "Outbound",
    startTime: dateTimeInputValue(0),
    durationSeconds: "300",
    ownerId
  };
}

export function ActivitiesClient({
  initialTasks,
  initialEvents,
  initialCalls,
  contacts,
  owners
}: {
  initialTasks: TaskRow[];
  initialEvents: EventRow[];
  initialCalls: CallRow[];
  contacts: ContactOption[];
  owners: OwnerOption[];
}) {
  const defaultOwnerId = owners[0]?.id ?? "";
  const defaultContactId = contacts[0]?.id ?? "";
  const [activeTab, setActiveTab] = useState<ActiveTab>("tasks");
  const [tasks, setTasks] = useState(initialTasks);
  const [events, setEvents] = useState(initialEvents);
  const [calls, setCalls] = useState(initialCalls);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [taskForm, setTaskForm] = useState<TaskForm>(() => emptyTaskForm(defaultOwnerId));
  const [eventForm, setEventForm] = useState<EventForm>(() => emptyEventForm(defaultOwnerId));
  const [callForm, setCallForm] = useState<CallForm>(() => emptyCallForm(defaultOwnerId, defaultContactId));

  const actionLabel = useMemo(() => {
    if (activeTab === "tasks") return "Task";
    if (activeTab === "events") return "Event";
    return "Call";
  }, [activeTab]);

  async function handleTaskSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskForm)
    });
    setIsSaving(false);

    if (!response.ok) return;

    const createdTask = (await response.json()) as TaskRow;
    setTasks((current) => [createdTask, ...current]);
    setTaskForm(emptyTaskForm(defaultOwnerId));
    setIsModalOpen(false);
  }

  async function handleEventSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventForm)
    });
    setIsSaving(false);

    if (!response.ok) return;

    const createdEvent = (await response.json()) as EventRow;
    setEvents((current) => [createdEvent, ...current]);
    setEventForm(emptyEventForm(defaultOwnerId));
    setIsModalOpen(false);
  }

  async function handleCallSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    const response = await fetch("/api/calls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(callForm)
    });
    setIsSaving(false);

    if (!response.ok) return;

    const createdCall = (await response.json()) as CallRow;
    setCalls((current) => [createdCall, ...current]);
    setCallForm(emptyCallForm(defaultOwnerId, defaultContactId));
    setIsModalOpen(false);
  }

  return (
    <section className="min-h-[calc(100vh-73px)] bg-white px-8 py-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">Activities</h1>
          <p className="mt-1 text-sm text-gray-500">Plan tasks, schedule events, and log calls.</p>
        </div>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          onClick={() => setIsModalOpen(true)}
          type="button"
        >
          <Plus className="h-4 w-4" />
          {actionLabel}
        </button>
      </div>

      <div className="mt-7 flex border-b border-gray-200" role="tablist" aria-label="Activity tabs">
        {tabs.map((tab) => (
          <button
            aria-controls={`${tab.id}-panel`}
            aria-selected={activeTab === tab.id}
            className={`h-11 border-b-2 px-5 text-sm font-semibold transition ${
              activeTab === tab.id
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
            id={`${tab.id}-tab`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pt-5">
        {activeTab === "tasks" ? <TasksTable tasks={tasks} /> : null}
        {activeTab === "events" ? <EventsTable events={events} /> : null}
        {activeTab === "calls" ? <CallsTable calls={calls} /> : null}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-4">
          {activeTab === "tasks" ? (
            <form className="w-full max-w-lg rounded bg-white p-6 shadow-xl" onSubmit={handleTaskSubmit}>
              <ModalHeader title="Add Task" onClose={() => setIsModalOpen(false)} />
              <div className="mt-5 grid gap-4">
                <TextField label="Task Name" name="taskName" onChange={(value) => setTaskForm({ ...taskForm, taskName: value })} value={taskForm.taskName} />
                <DateField label="Due Date" name="dueDate" onChange={(value) => setTaskForm({ ...taskForm, dueDate: value })} value={taskForm.dueDate} />
                <SelectField label="Status" name="status" onChange={(value) => setTaskForm({ ...taskForm, status: value })} value={taskForm.status}>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </SelectField>
                <SelectField label="Priority" name="priority" onChange={(value) => setTaskForm({ ...taskForm, priority: value })} value={taskForm.priority}>
                  <option>High</option>
                  <option>Normal</option>
                  <option>Low</option>
                </SelectField>
                <OwnerSelect owners={owners} value={taskForm.ownerId} onChange={(ownerId) => setTaskForm({ ...taskForm, ownerId })} />
              </div>
              <ModalActions label="Save Task" isSaving={isSaving} onCancel={() => setIsModalOpen(false)} />
            </form>
          ) : null}

          {activeTab === "events" ? (
            <form className="w-full max-w-lg rounded bg-white p-6 shadow-xl" onSubmit={handleEventSubmit}>
              <ModalHeader title="Add Event" onClose={() => setIsModalOpen(false)} />
              <div className="mt-5 grid gap-4">
                <TextField label="Title" name="title" onChange={(value) => setEventForm({ ...eventForm, title: value })} value={eventForm.title} />
                <DateTimeField label="From" name="startTime" onChange={(value) => setEventForm({ ...eventForm, startTime: value })} value={eventForm.startTime} />
                <DateTimeField label="To" name="endTime" onChange={(value) => setEventForm({ ...eventForm, endTime: value })} value={eventForm.endTime} />
                <OwnerSelect owners={owners} value={eventForm.ownerId} onChange={(ownerId) => setEventForm({ ...eventForm, ownerId })} />
              </div>
              <ModalActions label="Save Event" isSaving={isSaving} onCancel={() => setIsModalOpen(false)} />
            </form>
          ) : null}

          {activeTab === "calls" ? (
            <form className="w-full max-w-lg rounded bg-white p-6 shadow-xl" onSubmit={handleCallSubmit}>
              <ModalHeader title="Add Call" onClose={() => setIsModalOpen(false)} />
              <div className="mt-5 grid gap-4">
                <SelectField label="Contact" name="contactId" onChange={(value) => setCallForm({ ...callForm, contactId: value })} value={callForm.contactId}>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name}
                    </option>
                  ))}
                </SelectField>
                <SelectField label="Call Type" name="direction" onChange={(value) => setCallForm({ ...callForm, direction: value })} value={callForm.direction}>
                  <option>Outbound</option>
                  <option>Inbound</option>
                </SelectField>
                <DateTimeField label="Call Start Time" name="startTime" onChange={(value) => setCallForm({ ...callForm, startTime: value })} value={callForm.startTime} />
                <NumberField label="Call Duration" name="durationSeconds" onChange={(value) => setCallForm({ ...callForm, durationSeconds: value })} value={callForm.durationSeconds} />
                <OwnerSelect owners={owners} value={callForm.ownerId} onChange={(ownerId) => setCallForm({ ...callForm, ownerId })} />
              </div>
              <ModalActions label="Save Call" isSaving={isSaving || !callForm.contactId} onCancel={() => setIsModalOpen(false)} />
            </form>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function TasksTable({ tasks }: { tasks: TaskRow[] }) {
  return (
    <div id="tasks-panel" role="tabpanel" aria-labelledby="tasks-tab" className="overflow-hidden border-y border-gray-200">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
          <tr>
            <th className="w-12 px-4 py-3"><input aria-label="Select all tasks" className="h-4 w-4 rounded border-gray-300" type="checkbox" /></th>
            <th className="px-4 py-3">Task Name</th>
            <th className="px-4 py-3">Due Date</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Owner</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {tasks.map((task) => (
            <tr className="hover:bg-emerald-50/60" key={task.id}>
              <td className="px-4 py-4"><input aria-label={`Select ${task.taskName}`} className="h-4 w-4 rounded border-gray-300" type="checkbox" /></td>
              <td className="px-4 py-4 font-medium text-gray-950">{task.taskName}</td>
              <td className="px-4 py-4 text-gray-600">{formatDate(task.dueDate)}</td>
              <td className="px-4 py-4 text-gray-700">{task.status}</td>
              <td className="px-4 py-4 text-gray-700">{task.priority}</td>
              <td className="px-4 py-4 text-gray-700">{task.ownerName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EventsTable({ events }: { events: EventRow[] }) {
  return (
    <div id="events-panel" role="tabpanel" aria-labelledby="events-tab" className="overflow-hidden border-y border-gray-200">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
          <tr>
            <th className="w-12 px-4 py-3"><input aria-label="Select all events" className="h-4 w-4 rounded border-gray-300" type="checkbox" /></th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">From</th>
            <th className="px-4 py-3">To</th>
            <th className="px-4 py-3">Owner</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {events.map((event) => (
            <tr className="hover:bg-emerald-50/60" key={event.id}>
              <td className="px-4 py-4"><input aria-label={`Select ${event.title}`} className="h-4 w-4 rounded border-gray-300" type="checkbox" /></td>
              <td className="px-4 py-4 font-medium text-gray-950">{event.title}</td>
              <td className="px-4 py-4 text-gray-600">{formatDateTime(event.startTime)}</td>
              <td className="px-4 py-4 text-gray-600">{formatDateTime(event.endTime)}</td>
              <td className="px-4 py-4 text-gray-700">{event.ownerName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CallsTable({ calls }: { calls: CallRow[] }) {
  return (
    <div id="calls-panel" role="tabpanel" aria-labelledby="calls-tab" className="overflow-hidden border-y border-gray-200">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
          <tr>
            <th className="w-12 px-4 py-3"><input aria-label="Select all calls" className="h-4 w-4 rounded border-gray-300" type="checkbox" /></th>
            <th className="px-4 py-3">To/From</th>
            <th className="px-4 py-3">Call Type</th>
            <th className="px-4 py-3">Call Start Time</th>
            <th className="px-4 py-3">Call Duration</th>
            <th className="px-4 py-3">Owner</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {calls.map((call) => {
            const Icon = call.direction === "Inbound" ? ArrowDownLeft : ArrowUpRight;
            return (
              <tr className="hover:bg-emerald-50/60" key={call.id}>
                <td className="px-4 py-4"><input aria-label={`Select ${call.contactName} call`} className="h-4 w-4 rounded border-gray-300" type="checkbox" /></td>
                <td className="px-4 py-4 font-medium text-gray-950">
                  <span className="inline-flex items-center gap-2">
                    <Icon className="h-4 w-4 text-emerald-600" />
                    {call.contactName}
                  </span>
                </td>
                <td className="px-4 py-4 text-gray-700">{call.direction}</td>
                <td className="px-4 py-4 text-gray-600">{formatDateTime(call.startTime)}</td>
                <td className="px-4 py-4 text-gray-700">{formatDuration(call.durationSeconds)}</td>
                <td className="px-4 py-4 text-gray-700">{call.ownerName}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-950">{title}</h2>
      <button aria-label={`Close ${title.toLowerCase()} form`} className="rounded p-1 text-gray-500 hover:bg-gray-100" onClick={onClose} type="button">
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

function ModalActions({ label, isSaving, onCancel }: { label: string; isSaving: boolean; onCancel: () => void }) {
  return (
    <div className="mt-6 flex items-center justify-end gap-3">
      <button className="h-10 rounded-full px-5 text-sm font-semibold text-gray-600 hover:bg-gray-100" onClick={onCancel} type="button">
        Cancel
      </button>
      <button className="h-10 rounded-full bg-emerald-500 px-5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60" disabled={isSaving} type="submit">
        {isSaving ? "Saving..." : label}
      </button>
    </div>
  );
}

function TextField({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-gray-700">
      {label}
      <input className="h-10 rounded border border-gray-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" name={name} onChange={(event) => onChange(event.target.value)} required value={value} />
    </label>
  );
}

function NumberField({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-gray-700">
      {label}
      <input className="h-10 rounded border border-gray-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" min="1" name={name} onChange={(event) => onChange(event.target.value)} required type="number" value={value} />
    </label>
  );
}

function DateField({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-gray-700">
      {label}
      <input className="h-10 rounded border border-gray-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" name={name} onChange={(event) => onChange(event.target.value)} required type="date" value={value} />
    </label>
  );
}

function DateTimeField({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-gray-700">
      {label}
      <input className="h-10 rounded border border-gray-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" name={name} onChange={(event) => onChange(event.target.value)} required type="datetime-local" value={value} />
    </label>
  );
}

function SelectField({
  children,
  label,
  name,
  value,
  onChange
}: {
  children: React.ReactNode;
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-gray-700">
      {label}
      <select className="h-10 rounded border border-gray-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" name={name} onChange={(event) => onChange(event.target.value)} required value={value}>
        {children}
      </select>
    </label>
  );
}

function OwnerSelect({ owners, value, onChange }: { owners: OwnerOption[]; value: string; onChange: (value: string) => void }) {
  return (
    <SelectField label="Owner" name="ownerId" onChange={onChange} value={value}>
      {owners.map((owner) => (
        <option key={owner.id} value={owner.id}>
          {owner.name}
        </option>
      ))}
    </SelectField>
  );
}
