export const profile = {
  name: "Thanooj Lingampally",
  title: "Founding AI Engineer",
  org: { name: "Dottr", url: "https://dottr.ai" },
  /** meta and social description: short enough not to be cut off (~155 chars) */
  description:
    "Thanooj Lingampally, founding AI engineer in New York, open to SF. I build production LLM agents: tool calling, honesty guards, evals and latency.",
  /** home page <title>: name first for name searches, then the role terms recruiters search */
  seoTitle: "Thanooj Lingampally · Founding AI Engineer, LLM Agents · New York",
  /** the one sentence under the name: the core message of the site */
  pitch:
    "I'm the first engineer at Dottr. I built the Claude agent that runs its product in production for paying customers: 40+ tools, a guard that checks every action it claims, and replies that start in under 2 seconds instead of 23.",
  /** the small status line under the role: what I am looking for */
  status: "Open to AI, LLM agent and backend engineering roles. Open to relocating, San Francisco preferred.",
  location: "New York",
  email: "thanoojlingampally@gmail.com",
  github: "https://github.com/thanoojrao",
  linkedin: "https://www.linkedin.com/in/thanooj-lingampally",
  resume: "/thanooj-lingampally-resume.pdf" as string | null,
};

/** the 30-second read: who I am, in two paragraphs, plus the numbers that matter */
export const brief = {
  paragraphs: [
    "I joined Dottr, a VC-backed contract-intelligence and e-signing startup, as its first engineer. I designed and built the Claude-on-Bedrock agent behind its chat and email, the Python backend and AWS infrastructure under it, and the guards that stop the agent from claiming anything a tool did not actually do. Before our CTO joined I also helped hire the team, and I sit in customer meetings, which is where the best features came from.",
    "Before that I spent almost two years at Tata Consultancy Services building a RAG claims pre-audit tool for insurers that more than ten thousand people used. I then did an MS in AI at the University at Buffalo, where I was a teaching assistant for Introduction to Machine Learning (CSE 474/574) and spent my spare cycles on reinforcement learning and robotics.",
  ],
  stats: [
    { value: "23s → <2s", label: "time to first token on the production agent", slug: "dottr-agent" },
    { value: "40+ tools", label: "in the production agent, every claimed action backed by a receipt", slug: "dottr-agent" },
    { value: "10K+ users", label: "on the RAG claims pre-audit tool I built at TCS", slug: "tcs-rag-platform" },
  ],
  /** one line for the recruiter keyword skim; the full list lives on the résumé */
  skills: [
    // agent and backend stack first, frontend last
    "Python",
    "FastAPI",
    "Claude / Amazon Bedrock",
    "LLM agents and tool calling",
    "Evals",
    "Prompt caching",
    "RAG (LangChain, LangGraph)",
    "PyTorch",
    "ONNX",
    "MLflow",
    "Postgres + pgvector",
    "DynamoDB",
    "AWS (ECS Fargate, SQS, S3)",
    "Terraform",
    "GitHub Actions",
    "Docker",
    "TypeScript / Next.js",
  ],
};

export type Experience = {
  org: string;
  role: string;
  period: string;
  kind: "work" | "school";
  lines: string[];
};

