/**
 * Single source of truth for everything the site says.
 *
 * Part 1 (FACTS) holds the audited facts about Dhivagar Kamaraj.
 * Part 2 (INTERFACE) holds interface chrome only: navigation labels, section
 * headings, button text and accessibility labels. No facts live in part 2.
 *
 * Components render only strings from this file. The page <title>, meta
 * description and Open Graph tags are injected from `meta` at build time
 * (see vite.config.ts).
 */

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface SiteLink {
  /** Short name of the destination, e.g. "GitHub". */
  label: string
  /** Text shown for the link, e.g. "github.com/dhivagar29". */
  display: string
  href: string
}

export interface Stat {
  /** Leading figure, e.g. "12+". */
  value: string
  /** Optional second figure for a before/after pair. */
  to?: string
  /** Words read out between `value` and `to` by assistive tech. */
  toLabel?: string
  unit: string
  caption: string
}

export interface Bullet {
  text: string
  /** Short heading for the bullet, built from the bullet's own words. */
  label?: string
  /** Exact substring of `text` to emphasise. */
  highlight?: string
}

export interface Role {
  title: string
  company: string
  location: string
  period: string
  client?: string
  note?: string
  bullets: Bullet[]
}

export interface PipelineStage {
  key: string
  title: string
  detail: string
}

export type ProjectGlyph = 'score' | 'receipt' | 'trust' | 'policy' | 'signed' | 'pin' | 'lens'

export interface Project {
  name: string
  repo: string
  description: string
  glyph: ProjectGlyph
  code: string
  live?: string
}

export interface SkillItem {
  name: string
  /** Sub-items listed in brackets after the name. */
  details?: string[]
}

export interface SkillGroup {
  label: string
  /** One or more rows of items; rows are separated visually. */
  rows: SkillItem[][]
}

export interface Certification {
  name: string
  year: string
}

/* ------------------------------------------------------------------ */
/* PART 1: FACTS                                                       */
/* ------------------------------------------------------------------ */

export const identity = {
  name: 'Dhivagar Kamaraj',
  initials: 'DK',
  headline: {
    title: 'Infrastructure Specialist - AWS DevSecOps',
    joiner: 'at',
    company: 'IBM',
  },
  taglines: ['Behind the cloud.', 'Cloud. Code. Curiosity.'],
  positioning: {
    role: 'Senior DevSecOps & Platform Engineer',
    stack: ['AWS', 'Terraform', 'GitHub Actions', 'Python'],
  },
  location: 'Bengaluru, India',
  timezone: 'IST',
  /** IANA zone used only to print the current time in IST. */
  timezoneId: 'Asia/Kolkata',
} as const

export const links = {
  github: {
    label: 'GitHub',
    display: 'github.com/dhivagar29',
    href: 'https://github.com/dhivagar29',
  },
  website: {
    label: 'Website',
    display: 'dhivagar.in',
    href: 'https://dhivagar.in',
  },
  linkedin: {
    label: 'LinkedIn',
    display: 'linkedin.com/in/dhivagar-kamaraj',
    href: 'https://www.linkedin.com/in/dhivagar-kamaraj/',
  },
  x: {
    label: 'X',
    display: 'x.com/dhivagar',
    href: 'https://x.com/dhivagar',
  },
  email: {
    label: 'Email',
    display: 'dhivagar.kamaraj@gmail.com',
    href: 'mailto:dhivagar.kamaraj@gmail.com',
  },
} as const satisfies Record<string, SiteLink>

export const meta = {
  title: 'Dhivagar Kamaraj — AWS DevSecOps',
  description:
    'Dhivagar Kamaraj is an Infrastructure Specialist - AWS DevSecOps at IBM in Bengaluru, India. Senior DevSecOps and platform engineer with 12+ years in infrastructure: AWS, Terraform, GitHub Actions, Python.',
} as const

