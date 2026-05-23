"use client";

import { CalendarDays, DollarSign, GripVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import { DragEvent, FormEvent, useMemo, useState } from "react";

export type DealCard = {
  id: string;
  dealName: string;
  amount: number;
  stage: string;
  expectedCloseDate: string;
  companyId: string | null;
  companyName: string | null;
  contactId: string | null;
  contactName: string | null;
  ownerId: string;
};

export type CompanyOption = {
  id: string;
  name: string;
};

export type ContactOption = {
  id: string;
  name: string;
};

export type OwnerOption = {
  id: string;
  name: string;
};

type DealForm = {
  dealName: string;
  amount: string;
  stage: string;
  expectedCloseDate: string;
  companyId: string;
  contactId: string;
  ownerId: string;
};

const stages = [
  "Qualification",
  "Needs Analysis",
  "Proposal/Price Quote",
  "Negotiation",
  "Closed Won",
  "Closed Lost"
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function dateInputValue(offsetDays = 14) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function emptyForm(ownerId: string): DealForm {
  return {
    dealName: "",
    amount: "5000",
    stage: "Qualification",
    expectedCloseDate: dateInputValue(),
    companyId: "",
    contactId: "",
    ownerId
  };
}

export function DealsClient({
  initialDeals,
  companies,
  contacts,
  owners
}: {
  initialDeals: DealCard[];
  companies: CompanyOption[];
  contacts: ContactOption[];
  owners: OwnerOption[];
}) {
  const defaultOwnerId = owners[0]?.id ?? "";
  const [deals, setDeals] = useState(initialDeals);
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState<DealForm>(() => emptyForm(defaultOwnerId));

  const selectedDeal = useMemo(
    () => deals.find((deal) => deal.id === selectedDealId) ?? null,
    [deals, selectedDealId]
  );

  const totalsByStage = useMemo(() => {
    return stages.reduce<Record<string, number>>((totals, stage) => {
      totals[stage] = deals
        .filter((deal) => deal.stage === stage)
        .reduce((sum, deal) => sum + deal.amount, 0);

      return totals;
    }, {});
  }, [deals]);

  const dealsByStage = useMemo(() => {
    return stages.reduce<Record<string, DealCard[]>>((groups, stage) => {
      groups[stage] = deals.filter((deal) => deal.stage === stage);
      return groups;
    }, {});
  }, [deals]);

  function handleDragStart(event: DragEvent<HTMLElement>, dealId: string) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", dealId);
    setDraggedDealId(dealId);
  }

  async function handleDrop(event: DragEvent<HTMLElement>, targetStage: string) {
    event.preventDefault();

    const dealId = event.dataTransfer.getData("text/plain") || draggedDealId;
    const draggedDeal = deals.find((deal) => deal.id === dealId);

    if (!dealId || !draggedDeal || draggedDeal.stage === targetStage) {
      setDraggedDealId(null);
      return;
    }

    const previousDeals = deals;

    setDeals((currentDeals) =>
      currentDeals.map((deal) => (deal.id === dealId ? { ...deal, stage: targetStage } : deal))
    );
    setDraggedDealId(null);

    const response = await fetch(`/api/deals/${dealId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ stage: targetStage })
    });

    if (!response.ok) {
      setDeals(previousDeals);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const response = await fetch(modalMode === "edit" && selectedDeal ? `/api/deals/${selectedDeal.id}` : "/api/deals", {
      method: modalMode === "edit" ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setIsSaving(false);

    if (!response.ok) {
      return;
    }

    const savedDeal = (await response.json()) as DealCard;
    setDeals((currentDeals) =>
      modalMode === "edit"
        ? currentDeals.map((deal) => (deal.id === savedDeal.id ? savedDeal : deal))
        : [...currentDeals, savedDeal]
    );
    setSelectedDealId(savedDeal.id);
    setForm(emptyForm(defaultOwnerId));
    setIsModalOpen(false);
  }

  function openCreateModal() {
    setModalMode("create");
    setForm(emptyForm(defaultOwnerId));
    setIsModalOpen(true);
  }

  function openEditModal(deal: DealCard) {
    setModalMode("edit");
    setForm({
      dealName: deal.dealName,
      amount: String(deal.amount),
      stage: deal.stage,
      expectedCloseDate: deal.expectedCloseDate.slice(0, 10),
      companyId: deal.companyId ?? "",
      contactId: deal.contactId ?? "",
      ownerId: deal.ownerId
    });
    setIsModalOpen(true);
  }

  async function handleDelete(deal: DealCard) {
    if (!window.confirm(`Delete ${deal.dealName}?`)) {
      return;
    }

    setIsDeleting(true);
    const response = await fetch(`/api/deals/${deal.id}`, { method: "DELETE" });
    setIsDeleting(false);

    if (!response.ok) {
      return;
    }

    setDeals((currentDeals) => currentDeals.filter((item) => item.id !== deal.id));
    setSelectedDealId(null);
  }

  return (
    <section className="min-h-[calc(100vh-73px)] bg-white px-8 py-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">Deals</h1>
          <p className="mt-1 text-sm text-gray-500">Move opportunities through the sales pipeline.</p>
        </div>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          onClick={openCreateModal}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Deal
        </button>
      </div>

      <div className="mt-7 flex gap-4 overflow-x-auto pb-4" data-testid="deals-board">
        {stages.map((stage) => {
          const stageDeals = dealsByStage[stage] ?? [];
          const isWon = stage === "Closed Won";
          const isLost = stage === "Closed Lost";

          return (
            <section
              aria-label={`${stage} column`}
              className="flex min-h-[620px] w-72 shrink-0 flex-col rounded border border-gray-200 bg-gray-50"
              data-stage={stage}
              data-testid={`stage-${stage}`}
              key={stage}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDrop={(event) => handleDrop(event, stage)}
            >
              <header
                className={`border-b px-4 py-4 ${
                  isWon ? "border-emerald-200 bg-emerald-50" : isLost ? "border-red-100 bg-red-50" : "border-gray-200 bg-white"
                }`}
              >
                <h2 className="text-sm font-semibold text-gray-950">{stage}</h2>
                <p
                  className={`mt-2 text-xl font-semibold ${isWon ? "text-emerald-700" : isLost ? "text-red-700" : "text-gray-950"}`}
                  data-testid={`total-${stage}`}
                  data-total={totalsByStage[stage] ?? 0}
                >
                  {formatCurrency(totalsByStage[stage] ?? 0)}
                </p>
                <p className="mt-1 text-xs text-gray-500">{stageDeals.length} deals</p>
              </header>

              <div className="flex flex-1 flex-col gap-3 p-3">
                {stageDeals.map((deal) => (
                  <article
                    className={`cursor-grab rounded border border-gray-200 bg-white p-4 shadow-sm transition hover:border-emerald-300 hover:shadow-md ${
                      draggedDealId === deal.id ? "opacity-50" : ""
                    }`}
                    data-amount={deal.amount}
                    data-deal-id={deal.id}
                    data-stage={deal.stage}
                    data-testid={`deal-card-${deal.id}`}
                    draggable
                    key={deal.id}
                    onClick={() => setSelectedDealId(deal.id)}
                    onDragEnd={() => setDraggedDealId(null)}
                    onDragStart={(event) => handleDragStart(event, deal.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold leading-5 text-gray-950">{deal.dealName}</h3>
                      <GripVertical className="h-4 w-4 shrink-0 text-gray-400" />
                    </div>
                    <p className="mt-3 text-lg font-semibold text-emerald-700" data-testid={`deal-amount-${deal.id}`}>
                      {formatCurrency(deal.amount)}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">{deal.companyName ?? deal.contactName ?? "Unlinked deal"}</p>
                    <p className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-gray-500">
                      <CalendarDays className="h-4 w-4" />
                      {formatDate(deal.expectedCloseDate)}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {selectedDeal ? (
        <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-md border-l border-gray-200 bg-white p-6 shadow-2xl" aria-label="Deal detail panel">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded bg-emerald-100 text-emerald-700">
                <DollarSign className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-gray-950">{selectedDeal.dealName}</h2>
              <p className="mt-1 text-sm text-gray-500">Deal detail</p>
            </div>
            <button aria-label="Close deal detail" className="rounded p-1 text-gray-500 hover:bg-gray-100" onClick={() => setSelectedDealId(null)} type="button">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-6 flex gap-3">
            <button className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-500 px-4 text-sm font-semibold text-white hover:bg-emerald-600" onClick={() => openEditModal(selectedDeal)} type="button">
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            <button className="inline-flex h-10 items-center gap-2 rounded-full border border-red-200 px-4 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60" disabled={isDeleting} onClick={() => handleDelete(selectedDeal)} type="button">
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
          <div className="mt-6 grid gap-4 text-sm">
            <Detail label="Amount" value={formatCurrency(selectedDeal.amount)} />
            <Detail label="Stage" value={selectedDeal.stage} />
            <Detail label="Company" value={selectedDeal.companyName ?? "Not linked"} />
            <Detail label="Contact" value={selectedDeal.contactName ?? "Not linked"} />
            <Detail label="Expected Close Date" value={formatDate(selectedDeal.expectedCloseDate)} />
          </div>
        </aside>
      ) : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-4">
          <form className="w-full max-w-lg rounded bg-white p-6 shadow-xl" onSubmit={handleSubmit}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-950">{modalMode === "edit" ? "Edit Deal" : "Add Deal"}</h2>
              <button aria-label="Close deal form" className="rounded p-1 text-gray-500 hover:bg-gray-100" onClick={() => setIsModalOpen(false)} type="button">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-gray-700">
                Deal Name
                <input className="h-10 rounded border border-gray-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" name="dealName" onChange={(event) => setForm({ ...form, dealName: event.target.value })} required value={form.dealName} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-gray-700">
                Amount
                <input className="h-10 rounded border border-gray-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" min="1" name="amount" onChange={(event) => setForm({ ...form, amount: event.target.value })} required type="number" value={form.amount} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-gray-700">
                Stage
                <select className="h-10 rounded border border-gray-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" name="stage" onChange={(event) => setForm({ ...form, stage: event.target.value })} value={form.stage}>
                  {stages.map((stage) => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-gray-700">
                Expected Close Date
                <input className="h-10 rounded border border-gray-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" name="expectedCloseDate" onChange={(event) => setForm({ ...form, expectedCloseDate: event.target.value })} required type="date" value={form.expectedCloseDate} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-gray-700">
                Company
                <select className="h-10 rounded border border-gray-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" name="companyId" onChange={(event) => setForm({ ...form, companyId: event.target.value })} value={form.companyId}>
                  <option value="">No company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-gray-700">
                Contact
                <select className="h-10 rounded border border-gray-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" name="contactId" onChange={(event) => setForm({ ...form, contactId: event.target.value })} value={form.contactId}>
                  <option value="">No contact</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>{contact.name}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-gray-700">
                Deal Owner
                <select className="h-10 rounded border border-gray-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" name="ownerId" onChange={(event) => setForm({ ...form, ownerId: event.target.value })} value={form.ownerId}>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>{owner.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button className="h-10 rounded-full px-5 text-sm font-semibold text-gray-600 hover:bg-gray-100" onClick={() => setIsModalOpen(false)} type="button">
                Cancel
              </button>
              <button className="h-10 rounded-full bg-emerald-500 px-5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60" disabled={isSaving || !form.ownerId} type="submit">
                {isSaving ? "Saving..." : modalMode === "edit" ? "Update Deal" : "Save Deal"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-gray-200 p-3">
      <dt className="text-xs font-semibold uppercase text-gray-500">{label}</dt>
      <dd className="mt-1 text-gray-950">{value}</dd>
    </div>
  );
}
