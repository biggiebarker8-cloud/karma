const HUB_PAGES = Object.freeze([
  {
    id: 'products',
    aliases: ['product', 'products-page'],
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
    id: 'business',
    aliases: ['business-apps', 'business', 'business-solutions'],
    title: 'Business',
    description: 'Business applications, workplace tools, and commercial productivity solutions.',
    cards: [
      {
        title: 'Microsoft 365 for business',
        summary: 'Commercial plans for email, collaboration, security, device management, and Copilot at work.',
        href: 'https://www.microsoft.com/en-us/microsoft-365/business',
        ctaLabel: 'See business plans',
      },
      {
        title: 'Dynamics 365',
        summary: 'CRM and ERP workloads for sales, service, finance, operations, and commerce teams.',
        href: 'https://www.microsoft.com/en-us/dynamics-365',
        ctaLabel: 'Explore Dynamics 365',
      },
      {
        title: 'Power Platform',
        summary: 'Low-code app building, workflow automation, analytics, agents, and websites.',
        href: 'https://www.microsoft.com/en-us/power-platform',
        ctaLabel: 'Open Power Platform',
      },
      {
        title: 'Teams for business',
        summary: 'Meetings, calling, frontline coordination, chat, and collaborative workspaces.',
        href: 'https://www.microsoft.com/en-us/microsoft-teams/small-medium-business',
        ctaLabel: 'View Teams business',
      },
      {
        title: 'Microsoft Viva',
        summary: 'Employee experience, learning, communications, goals, and knowledge tools.',
        href: 'https://www.microsoft.com/en-us/microsoft-viva',
        ctaLabel: 'See Viva',
      },
      {
        title: 'Business decision makers hub',
        summary: 'Commercial solution guidance across security, AI, productivity, and cloud transformation.',
        href: 'https://www.microsoft.com/en-us/business',
        ctaLabel: 'Visit Microsoft Business',
      },
    ],
  },
  {
    id: 'cloud',
    aliases: ['azure-cloud', 'cloud-platform', 'azure'],
    title: 'Cloud',
    description: 'Cloud infrastructure, AI, data, security, and developer services across Microsoft Cloud.',
    cards: [
      {
        title: 'Azure',
        summary: 'Core cloud platform for compute, networking, storage, app services, and operations.',
        href: 'https://azure.microsoft.com/',
        ctaLabel: 'Open Azure',
      },
      {
        title: 'Azure AI',
        summary: 'Azure AI services, machine learning, AI Studio, and enterprise AI deployment guidance.',
        href: 'https://azure.microsoft.com/en-us/products/ai-services',
        ctaLabel: 'Explore Azure AI',
      },
      {
        title: 'Azure architecture center',
        summary: 'Reference architectures, solution ideas, and best-practice cloud design guidance.',
        href: 'https://learn.microsoft.com/en-us/azure/architecture/',
        ctaLabel: 'Read architecture guidance',
      },
      {
        title: 'Azure pricing and offers',
        summary: 'Cloud pricing, calculators, free services, and commercial offer details.',
        href: 'https://azure.microsoft.com/en-us/pricing/',
        ctaLabel: 'View Azure pricing',
      },
      {
        title: 'Microsoft Cloud for industries',
        summary: 'Industry clouds for healthcare, retail, nonprofit, financial services, and more.',
        href: 'https://www.microsoft.com/en-us/industry',
        ctaLabel: 'Browse industry clouds',
      },
      {
        title: 'Azure training',
        summary: 'Cloud, AI, data, and infrastructure learning paths for architects, admins, and developers.',
        href: 'https://learn.microsoft.com/en-us/training/azure/',
        ctaLabel: 'Start Azure learning',
      },
    ],
  },
  {
    id: 'copilots',
    aliases: ['copilot', 'ai-copilots', 'microsoft-copilot'],
    title: 'Copilots & AI',
    description: 'Different Microsoft Copilot experiences, copilots for work, and AI builder tools.',
    cards: [
      {
        title: 'Microsoft Copilot',
        summary: 'The general Microsoft Copilot experience for chat, search, writing, and everyday assistance.',
        href: 'https://www.microsoft.com/en-us/microsoft-copilot',
        ctaLabel: 'Open Microsoft Copilot',
      },
      {
        title: 'Microsoft 365 Copilot',
        summary: 'Copilot inside Word, Excel, PowerPoint, Outlook, Teams, and other Microsoft 365 workflows.',
        href: 'https://www.microsoft.com/en-us/microsoft-365/copilot',
        ctaLabel: 'Explore Microsoft 365 Copilot',
      },
      {
        title: 'Copilot Studio',
        summary: 'Build custom copilots, automate conversations, and connect data and business workflows.',
        href: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio',
        ctaLabel: 'Open Copilot Studio',
      },
      {
        title: 'GitHub Copilot',
        summary: 'AI pair programming, code completion, chat, agent workflows, and developer productivity features.',
        href: 'https://github.com/features/copilot',
        ctaLabel: 'View GitHub Copilot',
      },
      {
        title: 'Security Copilot',
        summary: 'AI assistance for incident response, threat hunting, and security operations workflows.',
        href: 'https://www.microsoft.com/en-us/security/business/ai-machine-learning/microsoft-security-copilot',
        ctaLabel: 'See Security Copilot',
      },
      {
        title: 'Azure AI Foundry',
        summary: 'Enterprise AI platform for models, orchestration, evaluation, and application delivery.',
        href: 'https://azure.microsoft.com/en-us/products/ai-foundry',
        ctaLabel: 'Explore Azure AI Foundry',
      },
    ],
  },
  {
    id: 'offers',
    aliases: ['deals', 'promotions'],
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
    aliases: ['partner-programs', 'partners-page'],
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
    id: 'contact',
    aliases: ['contacts', 'support', 'support-page', 'microsoft-contact-details'],
    title: 'Contact Microsoft',
    description: 'Official Microsoft contact entry points for support, sales, accessibility, and partner help.',
    cards: [
      {
        title: 'Microsoft Support',
        summary: 'Get help for Microsoft 365, Windows, Office, Xbox, Surface, billing, and account issues.',
        href: 'https://support.microsoft.com/contactus',
        ctaLabel: 'Open Microsoft Support',
      },
      {
        title: 'Contact Microsoft Sales',
        summary: 'Reach Microsoft sales teams for cloud, security, Copilot, and commercial solution inquiries.',
        href: 'https://www.microsoft.com/en-us/microsoft-cloud/contact-sales',
        ctaLabel: 'Contact sales',
      },
      {
        title: 'Azure support options',
        summary: 'Review Azure technical support plans, billing help, and support request entry points.',
        href: 'https://azure.microsoft.com/en-us/support/options/',
        ctaLabel: 'View Azure support',
      },
      {
        title: 'Accessibility support',
        summary: 'Find disability answer desk resources, accessibility help, and inclusive product support.',
        href: 'https://www.microsoft.com/en-us/accessibility/disability-answer-desk',
        ctaLabel: 'Get accessibility help',
      },
      {
        title: 'Microsoft Store support',
        summary: 'Get help with Microsoft Store orders, subscriptions, devices, returns, and payment issues.',
        href: 'https://support.microsoft.com/microsoft-store-and-billing',
        ctaLabel: 'Open Store support',
      },
      {
        title: 'Partner support',
        summary: 'Access Partner Center help, support requests, and partner program assistance resources.',
        href: 'https://partner.microsoft.com/en-us/support',
        ctaLabel: 'Open partner support',
      },
    ],
  },
  {
    id: 'developer',
    aliases: ['developers', 'visual-suite', 'visual-studio-suite', 'dev-tools'],
    title: 'Developer & Visual Suite',
    description: 'Developer platforms, Visual Studio tools, app frameworks, and engineering productivity resources.',
    cards: [
      {
        title: 'Visual Studio',
        summary: 'Full IDE for .NET, C++, Azure development, debugging, testing, and enterprise engineering workflows.',
        href: 'https://visualstudio.microsoft.com/',
        ctaLabel: 'Open Visual Studio',
      },
      {
        title: 'Visual Studio Code',
        summary: 'Lightweight editor with extensions, AI tooling, debugging, terminals, and cross-platform workflows.',
        href: 'https://code.visualstudio.com/',
        ctaLabel: 'Open VS Code',
      },
      {
        title: '.NET',
        summary: 'Developer platform for web, cloud, desktop, mobile, gaming, and AI application development.',
        href: 'https://dotnet.microsoft.com/',
        ctaLabel: 'Explore .NET',
      },
      {
        title: 'Azure developer tools',
        summary: 'Developer services and SDK guidance for app delivery, deployment, containers, and cloud operations.',
        href: 'https://azure.microsoft.com/en-us/products/developer-tools',
        ctaLabel: 'View Azure developer tools',
      },
      {
        title: 'Microsoft Dev Box',
        summary: 'Cloud-based developer workstations for secure, repeatable, enterprise development environments.',
        href: 'https://azure.microsoft.com/en-us/products/dev-box',
        ctaLabel: 'See Dev Box',
      },
      {
        title: 'Power Platform developer center',
        summary: 'Low-code and pro-code resources for Power Apps, Power Automate, Dataverse, and integrations.',
        href: 'https://learn.microsoft.com/en-us/power-platform/developer/',
        ctaLabel: 'Open developer center',
      },
    ],
  },
  {
    id: 'learning',
    aliases: ['learning-resources', 'training'],
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
    aliases: ['apple-ios', 'ios', 'apple-and-ios'],
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
    title: 'Microsoft Knowledge Base',
    summary:
      'A curated Microsoft knowledge base with business, cloud, Copilot, developer, product, offer, partner, contact, learning, and Apple-friendly pages.',
    featuredTopics: [
      'Microsoft 365',
      'Dynamics 365',
      'Power Platform',
      'Azure',
      'Microsoft Copilot',
      'GitHub Copilot',
      'Visual Studio',
      'Visual Studio Code',
      'Microsoft Cloud',
      'Microsoft Support',
      'Partner programs',
      'Microsoft Learn',
    ],
    pages: HUB_PAGES,
    iosExperience: {
      title: 'Apple-friendly access',
      summary: 'Microsoft services can feel smoother on Apple hardware when users start from web-first entry points and lightweight navigation.',
      installSuggestion: 'Offer Home Screen or bookmarks for frequently used Microsoft web experiences on iOS.',
      recommendations: HUB_PAGES.find((page) => page.id === 'apple')?.iosRecommendations || [],
    },
    knowledgeBaseNotes: [
      'Use these sections as a curated starting point rather than a full offline copy of Microsoft documentation.',
      'Each page combines direct product entry points with official Microsoft Learn or partner guidance when available.',
      'Business, cloud, Copilot, contact, and developer sections highlight Microsoft commercial workloads, support paths, AI tools, and Visual Studio resources.',
    ],
  };
}

export function getMicrosoftHubPage(pageId = '') {
  const catalog = getMicrosoftHubCatalog();
  const normalize = (value) =>
    String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  const normalizedPageId = normalize(pageId);

  return (
    catalog.pages.find((page) => {
      const aliases = Array.isArray(page.aliases) ? page.aliases : [];
      return [page.id, page.title, ...aliases].some(
        (candidate) => normalize(candidate) === normalizedPageId,
      );
    }) || null
  );
}
