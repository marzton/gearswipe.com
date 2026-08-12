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

export type AdminVendorItem = {
  id: number;
  workspace: AdminWorkspace;
  company: string;
  vendorType: string;
  contactName: string;
  contactTitle: string;
  email: string;
  phone: string;
  website: string;
  territory: string;
  productCategories: string;
  minimumOrderRequirements: string;
  dealerResellerApplicationUrl: string;
  currentRelationshipStatus: string;
  documents: string;
  catalogApiAvailability: string;
  productImageRights: string;
  trademarkLogoPermissions: string;
  pricingFeedPermissions: string;
  aiDataProcessingPermissions: string;
  agreementEffectiveDate: string;
  agreementExpirationDate: string;
  aiVendorBrief: string;
  outreachEmail: string;
  requestedPermissions: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminState = {
  queueItems: AdminQueueItem[];
  storeItems: AdminStoreItem[];
  vendorItems: AdminVendorItem[];
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

export const mailRouteMatrix = [
  {
    purpose: "Gearswipe support",
    address: "support@gearswipe.com",
    route: "Gearswipe / contact",
    targets: "support@gearswipe.com, ops@gearswipe.com",
    provider: "Cloudflare Email Routing → HostGator inboxes",
  },
  {
    purpose: "Gearswipe launches",
    address: "updates@gearswipe.com",
    route: "Gearswipe / subscribe",
    targets: "updates@gearswipe.com",
    provider: "Cloudflare Email Sending + Routing",
  },
  {
    purpose: "Gearswipe login help",
    address: "access@gearswipe.com",
    route: "Gearswipe / auth",
    targets: "access@gearswipe.com, admin@gearswipe.com",
    provider: "Cloudflare Email Routing → HostGator inboxes",
  },
  {
    purpose: "Gearswipe checkout support",
    address: "orders@gearswipe.com",
    route: "Gearswipe / support",
    targets: "orders@gearswipe.com, ops@gearswipe.com",
    provider: "Cloudflare Email Routing → HostGator inboxes",
  },
  {
    purpose: "Gearswipe quotes",
    address: "quotes@gearswipe.com",
    route: "Gearswipe / quote",
    targets: "quotes@gearswipe.com, ops@gearswipe.com",
    provider: "Cloudflare Email Sending + Routing",
  },
  {
    purpose: "Gold Shore work intake",
    address: "contact@goldshore.ai",
    route: "Gold Shore / contact",
    targets: "contact@goldshore.ai, ops@goldshore.ai",
    provider: "Cloudflare Email Routing → HostGator inboxes",
  },
  {
    purpose: "Gold Shore newsletter",
    address: "newsletter@goldshore.ai",
    route: "Gold Shore / subscribe",
    targets: "newsletter@goldshore.ai",
    provider: "Cloudflare Email Sending + Routing",
  },
  {
    purpose: "Gold Shore admin",
    address: "admin@goldshore.ai",
    route: "Gold Shore / auth",
    targets: "admin@goldshore.ai, ops@goldshore.ai",
    provider: "Cloudflare Email Routing → HostGator inboxes",
  },
  {
    purpose: "Gold Shore checkout support",
    address: "orders@goldshore.ai",
    route: "Gold Shore / support",
    targets: "orders@goldshore.ai, ops@goldshore.ai",
    provider: "Cloudflare Email Routing → HostGator inboxes",
  },
] as const;

export const emailSetupChecklist = [
  "Enable Cloudflare Email Sending for the sending domains.",
  "Create Cloudflare Email Routing rules for each public inbox.",
  "Verify HostGator destination mailboxes before forwarding.",
  "Publish SPF, DKIM, and DMARC records for sending alignment.",
  "Keep transactional notifications separate from newsletter mail.",
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
      vendorItems: [
        {
          id: 1,
          workspace,
          company: "Gold Shore Contract Services",
          vendorType: "Distributor",
          contactName: "Operations Desk",
          contactTitle: "Partnership Intake",
          email: "partnerships@goldshore.ai",
          phone: "",
          website: "https://www.goldshore.ai",
          territory: "US",
          productCategories: "Services, contracts, infrastructure",
          minimumOrderRequirements: "Project-based",
          dealerResellerApplicationUrl: "https://www.goldshore.ai/contact",
          currentRelationshipStatus: "Active Vendor",
          documents: "MSA, SOW, NDA",
          catalogApiAvailability: "No",
          productImageRights: "Pending",
          trademarkLogoPermissions: "Pending",
          pricingFeedPermissions: "Pending",
          aiDataProcessingPermissions: "Pending",
          agreementEffectiveDate: "2026-08-01",
          agreementExpirationDate: "2027-08-01",
          aiVendorBrief: "Trusted internal services and contract support.",
          outreachEmail: "Already active relationship",
          requestedPermissions: "N/A",
          notes: "Gold Shore internal alignment record.",
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
    vendorItems: [
      {
        id: 1,
        workspace,
        company: "Dell Technologies",
        vendorType: "Manufacturer",
        contactName: "Channel Partnerships",
        contactTitle: "Dealer Programs",
        email: "dealer@dell.com",
        phone: "+1 (800) 999-3355",
        website: "https://www.dell.com",
        territory: "North America",
        productCategories: "Laptops, desktops, monitors, accessories",
        minimumOrderRequirements: "Dealer application required",
        dealerResellerApplicationUrl: "https://www.dell.com/partner",
        currentRelationshipStatus: "Prospect",
        documents: "Brand guidelines, dealer terms, MAP policy",
        catalogApiAvailability: "Yes",
        productImageRights: "Pending",
        trademarkLogoPermissions: "Pending",
        pricingFeedPermissions: "Pending",
        aiDataProcessingPermissions: "Pending",
        agreementEffectiveDate: "",
        agreementExpirationDate: "",
        aiVendorBrief:
          "Large manufacturer with an established dealer channel. Likely need channel partnerships, reseller program, or distribution contact.",
        outreachEmail: "",
        requestedPermissions:
          "Authorized reseller/dealer status; permission to advertise products; product catalog/feed access; product photography/media usage; brand/logo usage; technical specifications; AI-assisted catalog ingestion",
        notes: "Initial target for Gearswipe retail and product data licensing.",
      },
      {
        id: 2,
        workspace,
        company: "Yubico",
        vendorType: "Manufacturer",
        contactName: "Partner Programs",
        contactTitle: "Channel Sales",
        email: "partners@yubico.com",
        phone: "",
        website: "https://www.yubico.com",
        territory: "Global",
        productCategories: "Security keys, identity hardware",
        minimumOrderRequirements: "Reseller program terms apply",
        dealerResellerApplicationUrl: "https://www.yubico.com/partners/",
        currentRelationshipStatus: "Negotiating",
        documents: "Dealer application, image license request",
        catalogApiAvailability: "Yes",
        productImageRights: "Pending",
        trademarkLogoPermissions: "Pending",
        pricingFeedPermissions: "Pending",
        aiDataProcessingPermissions: "Pending",
        agreementEffectiveDate: "",
        agreementExpirationDate: "",
        aiVendorBrief:
          "Identity and security hardware vendor with likely reseller onboarding and media usage requirements.",
        outreachEmail: "",
        requestedPermissions:
          "Authorized reseller/dealer status; permission to advertise products; product catalog/feed access; product photography/media usage; brand/logo usage; technical specifications; warranty support; AI-assisted catalog ingestion",
        notes: "Good fit for admin auth and security hardware catalog lines.",
      },
    ],
  };
}
