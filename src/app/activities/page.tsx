import { ActivitiesClient, type CallRow, type ContactOption, type EventRow, type OwnerOption, type TaskRow } from "./activities-client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  const [tasks, events, calls, contacts, users] = await Promise.all([
    prisma.task.findMany({
      include: { owner: true },
      orderBy: { dueDate: "asc" }
    }),
    prisma.event.findMany({
      include: { owner: true },
      orderBy: { startTime: "asc" }
    }),
    prisma.call.findMany({
      include: { contact: true, owner: true },
      orderBy: { startTime: "desc" }
    }),
    prisma.contact.findMany({
      orderBy: { name: "asc" }
    }),
    prisma.user.findMany({
      orderBy: { name: "asc" }
    })
  ]);

  const taskRows: TaskRow[] = tasks.map((task) => ({
    id: task.id,
    taskName: task.taskName,
    dueDate: task.dueDate.toISOString(),
    status: task.status,
    priority: task.priority,
    ownerName: task.owner.name
  }));

  const eventRows: EventRow[] = events.map((event) => ({
    id: event.id,
    title: event.title,
    startTime: event.startTime.toISOString(),
    endTime: event.endTime.toISOString(),
    ownerName: event.owner.name
  }));

  const callRows: CallRow[] = calls.map((call) => ({
    id: call.id,
    contactName: call.contact.name,
    direction: call.direction,
    startTime: call.startTime.toISOString(),
    durationSeconds: call.durationSeconds,
    ownerName: call.owner.name
  }));

  const contactOptions: ContactOption[] = contacts.map((contact) => ({
    id: contact.id,
    name: contact.name
  }));

  const owners: OwnerOption[] = users.map((user) => ({
    id: user.id,
    name: user.name
  }));

  return (
    <ActivitiesClient
      contacts={contactOptions}
      initialCalls={callRows}
      initialEvents={eventRows}
      initialTasks={taskRows}
      owners={owners}
    />
  );
}
