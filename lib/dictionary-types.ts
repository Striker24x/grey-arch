export type TitleBody = {
  title: string;
  body: string;
};

export type TitleDescription = {
  title: string;
  description: string;
};

export type ProcessStep = {
  title: string;
  description: string;
};

export type ServiceItem = {
  id: string;
  title: string;
  description: string;
  includes?: string;
  deliverables: string[];
  suitableFor: string;
};

export type ServiceGroup = {
  id: string;
  title: string;
  intro: string;
  services: ServiceItem[];
};

export type Project = {
  slug: string;
  name: string;
  location: string;
  year: string;
  status: string;
  categories: string[];
  servicesProvided: string[];
  description: string;
  image: string;
  client: string;
  buildingType: string;
  area: string;
  scope: string;
  summary: string;
  challenge: string;
  approach: string;
  process: string;
  drawings: string;
  materials: string;
  visualization: string;
  galleryImages: string[];
  font?: string;
};

export type GalleryItem = {
  title: string;
  category: string;
  image: string;
};

export type TeamMember = {
  initials: string;
  image?: string;
  name: string;
  role: string;
  bio: string;
  tags: string[];
};

export type LegalSection = {
  heading: string;
  body: string;
};

export interface Dictionary {
  meta: {
    siteName: string;
    tagline: string;
    description: string;
  };
  nav: {
    studio: string;
    services: string;
    portfolio: string;
    team: string;
    connect: string;
  };
  footer: {
    description: string;
    navTitle: string;
    legalTitle: string;
    impressum: string;
    datenschutz: string;
    agb: string;
    languageLabel: string;
    rights: string;
    noteTitle: string;
    note: string;
  };
  common: {
    exploreServices: string;
    viewPortfolio: string;
    startProject: string;
    requestConsultation: string;
    sendPlans: string;
    viewProject: string;
    requestThisService: string;
    discussProject: string;
    readMore: string;
    backToPortfolio: string;
    relatedProjects: string;
    allLabel: string;
    learnMore: string;
    suitableFor: string;
  };
  home: {
    hero: {
      eyebrow: string;
      headline: string;
      subheadline: string;
      ctaExplore: string;
      ctaPortfolio: string;
      ctaStart: string;
      factsTitle: string;
      factServiceLabel: string;
      factServiceValue: string;
      factFocusLabel: string;
      factFocusValue: string;
      factMethodLabel: string;
      factMethodValue: string;
    };
    selectedProjects: {
      eyebrow: string;
      title: string;
      intro: string;
      cta: string;
    };
    services: {
      eyebrow: string;
      title: string;
      intro: string;
      items: TitleDescription[];
      cta: string;
    };
    philosophy: {
      eyebrow: string;
      title: string;
      body: string;
      points: TitleDescription[];
    };
    process: {
      eyebrow: string;
      title: string;
      intro: string;
      steps: ProcessStep[];
    };
    heritage: {
      eyebrow: string;
      title: string;
      body: string;
      points: string[];
      cta: string;
    };
    digitalArch: {
      eyebrow: string;
      title: string;
      body: string;
      points: string[];
      cta: string;
    };
    contactCta: {
      title: string;
      body: string;
      cta: string;
    };
  };
  studio: {
    title: string;
    intro: string;
    history: TitleBody;
    mission: TitleBody;
    vision: TitleBody;
    approach: TitleBody & { steps: ProcessStep[] };
    values: {
      title: string;
      items: TitleDescription[];
    };
  };
  servicesPage: {
    title: string;
    intro: string;
    groups: ServiceGroup[];
  };
  portfolio: {
    title: string;
    intro: string;
    filters: {
      all: string;
      projects: string;
      heritage: string;
      conservation: string;
      residential: string;
      interior: string;
      landscape: string;
      planning: string;
      modeling: string;
      digitalArch: string;
      gallery: string;
    };
    projects: Project[];
  };
  projectDetail: {
    factsLabels: {
      client: string;
      location: string;
      year: string;
      status: string;
      services: string;
      buildingType: string;
      area: string;
      scope: string;
    };
    sections: {
      summary: string;
      challenge: string;
      approach: string;
      process: string;
      drawings: string;
      materials: string;
      visualization: string;
      gallery: string;
      related: string;
    };
    ctaTitle: string;
    ctaBody: string;
  };
  galleryPage: {
    title: string;
    intro: string;
    items: GalleryItem[];
  };
  team: {
    title: string;
    intro: string;
    members: TeamMember[];
  };
  connect: {
    title: string;
    intro: string;
    ctas: {
      startProject: string;
      requestConsultation: string;
      sendPlans: string;
    };
    form: {
      name: string;
      email: string;
      phone: string;
      preferredLanguage: string;
      projectType: string;
      projectTypeOptions: string[];
      projectLocation: string;
      buildingStatus: string;
      buildingStatusOptions: string[];
      requiredService: string;
      projectSize: string;
      budgetRange: string;
      message: string;
      consent: string;
      submit: string;
    };
  };
  legal: {
    impressum: { title: string; updated: string; sections: LegalSection[] };
    datenschutz: { title: string; updated: string; sections: LegalSection[] };
    agb: { title: string; updated: string; sections: LegalSection[] };
  };
}
