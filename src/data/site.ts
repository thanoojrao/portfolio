export type Mode = "exploit" | "explore";

export const profile = {
  name: "Thanooj Lingampally",
  handle: "thanooj",
  title: "Founding AI Engineer",
  org: { name: "Dottr", url: "https://dottr.ai" },
  tagline:
    "I build the unglamorous parts of production agents: failure semantics, context budgeting, cost/latency routing, tool permissioning, prompt-injection defenses, and trajectory-level evals.",
  location: "Buffalo, NY",
  email: "thanoojlingampally@gmail.com",
  github: "https://github.com/thanoojrao",
  linkedin: "https://linkedin.com/in/thanooj-lingampally",
  resume: null as string | null, // set to "/resume.pdf" once the file is in public/
};

export const stack = [
  "Python",
  "LangGraph",
  "LangChain",
  "Claude (Bedrock)",
  "LiteLLM",
  "pgvector",
  "Cohere embeddings",
  "Docling / Textract",
  "PostgreSQL",
  "TypeScript",
];

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
    period: "2025 — present",
    kind: "work",
    lines: [
      "Own the agentic layer of an e-signing platform, from tool design to evals.",
      "Failure semantics, context budgeting, cost/latency routing across Claude models on Bedrock via LiteLLM.",
      "Tool permissioning and prompt-injection defenses for agents that act on customer documents.",
    ],
  },
  {
    org: "Tata Consultancy Services",
    role: "ML Engineer",
    period: "before grad school",
    kind: "work",
    lines: [
      "Built a LangGraph-based RAG system for enterprise documents.",
      "Retrieval, chunking, and evaluation for question answering over internal corpora.",
    ],
  },
  {
    org: "University at Buffalo",
    role: "MS Computer Science, AI",
    period: "2023 — 2025",
    kind: "school",
    lines: ["Coursework and projects in ML, RL, and data-intensive systems."],
  },
  {
    org: "NIT Durgapur",
    role: "BTech",
    period: "",
    kind: "school",
    lines: [],
  },
];

export type Project = {
  slug: string;
  title: string;
  org?: string;
  period: string;
  mode: Mode;
  /** confidence that this is proven, 0..1 */
  exploit: number;
  /** novelty / uncertainty, 0..1 */
  explore: number;
  /** short reward line shown on the card */
  reward: string;
  rewardKnown: boolean;
  summary: string;
  tags: string[];
  links: { label: string; href: string }[];
  sections: { heading: string; body: string[] }[];
};