export const summary = {
  lead: 'Senior DevSecOps and platform engineer with 12+ years in infrastructure and 10+ years in cloud, CI/CD and automation.',
  paragraphs: [
    'At IBM since March 2022, he owns CI/CD and deployment guardrails for a UK financial-services cloud contact centre (client: Nationwide Building Society, UK) on AWS and Amazon Connect: GitHub Actions and Harness pipelines, Terraform, Python policy gates, OIDC deploy roles and security scanning across 100+ repositories.',
    'Earlier he led DevOps processes and the CI/CD roadmap at Infosys (cut deployments from about 5 days to 2), and deployed Docker workloads to Kubernetes on AWS and GCP at Cognizant.',
    'He uses AI coding tools daily (Cursor, Claude, Codex) and publishes open-source DevSecOps tools.',
  ],
} as const

export const stats: Stat[] = [
  { value: '12+', unit: 'years', caption: 'in infrastructure' },
  { value: '10+', unit: 'years', caption: 'in cloud, CI/CD and automation' },
  { value: '100+', unit: 'repositories', caption: 'handled at IBM' },
  {
    value: '~5',
    to: '2',
    toLabel: 'to',
    unit: 'days',
    caption: 'deployment process time at Infosys',
  },
  {
    value: '90%',
    unit: 'alert efficiency',
    caption: 'system monitoring and alert efficiency improved at Sanmina SCI',
  },
]

export const currentRole: Role = {
  title: 'Infrastructure Specialist - AWS DevSecOps',
  company: 'IBM',
  location: 'Bengaluru, India',
  period: 'Mar 2022 – Present',
  client: 'Client: Nationwide Building Society (UK) – Assisted Service contact centre.',
  note: 'Handles 100+ repositories.',
  bullets: [
    {
      label: 'CI/CD ownership',
      text: 'Own CI/CD for a UK financial-services cloud contact centre on AWS and Amazon Connect (voice and video): GitHub Actions for CI, Harness for CD; promote releases dev > test > prod and support production deployments, cutovers and rollbacks',
    },
    {
      label: 'Terraform',
      text: 'Terraform for AWS IAM, Lambda and Amazon Connect infrastructure across production and lower environments, including module upgrades and drift checks',
    },
    {
      label: 'Fail-closed gate',
      text: 'Fail-closed Python gate in GitHub Actions that blocks production Terraform variables carrying lower-environment AWS account IDs or ARNs; the same account allowlist runs as a required Harness step before terraform apply, backed by an in-module aws_caller_identity precondition',
    },
    {
      label: 'GitHub hygiene',
      text: 'GitHub hygiene across 100+ repositories: branch protection, required status checks, CODEOWNERS on production paths, secrets kept out of repos and workflow hardening, so every infrastructure and pipeline change ships through a reviewed, gated pull request',
    },
    {
      label: 'OIDC and scanning',
      text: 'OIDC-assumed deploy roles instead of long-lived AWS keys in GitHub; SAST, DAST and secret scanning on the GitHub Actions path before Harness promote, with Snyk triage and Checkov IaC scanning',
    },
    {
      label: 'Multi-account AWS',
      text: 'Multi-account AWS (production vs NPE / SIT / UAT) as the blast-radius control, enforced with in-repo Python policy checks rather than string-matching environment names in HCL',
    },
    {
      label: 'Fast-fail CI pattern',
      text: 'Designing a reusable fast-fail GitHub Actions CI pattern for Python Lambda and Terraform repositories: lint, Snyk, SonarQube and Python tests as parallel jobs behind one required fan-in gate',
    },
    {
      label: 'Alerts and triage',
      text: 'Onboard CloudWatch log groups to Dynatrace, maintain alerts and run first-line triage; out-of-hours production support',
    },
    {
      label: 'Release promotion',
      text: 'Promote Amazon Connect contact flows, Amazon Lex bots and Lambda functions through environments on every release',
    },
    {
      label: 'DevOps standards',
      text: 'Help set common DevOps standards across three contact-centre squads through a daily shared DevOps call',
    },
  ],
}