export const experience: Experience[] = [
  {
    org: "Dottr",
    role: "Founding AI Engineer",
    period: "Jan 2026 to present",
    kind: "work",
    lines: [
      "First engineer. Own the backend and the agent for a contract-intelligence and e-signing product in production with paying customers, across several deployed services on AWS.",
      "The Claude-on-Bedrock agent behind chat and email: 40+ tools, prompt-cache-aware context assembly, a layered honesty guard that verifies every claimed action, and an eval harness that replays real flows against every prompt and model change.",
      "Took time to first token from tens of seconds to under two by streaming while the guard audits concurrently and retracts on failure.",
      "Signature-field detection as a propose-then-select pipeline: a small quantised detector proposes, Claude selects, with the eval set built before the model.",
      "Company-specific contract review, an end-to-end audit of the e-signing pipeline, multilingual document ingestion, log-fingerprinted alert triage, and an AWS cost audit.",
    ],
  },
  {
    org: "Tata Consultancy Services",
    role: "ML Engineer",
    period: "Dec 2022 to Aug 2024",
    kind: "work",
    lines: [
      "Built a RAG claims pre-audit tool for insurance vendors used by 10K+ people: Amazon Textract for garage invoices and claim documents, LangChain for retrieval and summarisation, and a deterministic calculation engine for exact, auditable deductions.",
      "Worked directly with business stakeholders and met the company's security and compliance requirements.",
      "Spring Boot (Java) microservices with secure REST endpoints connecting old enterprise databases to the ML pipelines.",
      "Led the MLflow pipeline for versioning, tracking and promoting models to production.",
    ],
  },
  {
    org: "University at Buffalo",
    role: "Graduate Teaching Assistant",
    period: "Jan 2025 to Dec 2025",
    kind: "work",
    lines: ["Teaching assistant and grader for CSE 474/574, Introduction to Machine Learning."],
  },
  {
    org: "Counselit",
    role: "Software Engineering Intern",
    period: "Apr 2021 to Aug 2021",
    kind: "work",
    lines: ["Node.js and Express REST APIs and React interfaces for client pilots, with JWT auth and role-based access control."],
  },
  {
    org: "University at Buffalo",
    role: "MS Computer Science, Artificial Intelligence",
    period: "Aug 2024 to Dec 2025",
    kind: "school",
    lines: [
      "Reinforcement Learning · Machine Learning · Pattern Recognition · NLP · Computer Vision & Image Processing",
      "Data-Intensive Computing · Algorithm Analysis & Design · Numerical Methods · Fundamentals of AI",
    ],
  },
  {
    org: "NIT Durgapur",
    role: "BTech",
    period: "2019 to 2023",
    kind: "school",
    lines: ["Robocell, the robotics club."],
  },
];

export type Project = {
  slug: string;
  title: string;
  org?: string;
  period: string;
  summary: string;
  /** search-friendly <title> and a meta description short enough not to be cut off (~155 chars) */
  seoTitle: string;
  metaDescription: string;
  /** "work" = shipped at a job, "experiment" = school and side projects */
  track: "work" | "experiment";
  /** one or two plain sentences for the project list on the home page */
  card: string;
  /** outcome chips shown on the home page row */
  chips: string[];
  tags: string[];
  links: { label: string; href: string }[];
  sections: { heading: string; body: string[] }[];
  /** an interactive replay shown above the write-up */
  demo?: "honesty-guard";
};

