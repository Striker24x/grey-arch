import type { ServiceLayoutId } from "./service-layouts";
import type { HeadingSection } from "./parse-content-blocks";

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
  image?: string;
};

export type ServiceGroup = {
  id: string;
  title: string;
  intro: string;
  services: ServiceItem[];
  layout?: ServiceLayoutId;
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
  /** Free-form rich text document — the main narrative shown on the project page. */
  body?: string;
  /** Layout style for arranging the parsed text/image blocks of `body`. */
  layout?: ServiceLayoutId;
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

export type JobPosting = {
  id: string;
  slug: string;
  image?: string;
  title: string;
  location: string;
  employmentType: string;
  intro: string;
  description: string;
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
    careers: string;
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
    body: string;
    sections: HeadingSection[];
  };
  servicesPage: {
    title: string;
    intro: string;
    body: string;
    sections: HeadingSection[];
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
  careers: {
    title: string;
    intro: string;
    jobs: JobPosting[];
    emptyState: string;
    backToJobs: string;
    detail: {
      applyTitle: string;
      applyIntro: string;
    };
    form: {
      name: string;
      email: string;
      phone: string;
      message: string;
      messagePlaceholder: string;
      resume: string;
      resumeHint: string;
      submit: string;
      submitting: string;
      successTitle: string;
      successBody: string;
      errorBody: string;
    };
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
      attachment: string;
      attachmentHint: string;
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

/**
 * Shape of the static `lib/dictionaries/{en,de,ar}.ts` seed files. Studio/Services keep
 * their original structured fields here — `getDictionary()` converts them into the rich-text
 * `body` + `sections` shape of `Dictionary` (via data-manager.ts's Studio/Services migration),
 * so the seed files never need to be rewritten as HTML by hand.
 */
export type SourceDictionary = Omit<Dictionary, "studio" | "servicesPage"> & {
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
};