/** The four stages of the release path, labelled with wording from the role above. */
export const pipeline: PipelineStage[] = [
  { key: 'CI', title: 'GitHub Actions', detail: 'GitHub Actions for CI' },
  {
    key: 'SCAN',
    title: 'SAST, DAST and secret scanning',
    detail: 'With Snyk triage and Checkov IaC scanning',
  },
  {
    key: 'GATE',
    title: 'Fail-closed Python gate',
    detail: 'Account allowlist as a required Harness step before terraform apply',
  },
  { key: 'DEPLOY', title: 'Harness', detail: 'Harness for CD; promote releases dev > test > prod' },
]

export const earlierRoles: Role[] = [
  {
    title: 'Consultant',
    company: 'Infosys',
    location: 'Chennai, India',
    period: 'Dec 2020 – Mar 2022',
    client: 'Client: CITI Group – Treasury and Trade Solutions',
    bullets: [
      {
        text: 'Reduced deployment process time from about 5 days to 2 days on a critical agile project',
        highlight: 'about 5 days to 2 days',
      },
      {
        text: 'Led DevOps processes and developed the CI/CD roadmap; automated deployments of Linux applications and system configurations',
      },
      { text: 'Introduced open-source solutions to automate manual processes' },
      {
        text: 'Developed and automated standard operating procedures for common failure scenarios',
      },
    ],
  },
  {
    title: 'Associate',
    company: 'Cognizant',
    location: 'Chennai, India',
    period: 'Aug 2018 – Jun 2020',
    client: 'Clients: Cigna and Health Care Service Corporation',
    bullets: [
      {
        text: 'Deployed containerised web applications to Kubernetes on AWS and GCP using automated processes; developed Ansible playbooks for resource management across multiple stages',
      },
      {
        text: 'Continuous builds producing Docker images for container-based deployments to Kubernetes',
      },
      { text: 'Fully automated CI/CD pipelines with Jenkins and GitLab' },
      {
        text: 'Infrastructure-as-code automation with Terraform, AWS CloudFormation, Ansible and Jenkins',
      },
    ],
  },
  {
    title: 'Programmer Analyst',
    company: 'Sanmina SCI',
    location: 'Chennai, India',
    period: 'May 2016 – Aug 2018',
    bullets: [
      {
        text: 'Coordinated teams to configure and deploy instances on AWS, GCP and on-premises',
      },
      {
        text: 'Improved system monitoring and alert efficiency by 90% using New Relic and Nagios',
        highlight: 'by 90%',
      },
    ],
  },
  {
    title: 'Network Administrator',
    company: 'M-Square',
    location: 'Chennai, India',
    period: 'May 2014 – Apr 2016',
    bullets: [{ text: 'Administered OS updates and system configurations for Linux and Windows' }],
  },
]

export const openSource = {
  /** Rendered as: before + GitHub link + after. */
  intro: {
    before: 'Personal open-source DevSecOps tools, public on ',
    after: ' (2026). Built with AI coding agents he directs and checks before release.',
  },
  projects: [
    {
      name: 'Guardrail Score',
      repo: 'devsecops-scorecard',
      glyph: 'score',
      description:
        'Scores a GitHub repo or a whole org on 11 DevSecOps guardrails (branch protection and rulesets, required reviews, Dependabot, secret scanning, least-privilege Actions tokens) with a 0-100 grade, ranked remediation plan and CSV/SARIF export.',
      code: 'https://github.com/dhivagar29/devsecops-scorecard',
    },
    {
      name: 'Release Receipt',
      repo: 'release-receipt',
      glyph: 'receipt',
      description:
        'Fail-closed PASS/FAIL evidence receipt for a release SHA across GitHub Advanced Security (CodeQL, secret scanning, Dependabot), Snyk and SonarQube gates.',
      code: 'https://github.com/dhivagar29/release-receipt',
    },
    {
      name: 'oidc-trust-lint',
      repo: 'oidc-trust-lint',
      glyph: 'trust',
      description:
        'CLI and composite GitHub Action that lints AWS IAM trust policies for GitHub OIDC misconfigurations (missing aud/sub, wildcard subjects).',
      code: 'https://github.com/dhivagar29/oidc-trust-lint',
    },
    {
      name: 'tf-policy-pack',
      repo: 'tf-policy-pack',
      glyph: 'policy',
      description:
        'OPA/Rego policies run with Conftest against Terraform plans (public S3, open security groups, unencrypted EBS/RDS, required tags).',
      code: 'https://github.com/dhivagar29/tf-policy-pack',
    },
    {
      name: 'signed-release',
      repo: 'signed-release',
      glyph: 'signed',
      description:
        'GitHub Actions release pipeline with Sigstore keyless signing (cosign + GitHub OIDC), SLSA build provenance and SHA-256 checksums.',
      code: 'https://github.com/dhivagar29/signed-release',
    },
    {
      name: 'ForgePin',
      repo: 'forgepin',
      glyph: 'pin',
      description:
        'Finds unpinned GitHub Actions in a repository and suggests immutable commit SHAs to replace floating refs.',
      code: 'https://github.com/dhivagar29/forgepin',
      live: 'https://forgepin-app2.vercel.app',
    },
    {
      name: 'RunLens',
      repo: 'runlens',
      glyph: 'lens',
      description:
        'Finds repeated work and slow steps in GitHub Actions runs, with evidence for what to change.',
      code: 'https://github.com/dhivagar29/runlens',
      live: 'https://runlens-app.vercel.app',
    },
  ] satisfies Project[],
}