export const projects: Project[] = [
  {
    slug: "dottr-agentic-layer",
    title: "Agentic layer for an e-signing platform",
    org: "Dottr",
    period: "2025 — present",
    mode: "exploit",
    exploit: 0.96,
    explore: 0.3,
    reward: "in production",
    rewardKnown: true,
    summary:
      "The agent runtime behind Dottr: how agents read, fill, route and sign documents without doing something expensive, slow or unsafe.",
    tags: ["LangGraph", "Claude on Bedrock", "LiteLLM", "pgvector", "evals"],
    links: [{ label: "dottr.ai", href: "https://dottr.ai" }],
    sections: [
      {
        heading: "Problem",
        body: [
          "An e-signing product wants agents that can understand a contract, fill it, route it to the right people and act on it. The demo is easy. The hard part is everything that happens when the model is wrong, slow, over budget, or being manipulated by the document it is reading.",
        ],
      },
      {
        heading: "What I own",
        body: [
          "Failure semantics: every tool call has a defined outcome for timeout, partial success and refusal, so the graph never ends in an ambiguous state.",
          "Context budgeting: a token budget per step and per trajectory, with summarisation and retrieval that degrade gracefully instead of overflowing.",
          "Cost and latency routing: requests are routed across Claude models on Bedrock through LiteLLM based on task difficulty and SLA, with fallbacks.",
          "Tool permissioning: agents get scoped capabilities per document and per user, enforced outside the prompt.",
          "Prompt-injection defenses: untrusted document text is isolated from instructions, and actions with side effects require a verified intent.",
          "Trajectory-level evals: we grade whole runs, not single responses, so regressions in planning show up before customers see them.",
        ],
      },
      {
        heading: "Decisions I would defend",
        body: [
          "Treat the document as an adversary by default. It costs a little latency and removes an entire class of incidents.",
          "Grade trajectories, not answers. A correct final answer reached through a dangerous path is still a failure.",
        ],
      },
      {
        heading: "Outcome",
        body: [
          "Running in production for real customers. Specific numbers are private; ask me in an interview and I will walk through the eval dashboards.",
        ],
      },
    ],
  },
  {
    slug: "tcs-langgraph-rag",
    title: "LangGraph RAG for enterprise documents",
    org: "Tata Consultancy Services",
    period: "ML Engineer",
    mode: "exploit",
    exploit: 0.82,
    explore: 0.35,
    reward: "shipped",
    rewardKnown: true,
    summary:
      "A retrieval-augmented question answering system over internal corpora, built as a LangGraph state machine rather than a single chain.",
    tags: ["LangGraph", "RAG", "embeddings", "evaluation"],
    links: [],
    sections: [
      {
        heading: "Problem",
        body: [
          "Enterprise document collections are large, messy and full of near-duplicates. A single retrieve-then-answer chain gave confident wrong answers whenever retrieval missed.",
        ],
      },
      {
        heading: "What I did",
        body: [
          "Modelled the pipeline as a graph with explicit nodes for query rewriting, retrieval, grading of retrieved chunks and a fallback path when nothing relevant was found.",
          "Built the chunking and embedding pipeline and an evaluation set so retrieval quality could be measured, not guessed.",
        ],
      },
      {
        heading: "What I learned",
        body: [
          "Most RAG failures are retrieval failures. Making the system admit 'not found' was worth more than any prompt tweak.",
        ],
      },
    ],
  },
  {
    slug: "citi-bike",
    title: "Citi Bike demand forecasting",
    org: "University at Buffalo",
    period: "2025",
    mode: "explore",
    exploit: 0.4,
    explore: 0.6,
    reward: "unknown",
    rewardKnown: false,
    summary:
      "Forecasting station-level demand for New York's bike share from trip history and weather, with a feature pipeline and model comparison.",
    tags: ["Python", "pandas", "time series", "notebooks"],
    links: [{ label: "github", href: "https://github.com/thanoojrao/citi_bike" }],
    sections: [
      {
        heading: "What it is",
        body: [
          "A grad-school project on the Citi Bike open dataset: cleaning trip records, building hourly and station-level features, and comparing forecasting models.",
        ],
      },
      {
        heading: "Why it's in Explore",
        body: [
          "It was a learning project. The interesting part was the feature engineering and the honest model comparison, not a production result.",
        ],
      },
    ],
  },
  {
    slug: "sp25-taxi",
    title: "NYC taxi demand, end to end",
    org: "University at Buffalo",
    period: "Spring 2025",
    mode: "explore",
    exploit: 0.45,
    explore: 0.55,
    reward: "unknown",
    rewardKnown: false,
    summary:
      "An end-to-end ML pipeline on NYC taxi data: ingestion, feature store, training, and a served prediction, built as a course project.",
    tags: ["Python", "MLOps", "feature pipeline", "notebooks"],
    links: [{ label: "github", href: "https://github.com/thanoojrao/sp25_taxi-main" }],
    sections: [
      {
        heading: "What it is",
        body: [
          "The full lifecycle rather than one model: raw data to features to a trained model to a small serving layer, with the plumbing that usually gets skipped in notebooks.",
        ],
      },
    ],
  },
  {
    slug: "rl-environment",
    title: "A custom reinforcement learning environment",
    period: "2025",
    mode: "explore",
    exploit: 0.3,
    explore: 0.85,
    reward: "unknown",
    rewardKnown: false,
    summary:
      "Building an environment from scratch to understand what an agent actually observes, and how reward shaping changes what it learns.",
    tags: ["RL", "Gymnasium", "Python"],
    links: [{ label: "github", href: "https://github.com/thanoojrao/rl_environment" }],
    sections: [
      {
        heading: "What it is",
        body: [
          "A hand-built environment with its own observation and action spaces, used to train and compare simple agents. This is also where the theme of this site comes from.",
        ],
      },
    ],
  },
  {
    slug: "perplexity",
    title: "Perplexity experiments",
    period: "2025",
    mode: "explore",
    exploit: 0.25,
    explore: 0.8,
    reward: "unknown",
    rewardKnown: false,
    summary:
      "Small experiments around language-model perplexity: measuring it, and seeing what it does and does not tell you about output quality.",
    tags: ["LLMs", "evaluation", "notebooks"],
    links: [{ label: "github", href: "https://github.com/thanoojrao/perplexity" }],
    sections: [
      {
        heading: "What it is",
        body: ["Notebook-scale experiments. Low reward so far, high information."],
      },
    ],
  },
  {
    slug: "robotics",
    title: "Robotics and embodied AI",
    period: "ongoing",
    mode: "explore",
    exploit: 0.1,
    explore: 1.0,
    reward: "unknown",
    rewardKnown: false,
    summary:
      "The arm I keep pulling outside work. Agents that act in the physical world have the same problems as software agents, with worse failure modes.",
    tags: ["robotics", "embodied AI", "reading"],
    links: [],
    sections: [
      {
        heading: "Status",
        body: [
          "An open arm. Reading, small experiments, no shipped result yet. If you work on this, I would like to talk.",
        ],
      },
    ],
  },
];

export const whyNote = {
  title: "on exploration vs exploitation",
  paragraphs: [
    "In reinforcement learning an agent has to choose between the action it already knows pays off and an action it has not tried yet. Pull the known arm and you collect a reliable reward. Pull an unknown one and you might find something better, or waste the pull.",
    "I think the same trade-off runs through a career, and through a life. Most of my working hours go to exploitation: shipping agent infrastructure that has to be correct today. A deliberate fraction goes to exploration: reinforcement learning, robotics, ideas with no obvious payoff. The fraction is the interesting decision. Too little and you plateau. Too much and nothing compounds.",
    "The cleanest version of this is the secretary problem. You see n candidates one at a time, must accept or reject each on the spot, and want the best. The optimal strategy is to reject the first n/e of them, about 37%, no matter how good they look, purely to learn what good looks like, then take the first one who beats everyone so far. That first 37% is exploration you have already decided to pay for. It shows up in apartment hunting, hiring, and job offers with deadlines: anywhere options arrive in sequence and cannot be revisited.",
    "The honest caveat is that the 37% assumes no recall and that only the very best counts. Relax either and the exploration window shrinks. Knowing which assumptions your situation actually meets is most of the skill.",
    "This site is built the same way. Flip the switch or move the slider and you change the policy. Exploit shows the work I am confident in. Explore shows the arms I am still pulling.",
  ],
};
