import { Building2, CircleDollarSign, ClipboardList, Trophy, TrendingUp, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";

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

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(value);
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function DashboardPage() {
  const [closedWon, activeDeals, pendingTasks, pipelineDeals, topSalesGroup, topClientGroup] = await Promise.all([
    prisma.deal.aggregate({
      where: { stage: "Closed Won" },
      _sum: { amount: true }
    }),
    prisma.deal.count({
      where: {
        stage: {
          notIn: ["Closed Won", "Closed Lost"]
        }
      }
    }),
    prisma.task.count({
      where: {
        status: {
          in: ["Pending", "In Progress"]
        }
      }
    }),
    prisma.deal.findMany({
      select: {
        stage: true,
        amount: true
      }
    }),
    prisma.deal.groupBy({
      by: ["ownerId"],
      _sum: { amount: true },
      orderBy: {
        _sum: {
          amount: "desc"
        }
      },
      take: 1
    }),
    prisma.deal.groupBy({
      by: ["companyId"],
      where: {
        companyId: {
          not: null
        }
      },
      _sum: { amount: true },
      orderBy: {
        _sum: {
          amount: "desc"
        }
      },
      take: 1
    })
  ]);

  const [topSalesUser, topClientCompany] = await Promise.all([
    topSalesGroup[0]
      ? prisma.user.findUnique({
          where: { id: topSalesGroup[0].ownerId }
        })
      : null,
    topClientGroup[0]?.companyId
      ? prisma.company.findUnique({
          where: { id: topClientGroup[0].companyId }
        })
      : null
  ]);

  const totalRevenue = Number(closedWon._sum.amount ?? 0);
  const topSalesValue = Number(topSalesGroup[0]?._sum.amount ?? 0);
  const topClientValue = Number(topClientGroup[0]?._sum.amount ?? 0);
  const totalsByStage = stages.map((stage) => ({
    stage,
    total: pipelineDeals
      .filter((deal) => deal.stage === stage)
      .reduce((sum, deal) => sum + Number(deal.amount), 0)
  }));
  const maxPipelineTotal = Math.max(...totalsByStage.map((item) => item.total), 1);

  return (
    <section className="min-h-[calc(100vh-73px)] bg-white px-8 py-7">
      <div>
        <h1 className="text-2xl font-semibold text-gray-950">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">A current read on revenue, pipeline, and activity.</p>
      </div>

      <div className="mt-7 grid gap-4 lg:grid-cols-3">
        <MetricCard
          icon={<CircleDollarSign className="h-5 w-5" />}
          label="Total Revenue"
          testId="metric-total-revenue"
          value={formatCurrency(totalRevenue)}
          numericValue={totalRevenue}
        />
        <MetricCard icon={<TrendingUp className="h-5 w-5" />} label="Active Deals" value={String(activeDeals)} />
        <MetricCard icon={<ClipboardList className="h-5 w-5" />} label="Pending Tasks" value={String(pendingTasks)} />
      </div>

      <div className="mt-8 grid items-stretch gap-4 lg:grid-cols-3">
        <section className="flex h-full flex-col lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-950">Pipeline Chart</h2>
            <span className="text-sm text-gray-500">Amount by stage</span>
          </div>
          <div className="mt-5 flex flex-1 items-end gap-4 border-b border-l border-gray-200 px-4 pb-4 pt-6">
            {totalsByStage.map((item) => (
              <div className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-3" key={item.stage}>
                <span className="text-xs font-semibold text-gray-700">{formatCurrency(item.total)}</span>
                <div className="flex min-h-52 flex-1 w-full items-end justify-center">
                  <div
                    aria-label={`${item.stage} total ${formatCurrency(item.total)}`}
                    className="w-full max-w-16 rounded-t bg-emerald-500 transition"
                    style={{ height: `${Math.max((item.total / maxPipelineTotal) * 100, item.total > 0 ? 6 : 0)}%` }}
                  />
                </div>
                <span className="h-10 text-center text-xs font-medium leading-4 text-gray-600">{item.stage}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid h-full grid-rows-2 gap-4">
          <InsightCard
            icon={<Trophy className="h-5 w-5" />}
            kicker="Top Performing Sales"
            label={topSalesUser?.name ?? "No sales data"}
            value={formatCurrency(topSalesValue)}
            helper="Total deal value"
          />
          <InsightCard
            icon={<Building2 className="h-5 w-5" />}
            kicker="Top Client by Deal Value"
            label={topClientCompany?.name ?? "No client data"}
            value={formatCurrency(topClientValue)}
            helper="Total deal value"
          />
        </section>
      </div>
    </section>
  );
}

function InsightCard({
  icon,
  kicker,
  label,
  value,
  helper
}: {
  icon: ReactNode;
  kicker: string;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <section className="rounded border border-gray-200 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded bg-emerald-100 text-emerald-700">{icon}</div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">{helper}</span>
      </div>
      <p className="mt-5 text-sm font-medium text-gray-500">{kicker}</p>
      <div className="mt-3 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
          <UserRound className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-gray-950">{label}</h3>
          <p className="mt-1 text-2xl font-semibold text-emerald-700">{value}</p>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  icon,
  label,
  value,
  numericValue,
  testId
}: {
  icon: ReactNode;
  label: string;
  value: string;
  numericValue?: number;
  testId?: string;
}) {
  return (
    <section className="rounded border border-gray-200 p-5" data-testid={testId} data-value={numericValue}>
      <div className="flex h-10 w-10 items-center justify-center rounded bg-emerald-100 text-emerald-700">{icon}</div>
      <p className="mt-5 text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-950">{value}</p>
    </section>
  );
}