export const skills: SkillGroup[] = [
  { label: 'Languages', rows: [[{ name: 'Python' }, { name: 'Bash' }, { name: 'Go' }]] },
  {
    label: 'Cloud',
    rows: [
      [
        {
          name: 'AWS',
          details: [
            'IAM',
            'Lambda',
            'OIDC',
            'multi-account',
            'CloudWatch',
            'Amazon Connect',
            'Amazon Lex',
          ],
        },
        { name: 'Azure' },
        { name: 'GCP' },
      ],
    ],
  },
  {
    label: 'Infrastructure as code',
    rows: [
      [{ name: 'Terraform' }, { name: 'AWS CloudFormation' }, { name: 'Ansible' }, { name: 'Chef' }],
    ],
  },
  {
    label: 'CI/CD',
    rows: [
      [
        { name: 'GitHub Actions' },
        { name: 'Harness' },
        { name: 'Jenkins' },
        { name: 'GitLab CI' },
        { name: 'Buildkite' },
        { name: 'UrbanCode' },
        { name: 'TeamCity' },
      ],
    ],
  },
  {
    label: 'Security',
    rows: [
      [
        { name: 'Secrets management' },
        { name: 'OIDC' },
        { name: 'IAM least privilege' },
        { name: 'AWS KMS' },
        { name: 'SAST' },
        { name: 'DAST' },
        { name: 'Snyk' },
        { name: 'SonarQube' },
        { name: 'Checkov' },
        { name: 'CODEOWNERS' },
        { name: 'branch protection' },
        { name: 'supply-chain hygiene' },
      ],
    ],
  },
  { label: 'Containers', rows: [[{ name: 'Docker' }, { name: 'Kubernetes' }, { name: 'Lens' }]] },
  {
    label: 'Observability',
    rows: [
      [
        { name: 'Amazon CloudWatch' },
        { name: 'AWS CloudTrail' },
        { name: 'Dynatrace' },
        { name: 'New Relic' },
        { name: 'Nagios' },
      ],
    ],
  },
  {
    label: 'AI-assisted engineering',
    rows: [[{ name: 'Cursor' }, { name: 'Claude Code' }, { name: 'Codex' }]],
  },
  {
    label: 'SCM / OS / data',
    rows: [
      [{ name: 'Git' }, { name: 'GitHub' }, { name: 'GitLab' }, { name: 'Bitbucket' }],
      [{ name: 'Linux' }, { name: 'Unix' }, { name: 'Windows' }],
      [{ name: 'Amazon RDS' }, { name: 'DynamoDB' }],
    ],
  },
]

