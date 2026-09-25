const HUB_PAGES = Object.freeze([
  {
    id: 'products',
    aliases: ['product', 'products-page'],
    title: 'Products',
    description: 'Core Microsoft products and platforms.',
    cards: [
      {
        title: 'Microsoft 365',
        summary: 'Office apps, Teams, and productivity services.',
        href: 'https://www.microsoft.com/en-us/microsoft-365',
        ctaLabel: 'Open Microsoft 365',
      },
      {
        title: 'Windows',
        summary: 'Windows devices, features, and security.',
        href: 'https://www.microsoft.com/en-us/windows',
        ctaLabel: 'Open Windows',
      },
      {
        title: 'Surface',
        summary: 'Surface devices and accessories.',
        href: 'https://www.microsoft.com/en-us/surface',
        ctaLabel: 'Open Surface',
      },
    ],
  },
  {
    id: 'business',
    aliases: ['business-solutions', 'business-apps'],
    title: 'Business',
    description: 'Microsoft business productivity and operations tools.',
    cards: [
      {
        title: 'Microsoft 365 for business',
        summary: 'Commercial plans for collaboration and productivity.',
        href: 'https://www.microsoft.com/en-us/microsoft-365/business',
        ctaLabel: 'View business plans',
      },
      {
        title: 'Dynamics 365',
        summary: 'CRM and ERP business applications.',
        href: 'https://www.microsoft.com/en-us/dynamics-365',
        ctaLabel: 'Explore Dynamics 365',
      },
      {
        title: 'Power Platform',
        summary: 'Low-code apps, automation, and analytics.',
        href: 'https://www.microsoft.com/en-us/power-platform',
        ctaLabel: 'Explore Power Platform',
      },
    ],
  },
  {
    id: 'cloud',
    aliases: ['azure', 'cloud-services'],
    title: 'Cloud',
    description: 'Microsoft cloud platform and cloud operations resources.',
    cards: [
      {
        title: 'Azure',
        summary: 'Cloud services for apps, AI, and infrastructure.',
        href: 'https://azure.microsoft.com/',
        ctaLabel: 'Open Azure',
      },
      {
        title: 'Azure architecture center',
        summary: 'Reference architectures and best practices.',
        href: 'https://learn.microsoft.com/en-us/azure/architecture/',
        ctaLabel: 'View architecture center',
      },
      {
        title: 'Microsoft Cloud',
        summary: 'Cloud portfolio overview for business use cases.',
        href: 'https://www.microsoft.com/en-us/microsoft-cloud',
        ctaLabel: 'Open Microsoft Cloud',
      },
    ],
  },
  {
    id: 'copilots',
    aliases: ['copilot', 'ai'],
    title: 'Copilots & AI',
    description: 'Microsoft AI copilots and related platforms.',
    cards: [
      {
        title: 'Microsoft Copilot',
        summary: 'Copilot products and experiences across Microsoft apps.',
        href: 'https://www.microsoft.com/en-us/microsoft-copilot',
        ctaLabel: 'Explore Microsoft Copilot',
      },
      {
        title: 'Copilot for Microsoft 365',
        summary: 'Workplace productivity copilots for Microsoft 365.',
        href: 'https://www.microsoft.com/en-us/microsoft-365/copilot',
        ctaLabel: 'View Microsoft 365 Copilot',
      },
      {
        title: 'Security Copilot',
        summary: 'AI-assisted security operations and response.',
        href: 'https://www.microsoft.com/en-us/security/business/ai-machine-learning/microsoft-security-copilot',
        ctaLabel: 'Open Security Copilot',
      },
    ],
  },
  {
    id: 'visual-suite',
    aliases: ['developer', 'dev-tools', 'visual-studio'],
    title: 'Developer & Visual Suite',
    description: 'Microsoft developer tools and Visual Studio family resources.',
    cards: [
      {
        title: 'Visual Studio',
        summary: 'Integrated development environment for Windows and .NET.',
        href: 'https://visualstudio.microsoft.com/',
        ctaLabel: 'Open Visual Studio',
      },
      {
        title: 'Visual Studio Code',
        summary: 'Cross-platform code editor and extensions.',
        href: 'https://code.visualstudio.com/',
        ctaLabel: 'Open VS Code',
      },
      {
        title: '.NET',
        summary: 'Developer platform for cloud, web, desktop, and mobile apps.',
        href: 'https://dotnet.microsoft.com/',
        ctaLabel: 'Open .NET',
      },
      {
        title: 'GitHub Copilot',
        summary: 'AI coding assistant for developer workflows.',
        href: 'https://github.com/features/copilot',
        ctaLabel: 'Open GitHub Copilot',
      },
    ],
  },
  {
    id: 'partner',
    aliases: ['partners', 'partner-programs'],
    title: 'Partner Programs',
    description: 'Microsoft partner enrollment and partner resources.',
    cards: [
      {
        title: 'Microsoft AI Cloud Partner Program',
        summary: 'Program details and partner growth paths.',
        href: 'https://partner.microsoft.com/en-us/partnership',
        ctaLabel: 'View partner program',
      },
      {
        title: 'Partner Center',
        summary: 'Operations and account management for partners.',
        href: 'https://partner.microsoft.com/dashboard',
        ctaLabel: 'Open Partner Center',
      },
    ],
  },
  {
    id: 'learning',
    aliases: ['learn', 'training'],
    title: 'Learning',
    description: 'Microsoft learning and certification resources.',
    cards: [
      {
        title: 'Microsoft Learn',
        summary: 'Role-based training paths and technical modules.',
        href: 'https://learn.microsoft.com/',
        ctaLabel: 'Open Microsoft Learn',
      },
      {
        title: 'Microsoft credentials',
        summary: 'Certification and credential catalog.',
        href: 'https://learn.microsoft.com/en-us/credentials/',
        ctaLabel: 'View credentials',
      },
    ],
  },
  {
    id: 'contact',
    aliases: ['contacts', 'support', 'contact-details'],
    title: 'Microsoft Contact Details',
    description: 'Official Microsoft contact and support entry points.',
    cards: [
      {
        title: 'Microsoft Support',
        summary: 'Get product help, troubleshooting, and support options.',
        href: 'https://support.microsoft.com/',
        ctaLabel: 'Open Microsoft Support',
      },
      {
        title: 'Contact Microsoft sales',
        summary: 'Reach Microsoft sales for commercial and enterprise inquiries.',
        href: 'https://www.microsoft.com/en-us/store/b/business?icid=CNavBusinessStore',
        ctaLabel: 'Contact sales',
      },
      {
        title: 'Azure support options',
        summary: 'Support plans and ticket routing for Azure workloads.',
        href: 'https://azure.microsoft.com/en-us/support/options/',
        ctaLabel: 'View Azure support',
      },
      {
        title: 'Global customer service phone numbers',
        summary: 'Region-specific Microsoft customer service phone list.',
        href: 'https://support.microsoft.com/en-us/contactus/',
        ctaLabel: 'Find phone numbers',
      },
    ],
  },
  {
    id: 'apple',
    aliases: ['ios', 'iphone', 'ipad', 'mac'],
    title: 'Apple & iOS',
    description: 'Microsoft services and install guidance for Apple devices.',
    cards: [
      {
        title: 'Microsoft 365 for iPhone and iPad',
        summary: 'Office apps and workflows on iOS and iPadOS.',
        href: 'https://www.microsoft.com/en-us/microsoft-365/mobile/microsoft-365-mobile-apps-for-ios',
        ctaLabel: 'Open iOS apps',
      },
      {
        title: 'Outlook for iOS',
        summary: 'Email and calendar experience on iPhone and iPad.',
        href: 'https://www.microsoft.com/en-us/microsoft-365/outlook-mobile-for-iphone-and-android',
        ctaLabel: 'Open Outlook mobile',
      },
      {
        title: 'Microsoft 365 for Mac',
        summary: 'Office apps and subscriptions for macOS.',
        href: 'https://www.microsoft.com/en-us/microsoft-365/mac',
        ctaLabel: 'Open Microsoft 365 for Mac',
      },
    ],
  },
]);