export const projects: Project[] = [
  {
    slug: "dottr-agent",
    seoTitle: "Production Claude agent: honesty guard, evals, streaming",
    metaDescription: "The Claude-on-Bedrock agent I built at Dottr: tool calling, an honesty guard on claimed actions, replayed-flow evals, and TTFT cut from 23s to under 2s.",
    title: "An agent that has to be honest about what it did",
    org: "Dottr",
    period: "2026 to present",
    demo: "honesty-guard",
    summary:
      "The Claude-on-Bedrock agent behind Dottr's chat and email: 40+ tools, a layered honesty guard, an eval harness that replays real flows, and a streaming design that took time to first token from tens of seconds to under two.",
    track: "work",
    card: "The Claude agent behind Dottr's chat and email: 40+ tools, a guard that verifies every claimed action, and an eval harness that replays real customer flows.",
    chips: ["in production", "40+ tools", "TTFT 23s → <2s"],
    tags: ["Claude on Bedrock", "tool calling", "evals", "prompt caching", "streaming"],
    links: [{ label: "dottr.ai", href: "https://dottr.ai" }],
    sections: [
      {
        heading: "Problem",
        body: [
          "A contract-intelligence agent reads, fills, routes and signs documents for real users. The demo is easy. The hard part is an agent that says it sent something it did not, or takes an action nobody authorised, or makes the user wait so long the product feels broken.",
        ],
      },
      {
        heading: "How it is built",
        body: [
          "Tool calling across 40+ tools, with context assembled to keep the prompt cache warm so long conversations stay fast and cheap.",
          "A layered honesty guard: before the user sees a claim like 'sent to the counterparty', the claim is checked against records the system actually owns. If the check fails, the claim is retracted.",
          "An eval harness of about 150 cases across 8 behaviours, from tool selection to approval routing, many taken verbatim from production messages. Every pull request runs the critical cases three times against the real model with deterministic checks, and the full set runs nightly, so a regression in planning or tool use fails a build instead of reaching an inbox.",
          "Streaming with concurrent auditing: the reply starts immediately while the guard runs alongside it. Time to first token went from tens of seconds to under two, without giving up the guarantee.",
        ],
      },
      {
        heading: "How it works now",
        body: [
          "I later redesigned the agent loop so honesty is a property of the design, not something we detect afterwards. Every turn ends in a typed respond call, so the turn's status comes from an object, never from parsing prose.",
          "Authority lives in tool preconditions: sending or cancelling needs a confirm that is only minted when the user says yes, and it is bound to one specific plan. Tools report what did not happen as clearly as what did. The honesty guard still runs alongside, checking each claim against the receipts from that turn.",
          "During the rebuild a shrink-only expected-failures list meant the suite could only get stronger, and it caught a planning regression before cutover.",
          "The rule underneath all of it: the agent can't claim a state change unless a typed receipt from a tool backs it.",
        ],
      },
      {
        heading: "Decisions I would defend",
        body: [
          "Guard after, not before. Blocking the reply on the audit was correct and unusable. Streaming and retracting is correct and fast.",
          "Replay real flows, not synthetic prompts. The failures that matter come from what customers actually do, and a harness of invented cases never found them.",
          "Gate deploys on the suite. Once the harness existed, letting a red build ship would have thrown away its whole value.",
        ],
      },
    ],
  },
  {
    slug: "signature-field-detection",
    seoTitle: "Signature-field detection: ONNX detector plus Claude",
    metaDescription: "A small quantised detector proposes signature fields and Claude selects them, measured on a human-reviewed eval set of 793 documents and 6,567 boxes.",
    title: "Finding where to sign: a detector proposes, Claude selects",
    org: "Dottr",
    period: "2026",
    summary:
      "Signature-field detection as a propose-then-select pipeline: a small quantised object detector finds candidates cheaply, and Claude picks the right ones using the document's text. The eval set was built before the model, and it paid for itself on day one.",
    track: "work",
    card: "A small quantised detector finds candidate signature fields cheaply; Claude picks the right ones from the document's text. The eval set came before the model.",
    chips: ["in production", "793 docs · 6,567 boxes"],
    tags: ["ONNX", "object detection", "Claude", "evals", "computer vision"],
    links: [{ label: "dottr.ai", href: "https://dottr.ai" }],
    sections: [
      {
        heading: "Problem",
        body: [
          "Contracts arrive as scanned PDFs in every layout imaginable. The product has to know where each party signs, initials and dates. A vision model alone cannot tell which box belongs to which party; a language model alone cannot see the page.",
        ],
      },
      {
        heading: "How it is built",
        body: [
          "Propose: a small int8-quantised object detector, 37 MB as ONNX (down from 774 MB in PyTorch), runs on CPU at ingest with no model call and returns candidate boxes.",
          "Select: only when someone actually intends to sign or send, Claude sees the candidates together with the document's text and structure and decides which are real signature fields, whose they are, and what kind.",
          "Measure first: a human-reviewed evaluation set of 793 documents and 6,567 boxes existed before the pipeline did. It exposed a coordinate-transform bug that had put 30% of candidates off the page, the kind of thing nobody spots by eyeballing outputs. On that set the detector reaches 86.4% recall at confidence 0.3 and 92.8% at 0.1.",
          "Every alternative got the same treatment: document parsers, detection vendors and placement models were benchmarked head to head on the same set before any of them was adopted. Docling and Reducto parsed most of our documents about equally well, so we chose Docling for its lower median latency, 2.2s vs 3.4s.",
        ],
      },
      {
        heading: "What I learned",
        body: [
          "Build the measuring stick before the thing you measure. It turned vendor debates into a table, and it now guards every model swap.",
          "Split the job along the models' strengths. Cheap perception plus expensive reasoning beat either one doing everything.",
        ],
      },
    ],
  },
  {
    slug: "tcs-rag-platform",
    seoTitle: "RAG claims pre-audit tool for insurers: Textract and LangChain",
    metaDescription: "A RAG tool used by 10,000+ people to pre-audit insurance claims: Textract for invoices, LangChain for retrieval, a deterministic engine for the math.",
    title: "A claims pre-audit tool for insurers, used by 10,000+ people",
    org: "Tata Consultancy Services",
    period: "2022 to 2024",
    summary:
      "A RAG tool that pre-audits insurance claims: Textract reads garage invoices and claim documents, LangChain handles retrieval and summarisation, and a deterministic engine calculates the deductions, so every number is exact and auditable. Claim processors get a filtered summary to decide each claim.",
    track: "work",
    card: "Textract reads garage invoices, LangChain retrieves and summarises, and a deterministic engine does the math, so claim processors get exact, auditable numbers.",
    chips: ["10K+ users", "auditable math"],
    tags: ["RAG", "LangChain", "Amazon Textract", "Spring Boot", "MLflow"],
    links: [],
    sections: [
      {
        heading: "Problem",
        body: [
          "Insurance vendors review claims backed by garage invoices and other documents, and every deduction has to be correct and defensible. An LLM is good at reading and summarising those documents, but it should not be trusted with the arithmetic.",
        ],
      },
      {
        heading: "What I built",
        body: [
          "Document reading with Amazon Textract, so garage invoices and other claim documents became structured text.",
          "Retrieval and summarisation on LangChain, producing a filtered summary for claim processors to decide each claim.",
          "A deterministic calculation engine for the deductions, kept separate from the LLM, so the numbers were exact and could be audited.",
          "Spring Boot (Java) microservices with secure REST endpoints connecting the old enterprise databases to the ML pipelines.",
          "Led the MLflow pipeline for versioning, tracking and promoting models to production.",
          "Worked directly with business stakeholders, and built to the company's security and compliance requirements. More than 10,000 people used it.",
        ],
      },
      {
        heading: "Decision I would defend",
        body: [
          "Let the model read, never let it calculate. Keeping the deductions in a deterministic engine meant every figure a processor saw could be traced and audited.",
        ],
      },
    ],
  },
  {
    slug: "citi-bike-mlops",
    seoTitle: "Citi Bike demand forecasting: an end-to-end MLOps pipeline",
    metaDescription: "Station-level Citi Bike demand as a scheduled pipeline: Hopsworks feature store, LightGBM, MLflow and a monitoring dashboard. MAE from 139 to 34.4.",
    title: "Citi Bike demand forecasting, end to end",
    org: "University at Buffalo",
    period: "Spring 2025",
    summary:
      "Station-level demand for New York's bike share in six-hour buckets, as a scheduled pipeline with a feature store, model registry and a monitoring dashboard, not a notebook.",
    track: "experiment",
    card: "Station-level demand as a scheduled pipeline with a feature store, model registry and monitoring dashboard, not a notebook.",
    chips: ["MAE 139 → 34.4"],
    tags: ["LightGBM", "Hopsworks", "GitHub Actions", "MLflow", "Streamlit"],
    links: [{ label: "github", href: "https://github.com/thanoojrao/citi_bike" }],
    sections: [
      {
        heading: "Problem",
        body: [
          "Predict how many rides start at each Citi Bike station in the next six hours, and keep the prediction fresh every day without anyone running a notebook.",
        ],
      },
      {
        heading: "What I built",
        body: [
          "Feature pipeline: raw monthly trip files from the public S3 bucket, cleaned and aggregated per station and time bucket, written to a Hopsworks feature group on a schedule.",
          "Training pipeline: LightGBM on lagged demand features, tracked with MLflow, with the winning model pushed to the Hopsworks model registry.",
          "Inference pipeline: pulls the latest features, writes predictions back to a feature group, and a Streamlit monitor plots error by hour against what actually happened.",
          "All three run as chained GitHub Actions workflows, so the whole thing is reproducible from a clean checkout.",
        ],
      },
      {
        heading: "Result",
        body: [
          "Mean absolute error went from 139 rides for a naive baseline, to 45 for a last-four-weeks average, to 34.8 for LightGBM, to 34.4 after tuning. The tuning step mattered less than the feature work.",
        ],
      },
      {
        heading: "Honest note",
        body: [
          "This started from a course template for NYC taxi demand. The adaptation to a different dataset, the station-level features, the zone geometry and the monitoring are mine; the pipeline shape is the course's.",
        ],
      },
    ],
  },
  {
    slug: "quadruped-locomotion",
    seoTitle: "Quadruped navigation with PPO and Mixture-of-Experts in MuJoCo",
    metaDescription: "ANYmal C in MuJoCo: locomotion with PPO, then goal-conditioned navigation with a Mixture-of-Experts policy in PyTorch, reaching 92% success.",
    title: "Goal-conditioned quadruped navigation with a Mixture-of-Experts policy",
    org: "University at Buffalo",
    period: "2025",
    summary:
      "The ANYmal C robot in MuJoCo, first taught to walk with PPO, then to reach targets with a Mixture-of-Experts policy in PyTorch: 92% success on target-reaching within 200 timesteps.",
    track: "experiment",
    card: "ANYmal C in MuJoCo: taught to walk with PPO, then to reach targets with a Mixture-of-Experts policy in PyTorch.",
    chips: ["92% success"],
    tags: ["MuJoCo", "PyTorch", "Mixture-of-Experts", "PPO", "robotics"],
    links: [{ label: "github (checkpoint)", href: "https://github.com/thanoojrao/RL_quadruped_locomotion" }],
    sections: [
      {
        heading: "What it is",
        body: [
          "A custom Gymnasium environment around the ANYbotics ANYmal C model from the MuJoCo Menagerie. Observations are joint positions and velocities, actions are the twelve actuator torques, and an episode ends when the body drops below 20 cm.",
          "Stage one: locomotion. A reward of forward velocity plus a posture bonus minus an action-cost penalty, trained with PPO from Stable-Baselines3, with video captured every ten thousand steps so the gait can be watched improving from falling over to an early walk.",
          "Stage two: goal-conditioned navigation. The observation gains a target, and the policy becomes a Mixture-of-Experts network in PyTorch: five expert policies, each pre-trained for 2M steps, then a gating network that chooses among them per step. It reaches 92% success on target-reaching tasks within 200 timesteps.",
        ],
      },
      {
        heading: "Why I keep at it",
        body: [
          "Agents that act in the physical world have all the problems of software agents, with worse failure modes. This is the side project I keep coming back to.",
        ],
      },
    ],
  },
  {
    slug: "super-resolution",
    seoTitle: "Image super-resolution with SRCNN, SRResNet and a perceptual loss",
    metaDescription: "2x image super-resolution on DIV2K in PyTorch: SRCNN, then SRResNet with an LPIPS perceptual loss that cut LPIPS from 0.24 to 0.103.",
    title: "Sharper upscaling: SRCNN, SRResNet and a perceptual loss",
    org: "University at Buffalo",
    period: "MS coursework",
    summary:
      "2x image super-resolution on DIV2K in PyTorch, from a three-layer SRCNN to an SRResNet trained with an LPIPS perceptual loss, which cut LPIPS from 0.24 to 0.103 while keeping PSNR strong.",
    track: "experiment",
    card: "2x super-resolution on DIV2K in PyTorch: SRCNN first, then SRResNet with a perceptual loss that made the outputs look sharper, not just score higher.",
    chips: ["LPIPS 0.24 → 0.103"],
    tags: ["PyTorch", "computer vision", "SRResNet", "LPIPS", "DIV2K"],
    links: [],
    sections: [
      {
        heading: "What it is",
        body: [
          "The final project for my computer vision course: turn low-resolution images into 2x higher-resolution ones, trained on DIV2K high and low resolution pairs.",
          "Baseline: SRCNN, three convolutional layers with a 9x9 first kernel and 64 filters, trained on random 64 px patches with an MSE loss, tracking PSNR, SSIM and LPIPS every epoch.",
          "Then an SRResNet variant with an LPIPS perceptual loss added to training. LPIPS went from 0.24 to 0.103 while PSNR stayed strong.",
        ],
      },
      {
        heading: "What it taught me",
        body: [
          "The metric you optimise is the output you get. MSE alone rewards safe, blurry averages; adding a loss that measures what people perceive changed what the model produced.",
        ],
      },
    ],
  },
  {
    slug: "warehouse-rl",
    seoTitle: "Warehouse robot RL environment: Q-learning vs SARSA",
    metaDescription: "A grid-world warehouse environment built from scratch, deterministic and stochastic, solved with tabular Q-learning and SARSA.",
    title: "A warehouse robot environment, solved with Q-learning and SARSA",
    org: "University at Buffalo",
    period: "Spring 2025",
    summary:
      "A 2D grid world I designed from scratch: a robot picks up objects and delivers them around obstacles, in deterministic and stochastic versions, then tabular RL learns to do it.",
    track: "experiment",
    card: "A grid world I designed from scratch, deterministic and stochastic, where tabular RL learns pickup and delivery.",
    chips: ["RL from scratch"],
    tags: ["RL", "Gymnasium", "Q-learning", "SARSA"],
    links: [{ label: "github", href: "https://github.com/thanoojrao/rl_environment" }],
    sections: [
      {
        heading: "What it is",
        body: [
          "Building the environment, not just the agent: observation and action spaces, reward shaping for pickup and delivery, obstacles, and a stochastic variant where actions sometimes slip.",
          "Q-learning and SARSA with a sweep over discount factor and epsilon decay, so the difference between the two algorithms shows up in the plots rather than being asserted. A bonus multi-pickup version reaches about 215 average reward over a thousand episodes.",
        ],
      },
      {
        heading: "What it taught me",
        body: [
          "Watching epsilon decay change what the agent found was the first time the trade-off between exploring and exploiting felt like a real decision rather than a formula.",
        ],
      },
    ],
  },
];

