export const adminWorkspaces = ["Gearswipe", "Gold Shore"] as const;

export type AdminWorkspace = (typeof adminWorkspaces)[number];

export type AdminQueueItem = {
  id: number;
  workspace: AdminWorkspace;
  title: string;
  owner: string;
  status: string;
  detail: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminStoreItem = {
  id: number;
  workspace: AdminWorkspace;
  name: string;
  channel: string;
  state: string;
  value: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminState = {
  queueItems: AdminQueueItem[];
  storeItems: AdminStoreItem[];
};

export const siteGraphLinks = [
  {
    label: "Gold Shore",
    href: "https://www.goldshore.ai",
    note: "Work and contracts",
  },
  {
    label: "Gold Shore admin",
    href: "https://admin.goldshore.ai",
    note: "Dashboards",
  },
  {
    label: "Banproof",
    href: "https://www.banproof.me",
    note: "Proof / verification",
  },
  {
    label: "Armsway",
    href: "https://www.armsway.com",
    note: "Independent client site",
  },
  {
    label: "R. Marston",
    href: "https://www.rmarston.com",
    note: "Portfolio",
  },
  {
    label: "Fortune Fund",
    href: "https://www.fortune-fund.com",
    note: "Separate finance brand",
  },
] as const;

export function seedAdminState(workspace: AdminWorkspace): AdminState {
  if (workspace === "Gold Shore") {
    return {
      queueItems: [
        {
          id: 1,
          workspace,
          title: "Contracts intake",
          owner: "Work intake",
          status: "Active",
          detail: "Route new project requests into the right lane quickly.",
        },
        {
          id: 2,
          workspace,
          title: "Document vault",
          owner: "Operations",
          status: "Ready",
          detail: "Store proposals, scopes, IDs, and delivery artifacts.",
        },
        {
          id: 3,
          workspace,
          title: "Trust review",
          owner: "Admin",
          status: "Pending",
          detail: "Keep identity, ownership, and business evidence together.",
        },
        {
          id: 4,
          workspace,
          title: "Maintenance",
          owner: "Engineering",
          status: "Scheduled",
          detail: "Track service health, worker checks, and backups.",
        },
      ],
      storeItems: [
        {
          id: 1,
          workspace,
          name: "Client contract intake",
          channel: "Workstream",
          state: "Active",
          value: "Inbound",
        },
        {
          id: 2,
          workspace,
          name: "Admin dashboard",
          channel: "Operations",
          state: "Ready",
          value: "Internal",
        },
        {
          id: 3,
          workspace,
          name: "Business verification kit",
          channel: "Trust",
          state: "Tracked",
          value: "Controlled",
        },
      ],
    };
  }

  return {
    queueItems: [
      {
        id: 1,
        workspace,
        title: "Licensing outreach",
        owner: "Sales ops",
        status: "Drafting",
        detail: "Follow up on activation, resale, and vendor approvals.",
      },
      {
        id: 2,
        workspace,
        title: "Document upload",
        owner: "Operations",
        status: "Ready",
        detail: "Store vendor packets, receipts, and compliance docs.",
      },
      {
        id: 3,
        workspace,
        title: "Business verification",
        owner: "Admin",
        status: "Pending",
        detail: "Keep the verification trail visible and auditable.",
      },
      {
        id: 4,
        workspace,
        title: "Maintenance",
        owner: "Engineering",
        status: "Scheduled",
        detail: "Track deploys, patches, backups, and origin checks.",
      },
    ],
    storeItems: [
      {
        id: 1,
        workspace,
        name: "Custom PC build",
        channel: "Storefront",
        state: "Featured",
        value: "From $1,499",
      },
      {
        id: 2,
        workspace,
        name: "Windows key",
        channel: "Digital license",
        state: "Instant",
        value: "From $5.49",
      },
      {
        id: 3,
        workspace,
        name: "YubiKey 5 NFC",
        channel: "Security hardware",
        state: "Tracked",
        value: "From $25",
      },
    ],
  };
}