export const certifications = {
  featured: {
    name: 'Claude Certified Associate – Foundations',
    year: '2026',
  } satisfies Certification,
  others: [
    { name: 'AWS Certified Solutions Architect – Associate', year: '2019' },
    { name: 'AWS Certified Developer – Associate', year: '2020' },
    { name: 'AWS Certified Cloud Practitioner', year: '2019' },
    { name: 'Microsoft Certified: Azure AI Engineer Associate', year: '2024' },
    { name: 'Microsoft Certified: Azure AI Fundamentals', year: '2024' },
    { name: 'Microsoft Certified: Azure Data Fundamentals', year: '2024' },
    { name: 'Microsoft Certified: Azure Fundamentals', year: '2020' },
  ] satisfies Certification[],
}

export const education =
  'B.E. Computer Science, SRM Valliammai Engineering College (Anna University), Chennai, 2009–2013'

/* ------------------------------------------------------------------ */
/* PART 2: INTERFACE (labels and accessibility text only, no facts)    */
/* ------------------------------------------------------------------ */

export const sections = {
  top: { id: 'top', nav: 'Top', kicker: '', title: '' },
  about: { id: 'about', nav: 'About', kicker: 'About', title: 'Behind the cloud.' },
  now: { id: 'now', nav: 'Now', kicker: 'Now', title: 'Current role' },
  experience: { id: 'experience', nav: 'Experience', kicker: 'Timeline', title: 'Experience' },
  projects: {
    id: 'projects',
    nav: 'Projects',
    kicker: 'Open source',
    title: 'Open-source projects',
  },
  skills: { id: 'skills', nav: 'Skills', kicker: 'Stack', title: 'Skills' },
  certifications: {
    id: 'certifications',
    nav: 'Certifications',
    kicker: 'Credentials',
    title: 'Certifications',
  },
  education: { id: 'education', nav: 'Education', kicker: 'Degree', title: 'Education' },
  contact: { id: 'contact', nav: 'Contact', kicker: 'Contact', title: 'Contact' },
} as const

export type SectionKey = keyof typeof sections

/** Order of sections on the page and in the navigation (hero excluded). */
export const sectionOrder = [
  'about',
  'now',
  'experience',
  'projects',
  'skills',
  'certifications',
  'education',
  'contact',
] as const satisfies readonly SectionKey[]

export const ui = {
  skipLink: 'Skip to content',
  separator: '·',
  pipe: '|',
  slash: '/',
  navLabel: 'Primary',
  homeLabel: 'Dhivagar Kamaraj, back to top',
  menuOpen: 'Menu',
  menuClose: 'Close',
  menuTitle: 'Navigation',
  scrollCue: 'Scroll',
  backToTop: 'Back to top',
  clockPlaceholder: '--:--:--',
  prompt: '$',
  taglinePrompt: '>',
  hero: {
    primaryCta: 'Open-source projects',
    secondaryCta: 'Email',
    canvasLabel: 'Release pipeline',
  },
  about: {
    statsLabel: 'Key figures',
    terminalLabel: 'Terminal printing name, role, location, stack and tagline',
    terminalTitle: 'profile',
    terminal: [
      { cmd: 'whoami', out: identity.name },
      {
        cmd: 'cat role',
        out: `${identity.headline.title} ${identity.headline.joiner} ${identity.headline.company}`,
      },
      { cmd: 'cat location', out: `${identity.location} (${identity.timezone})` },
      { cmd: 'cat stack', out: identity.positioning.stack.join(' · ') },
      { cmd: 'cat tagline', out: identity.taglines[1] },
    ],
  },
  now: {
    pipelineTitle: 'Release path',
    workTitle: 'What the role covers',
    statusLabel: 'Present',
  },
  experience: {
    currentPointer: 'See current role',
  },
  projects: {
    code: 'Code',
    live: 'Live',
    codeLabel: 'source code on GitHub',
    liveLabel: 'live app',
  },
  certifications: {
    listTitle: 'AWS and Microsoft',
  },
  contact: {
    emailLabel: 'Email',
    profilesLabel: 'Profiles',
    locationLabel: 'Location',
  },
} as const