/** more shipped work at Dottr, one line each under the work cards */
export const moreFromDottr: { title: string; text: string }[] = [
  {
    title: "Company-specific contract review",
    text: "Customer meetings showed every company reviews contracts against its own playbook, so I built a way to capture each customer's rules, compile them by contract type and flag every upload with sources. It replaced one customer's manual Excel checklist and spread across their team.",
  },
  {
    title: "E-signing audit",
    text: "Found 7 critical defects end to end, including one that could complete a contract without ever contacting a required signer, then gated deploys on the test suite so a red build can't ship.",
  },
  {
    title: "Multilingual ingestion",
    text: "Benchmarked four OCR vendors on scanned Indian legal filings, routed garbled Textract output to Sarvam, and moved embeddings to Cohere multilingual after measuring that Titan could not match English queries to Telugu text. Backfilled 11k chunks with zero downtime.",
  },
  {
    title: "Alert triage and cost",
    text: "Grouped errors by log signature, collapsing 222 open issues into 42 root causes and cutting noise by over 80%. Found $2.1k/month of AWS spend hidden behind credits and removed about $7k/year of orphaned resources.",
  },
];

/** publications, shown as one small line near the bottom */
export const publications: { authorship: string; title: string; venue: string; note: string; href: string }[] = [
  {
    authorship: "Co-author",
    title: "Flow and Heat Transfer Study Past a Solid and Slotted Circular Cylinder: Effect of Blockage Ratio",
    venue: "Recent Advances in Thermal Engineering (Springer, 2024)",
    note: "A CFD study in ANSYS Fluent from my mechanical engineering degree.",
    href: "https://link.springer.com/chapter/10.1007/978-981-97-3648-5_4",
  },
];

