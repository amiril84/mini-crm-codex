"use client";

import { Building2, Plus, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

export type CompanyRow = {
  id: string;
  name: string;
  phone: string;
  website: string;
  ownerName: string;
  createdAt: string;
  contactsCount: number;
  dealsCount: number;
};

export type OwnerOption = {
  id: string;
  name: string;
};

type FormState = {
  name: string;
  phone: string;
  website: string;
  ownerId: string;
};

const emptyForm = (ownerId: string): FormState => ({
  name: "",
  phone: "",
  website: "",
  ownerId
});

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

export function CompaniesClient({
  initialCompanies,
  owners
}: {
  initialCompanies: CompanyRow[];
  owners: OwnerOption[];
}) {
  const defaultOwnerId = owners[0]?.id ?? "";
  const [companies, setCompanies] = useState(initialCompanies);
  const [selectedCompany, setSelectedCompany] = useState<CompanyRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<FormState>(() => emptyForm(defaultOwnerId));

  const selectedOwnerName = useMemo(
    () => owners.find((owner) => owner.id === form.ownerId)?.name ?? "",
    [form.ownerId, owners]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const response = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setIsSaving(false);

    if (!response.ok) {
      return;
    }

    const createdCompany = (await response.json()) as CompanyRow;
    setCompanies((current) => [createdCompany, ...current]);
    setSelectedCompany(createdCompany);
    setForm(emptyForm(defaultOwnerId));
    setIsModalOpen(false);
  }

  return (
    <section className="min-h-[calc(100vh-73px)] bg-white px-8 py-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">Companies</h1>
          <p className="mt-1 text-sm text-gray-500">Manage organizations and account ownership.</p>
        </div>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          onClick={() => setIsModalOpen(true)}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Company
        </button>
      </div>

      <div className="mt-7 overflow-hidden border-y border-gray-200">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="w-12 px-4 py-3">
                <input aria-label="Select all companies" className="h-4 w-4 rounded border-gray-300" type="checkbox" />
              </th>
              <th className="px-4 py-3">Company Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Website</th>
              <th className="px-4 py-3">Company Owner</th>
              <th className="px-4 py-3">Created Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {companies.map((company) => (
              <tr
                className="cursor-pointer transition hover:bg-emerald-50/60"
                key={company.id}
                onClick={() => setSelectedCompany(company)}
              >
                <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                  <input aria-label={`Select ${company.name}`} className="h-4 w-4 rounded border-gray-300" type="checkbox" />
                </td>
                <td className="px-4 py-4 font-medium text-gray-950">{company.name}</td>
                <td className="px-4 py-4 text-gray-600">{company.phone}</td>
                <td className="px-4 py-4 text-emerald-700">{company.website}</td>
                <td className="px-4 py-4 text-gray-700">{company.ownerName}</td>
                <td className="px-4 py-4 text-gray-500">{formatDate(company.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-4">
          <form className="w-full max-w-lg rounded bg-white p-6 shadow-xl" onSubmit={handleSubmit}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-950">Add Company</h2>
              <button aria-label="Close company form" className="rounded p-1 text-gray-500 hover:bg-gray-100" onClick={() => setIsModalOpen(false)} type="button">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-gray-700">
                Company Name
                <input className="h-10 rounded border border-gray-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" name="companyName" onChange={(event) => setForm({ ...form, name: event.target.value })} required value={form.name} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-gray-700">
                Phone
                <input className="h-10 rounded border border-gray-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" name="phone" onChange={(event) => setForm({ ...form, phone: event.target.value })} required value={form.phone} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-gray-700">
                Website
                <input className="h-10 rounded border border-gray-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" name="website" onChange={(event) => setForm({ ...form, website: event.target.value })} required value={form.website} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-gray-700">
                Company Owner
                <select className="h-10 rounded border border-gray-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" name="ownerId" onChange={(event) => setForm({ ...form, ownerId: event.target.value })} value={form.ownerId}>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button className="h-10 rounded-full px-5 text-sm font-semibold text-gray-600 hover:bg-gray-100" onClick={() => setIsModalOpen(false)} type="button">
                Cancel
              </button>
              <button className="h-10 rounded-full bg-emerald-500 px-5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60" disabled={isSaving || !selectedOwnerName} type="submit">
                {isSaving ? "Saving..." : "Save Company"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {selectedCompany ? (
        <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-md border-l border-gray-200 bg-white p-6 shadow-2xl" aria-label="Company detail panel">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded bg-emerald-100 text-emerald-700">
                <Building2 className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-gray-950">{selectedCompany.name}</h2>
              <p className="mt-1 text-sm text-gray-500">Read-only company detail</p>
            </div>
            <button aria-label="Close company detail" className="rounded p-1 text-gray-500 hover:bg-gray-100" onClick={() => setSelectedCompany(null)} type="button">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-6 grid gap-4 text-sm">
            <Detail label="Phone" value={selectedCompany.phone} />
            <Detail label="Website" value={selectedCompany.website} />
            <Detail label="Company Owner" value={selectedCompany.ownerName} />
            <Detail label="Created Time" value={formatDate(selectedCompany.createdAt)} />
            <Detail label="Related Contacts" value={String(selectedCompany.contactsCount)} />
            <Detail label="Related Deals" value={String(selectedCompany.dealsCount)} />
          </div>
        </aside>
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
