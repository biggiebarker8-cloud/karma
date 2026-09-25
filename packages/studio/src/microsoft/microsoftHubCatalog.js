const HUB_PAGES = Object.freeze([
  {
    id: 'products',
    title: 'Products',
    description: 'Core Microsoft products and platforms in one place.',
    cards: [
      {
        title: 'Microsoft 365',
        summary: 'Word, Excel, PowerPoint, Outlook, Teams, and Copilot experiences.',
        href: 'https://www.microsoft.com/en-us/microsoft-365',
        ctaLabel: 'View Microsoft 365',
      },
      {
        title: 'Windows',
        summary: 'Windows devices, Copilot+ PCs, security, and productivity features.',
        href: 'https://www.microsoft.com/en-us/windows',
        ctaLabel: 'Explore Windows',
      },
      {
        title: 'Surface',
        summary: 'Surface laptops, tablets, accessories, and hybrid work hardware.',
        href: 'https://www.microsoft.com/en-us/surface',
        ctaLabel: 'Browse Surface',
      },
      {
        title: 'Azure',
        summary: 'Cloud infrastructure, AI services, app hosting, and developer tools.',
        href: 'https://azure.microsoft.com/',
        ctaLabel: 'Visit Azure',
      },
      {
        title: 'Dynamics 365',
        summary: 'Business applications for sales, service, finance, and operations.',
        href: 'https://www.microsoft.com/en-us/dynamics-365',
        ctaLabel: 'See Dynamics 365',
      },
      {
        title: 'Power Platform',
        summary: 'Low-code apps, automation, copilots, analytics, and websites.',
        href: 'https://www.microsoft.com/en-us/power-platform',
        ctaLabel: 'Open Power Platform',
      },
      {
        title: 'Teams',
        summary: 'Meetings, chat, calling, collaboration, and team workspace tools.',
        href: 'https://www.microsoft.com/en-us/microsoft-teams/group-chat-software',
        ctaLabel: 'Open Teams',
      },
      {
        title: 'Xbox',
        summary: 'Gaming hardware, Game Pass, cloud gaming, and entertainment services.',
        href: 'https://www.xbox.com/',
        ctaLabel: 'Explore Xbox',
      },
    ],
  },
  {
    id: 'offers',
    title: 'Offers',
    description: 'Popular Microsoft commercial and consumer offers.',
    cards: [
      {
        title: 'Microsoft 365 plans',
        summary: 'Personal, family, and business subscriptions with desktop apps and Copilot features.',
        href: 'https://www.microsoft.com/en-us/microsoft-365/buy/compare-all-microsoft-365-products',
        ctaLabel: 'Compare plans',
      },
      {
        title: 'Azure free account',
        summary: 'Free credits and always-free services for Azure evaluation and development.',
        href: 'https://azure.microsoft.com/free/',
        ctaLabel: 'Get Azure free',
      },
      {
        title: 'Microsoft Store deals',
        summary: 'Hardware, accessories, and Microsoft software offers from the Microsoft Store.',
        href: 'https://www.microsoft.com/en-us/store/b/sale',
        ctaLabel: 'See store offers',
      },
      {
        title: 'Xbox Game Pass',
        summary: 'Console, PC, and cloud gaming memberships and rotating game library access.',
        href: 'https://www.xbox.com/xbox-game-pass',
        ctaLabel: 'View Game Pass',
      },
      {
        title: 'Copilot offers',
        summary: 'Copilot plans and add-ons across work and personal Microsoft experiences.',
        href: 'https://www.microsoft.com/en-us/microsoft-copilot',
        ctaLabel: 'Explore Copilot',
      },
    ],
  },
  {
    id: 'partners',
    title: 'Partner Programs',
    description: 'Programs and portals for resellers, builders, agencies, and startups.',
    cards: [
      {
        title: 'Microsoft AI Cloud Partner Program',
        summary: 'Membership, solution designations, incentives, and go-to-market resources.',
        href: 'https://partner.microsoft.com/en-us/partnership',
        ctaLabel: 'Open partner program',
      },
      {
        title: 'Partner Center',
        summary: 'Sales, customer, incentive, and marketplace management for partners.',
        href: 'https://partner.microsoft.com/en-us/dashboard/home',
        ctaLabel: 'Go to Partner Center',
      },
      {
        title: 'ISV Success',
        summary: 'Technical advisory, cloud credits, and marketplace acceleration for ISVs.',
        href: 'https://partner.microsoft.com/en-us/partnership/isv-success',
        ctaLabel: 'See ISV Success',
      },
      {
        title: 'Microsoft for Startups Founders Hub',
        summary: 'Startup credits, tooling, mentoring, and marketplace guidance.',
        href: 'https://www.microsoft.com/en-us/startups',
        ctaLabel: 'Visit Founders Hub',
      },
      {
        title: 'Commercial Marketplace',
        summary: 'Publish and sell SaaS apps, services, and offers through Microsoft channels.',
        href: 'https://learn.microsoft.com/en-us/partner-center/marketplace-offers/overview',
        ctaLabel: 'Review marketplace guidance',
      },
    ],
  },
  {
    id: 'learning',
    title: 'Learning',
    description: 'Microsoft training, certifications, and product learning hubs.',
    cards: [
      {
        title: 'Microsoft Learn',
        summary: 'Central learning platform for Microsoft products, roles, and scenarios.',
        href: 'https://learn.microsoft.com/',
        ctaLabel: 'Start learning',
      },
      {
        title: 'Credentials and certifications',
        summary: 'Role-based certification catalog, exam prep, and credential renewal.',
        href: 'https://learn.microsoft.com/en-us/credentials/',
        ctaLabel: 'View credentials',
      },
      {
        title: 'Azure training',
        summary: 'Azure architecture, AI, data, app, and infrastructure learning paths.',
        href: 'https://learn.microsoft.com/en-us/training/azure/',
        ctaLabel: 'Explore Azure training',
      },
      {
        title: 'Microsoft 365 training',
        summary: 'Admin, collaboration, security, and end-user training resources.',
        href: 'https://learn.microsoft.com/en-us/training/m365/',
        ctaLabel: 'Open Microsoft 365 learning',
      },
      {
        title: 'Power Platform training',
        summary: 'Power BI, Power Apps, Power Automate, and Copilot Studio learning paths.',
        href: 'https://learn.microsoft.com/en-us/training/powerplatform/',
        ctaLabel: 'Learn Power Platform',
      },
    ],
  },
  {
    id: 'apple',
    title: 'Apple & iOS',
    description: 'Apple-friendly access patterns for Microsoft services.',
    cards: [
      {
        title: 'Use browser-first entry points',
        summary: 'Prefer Microsoft web apps on iPhone, iPad, and Mac when native clients feel slow.',
        href: 'https://www.microsoft365.com/',
        ctaLabel: 'Open Microsoft 365 web',
      },
      {
        title: 'Teams on the web',
        summary: 'Use Teams web access in Safari or Chrome for fast meeting access from Apple devices.',
        href: 'https://www.microsoft.com/en-us/microsoft-teams/log-in',
        ctaLabel: 'Open Teams login',
      },
      {
        title: 'Outlook on the web',
        summary: 'Reach mail and calendar without relying on a heavy desktop or mobile install.',
        href: 'https://outlook.office.com/',
        ctaLabel: 'Open Outlook web',
      },
      {
        title: 'OneDrive web access',
        summary: 'Upload, preview, and share files from Safari with fewer native-app handoff issues.',
        href: 'https://onedrive.live.com/',
        ctaLabel: 'Open OneDrive',
      },
    ],
    iosRecommendations: [
      'Prefer Safari or Chrome web flows for quick access on iPhone and iPad.',
      'Use Add to Home Screen for web entry points you open often.',
      'Keep cards and actions touch-friendly with large tap targets and simple page switching.',
      'Avoid forcing desktop-only layouts for Microsoft resources on Apple devices.',
    ],
  },
]);

export function getMicrosoftHubCatalog() {
  return {
    id: 'microsoft-hub',
    title: 'Microsoft Hub',
    summary: 'A curated Microsoft directory with product, offer, partner, learning, and Apple-friendly pages.',
    pages: HUB_PAGES,
    iosExperience: {
      title: 'Apple-friendly access',
      summary: 'Microsoft services can feel smoother on Apple hardware when users start from web-first entry points and lightweight navigation.',
      installSuggestion: 'Offer Home Screen or bookmarks for frequently used Microsoft web experiences on iOS.',
      recommendations: HUB_PAGES.find((page) => page.id === 'apple')?.iosRecommendations || [],
    },
  };
}

export function getMicrosoftHubPage(pageId = '') {
  const catalog = getMicrosoftHubCatalog();
  return catalog.pages.find((page) => page.id === pageId) || null;
}