/** smaller things, listed in one line each under the cards */
export const alsoPulled: { title: string; note: string; href?: string }[] = [
  {
    title: "NYC taxi demand pipeline",
    note: "the course template the Citi Bike project was adapted from; hourly demand, same stack, a map of predictions by zone",
    href: "https://github.com/thanoojrao/sp25_taxi-main",
  },
  {
    title: "Group video calling app",
    note: "Express, socket.io and PeerJS with Postgres accounts and in-browser face detection, deployed on Heroku",
    href: "https://github.com/thanoojrao/webrtc",
  },
  {
    title: "Vehicle counter",
    note: "a small Flask app that runs YOLOv3 through OpenCV on an uploaded image and counts vehicles",
    href: "https://github.com/thanoojrao/web-traffic",
  },
];

export const essay = {
  title: "On exploration vs exploitation",
  /** paragraphs before the secretary-problem toy */
  before: [
    "In reinforcement learning an agent has to choose between the action it already knows pays off and one it hasn't tried yet. I think the same trade-off runs through a career. Most of my hours go to exploitation: agent infrastructure that has to be correct today. A deliberate fraction goes to exploration: RL, robotics, ideas with no obvious payoff. The fraction is the interesting decision.",
    "The cleanest version is the secretary problem. Candidates arrive one at a time, you must accept or reject each on the spot, and you want the best. The optimal rule: reject the first ~37% no matter how good they look, purely to learn what good looks like, then take the first one who beats them all.",
  ],
  /** paragraphs after the toy */
  after: [
    "The honest caveat: 37% assumes you can't go back and that only the very best counts. Relax either and the window shrinks. Knowing which assumptions your situation actually meets is most of the skill.",
  ],
};