const PAGE_ALIAS_LOOKUP = HUB_PAGES.reduce((lookup, page) => {
  lookup.set(page.id.toLowerCase(), page.id);
  if (Array.isArray(page.aliases)) {
    page.aliases.forEach((alias) => lookup.set(alias.toLowerCase(), page.id));
  }
  return lookup;
}, new Map());

const HUB_CATALOG = Object.freeze({
  title: 'Microsoft knowledge base',
  summary: 'Curated Microsoft pages for products, business, cloud, copilots, developer tools, learning, and contact resources.',
  featuredTopics: [
    'Microsoft 365',
    'Azure',
    'Microsoft Copilot',
    'Visual Studio',
    'Microsoft Learn',
    'Support',
  ],
  pages: HUB_PAGES,
  iosExperience: {
    title: 'Apple and iOS guidance',
    summary: 'Use Microsoft web and mobile apps for the best iPhone, iPad, and Mac experience.',
    installSuggestion: 'On iPhone/iPad Safari, use Share → Add to Home Screen for quick app-like access.',
    recommendations: [
      'Prefer official Microsoft web and App Store links.',
      'Use managed account sign-in where required by your organization.',
      'Use iOS and macOS update channels for compatibility and security.',
    ],
  },
  knowledgeBaseNotes: [
    'Pages are curated entry points into official Microsoft resources.',
    'Use the contact page for support, sales, and regional customer service links.',
    'Prefer web-first links for Apple mobile compatibility.',
  ],
});

function normalizePageId(pageId) {
  if (typeof pageId !== 'string') {
    return null;
  }

  const normalized = pageId.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return PAGE_ALIAS_LOOKUP.get(normalized) || null;
}

export function getMicrosoftHubCatalog() {
  return HUB_CATALOG;
}

export function getMicrosoftHubPage(pageId) {
  const normalizedPageId = normalizePageId(pageId);
  if (!normalizedPageId) {
    return null;
  }

  return HUB_PAGES.find((page) => page.id === normalizedPageId) || null;
}
