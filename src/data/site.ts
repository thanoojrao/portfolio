export type Mode = "exploit" | "explore";

export const profile = {
  name: "Thanooj Lingampally",
  handle: "thanooj",
  title: "Founding AI Engineer",
  org: { name: "Dottr", url: "https://dottr.ai" },
  tagline:
    "First engineer at an AI contract-intelligence startup. I own the Claude agent loop, its honesty guards and evals, signature-field detection, and the AWS infrastructure under it. I build the unglamorous parts that keep agents honest in production.",
  location: "New York, NY · open to relocating, San Francisco preferred",
  email: "thanoojlingampally@gmail.com",
  github: "https://github.com/thanoojrao",
  linkedin: "https://linkedin.com/in/thanooj-lingampally",
  resume: "/resume.pdf" as string | null,
};

export const stack = [
  "Python",
  "Claude / Amazon Bedrock",
  "LangGraph",
  "FastAPI",
  "PostgreSQL",
  "pgvector",
  "DynamoDB",
  "SQS",
  "ECS Fargate",
  "Terraform",
  "Docker",
  "GitHub Actions",
  "PyTorch",
  "ONNX",
  "MLflow",
  "Cohere embeddings",
  "Docling / Textract",
  "TypeScript / Next.js",
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
    period: "Jan 2026 — present",
    kind: "work",
    lines: [
      "First engineer. Own the backend and the agent for a contract-intelligence and e-signing product with paying customers, across several deployed services on AWS.",
      "The Claude-on-Bedrock agent behind chat and email: tool calling at scale, prompt-cache-aware context assembly, a layered honesty guard that verifies every claimed action, and an eval harness that replays real flows against every prompt and model change.",
      "Took time to first token from tens of seconds to under two by streaming while the guard audits concurrently and retracts on failure.",
      "Signature-field detection as a propose-then-select pipeline: a small quantised detector proposes, Claude selects, with the eval set built before the model.",
      "Multilingual document ingestion, log-fingerprinted alert triage, deploy gating on the test suite, and the infrastructure and cost hygiene that a one-engineer backend needs.",
    ],
  },
  {
    org: "Tata Consultancy Services",
    role: "ML Engineer",
    period: "Dec 2022 — Aug 2024",
    kind: "work",
    lines: [
      "Scoped and built a customer-facing RAG platform for 10K+ enterprise users, working directly with business stakeholders under corporate security and compliance requirements.",
      "Spring Boot microservices connecting legacy enterprise databases to ML pipelines.",
      "Led the MLflow-based MLOps pipeline for model versioning, tracking, and promotion to production.",
    ],
  },
  {
    org: "Counselit",
    role: "Software Engineering Intern",
    period: "Apr 2021 — Aug 2021",
    kind: "work",
    lines: ["Node.js and Express REST APIs and React interfaces for client pilots, with JWT auth and role-based access control."],
  },
  {
    org: "University at Buffalo",
    role: "MS Computer Science, Artificial Intelligence",
    period: "Aug 2024 — Dec 2025",
    kind: "school",
    lines: [
      "Reinforcement Learning · Machine Learning · Pattern Recognition · NLP · Computer Vision & Image Processing",
      "Data-Intensive Computing · Algorithm Analysis & Design · Numerical Methods · Fundamentals of AI",
    ],
  },
  {
    org: "NIT Durgapur",
    role: "BTech",
    period: "2019 — 2023",
    kind: "school",
    lines: ["Robocell, the robotics club."],
  },
];

export type Project = {
  slug: string;
  /** short label for the bandit graph */
  short?: string;
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
    slug: "dottr-agent",
    short: "agent",
    title: "An agent that has to be honest about what it did",
    org: "Dottr",
    period: "2026 — present",
    mode: "exploit",
    exploit: 0.97,
    explore: 0.3,
    reward: "in production",
    rewardKnown: true,
    summary:
      "The Claude-on-Bedrock agent behind Dottr's chat and email: dozens of tools, a layered honesty guard, an eval harness that replays real flows, and a streaming design that took time to first token from tens of seconds to under two.",
    tags: ["Claude on Bedrock", "tool calling", "evals", "prompt caching", "streaming"],
    links: [{ label: "dottr.ai", href: "https://dottr.ai" }],
    sections: [
      {
        heading: "Problem",
        body: [
          "A contract-intelligence agent reads, fills, routes and signs documents for paying customers. The demo is easy. The hard part is an agent that says it sent something it did not, or takes an action nobody authorised, or makes the user wait so long the product feels broken.",
        ],
      },
      {
        heading: "How it is built",
        body: [
          "Tool calling across dozens of tools, with context assembled to keep the prompt cache warm so long conversations stay fast and cheap.",
          "A layered honesty guard: before the user sees a claim like 'sent to the counterparty', the claim is checked against records the system actually owns. If the check fails, the claim is retracted.",
          "An eval harness built from recorded real flows, replayed in CI against every prompt and model change, so a regression in planning or tool use fails a build instead of reaching an inbox.",
          "Streaming with concurrent auditing: the reply starts immediately while the guard runs alongside it. Time to first token went from tens of seconds to under two, without giving up the guarantee.",
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
    short: "sigdet",
    title: "Finding where to sign: a detector proposes, Claude selects",
    org: "Dottr",
    period: "2026",
    mode: "exploit",
    exploit: 0.9,
    explore: 0.45,
    reward: "in production",
    rewardKnown: true,
    summary:
      "Signature-field detection as a propose-then-select pipeline: a small quantised object detector finds candidates cheaply, and Claude picks the right ones using the document's text. The eval set was built before the model, and it paid for itself on day one.",
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
          "Propose: a small int8-quantised object detector, exported to ONNX, runs on CPU and returns candidate boxes for a page in well under a second.",
          "Select: Claude sees the candidates together with the document's text and structure and decides which are real signature fields, whose they are, and what kind.",
          "Measure first: a human-reviewed evaluation set of hundreds of documents and thousands of boxes existed before the pipeline did. On its first run it exposed a coordinate-transform bug that had silently placed a large share of candidates off the page. No one would have seen that by eyeballing outputs.",
          "Every alternative got the same treatment: document parsers, detection vendors and placement models were benchmarked head to head on the same set before any of them was adopted.",
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
    short: "rag",
    title: "A RAG platform for ten thousand enterprise users",
    org: "Tata Consultancy Services",
    period: "2022 — 2024",
    mode: "exploit",
    exploit: 0.82,
    explore: 0.3,
    reward: "shipped",
    rewardKnown: true,
    summary:
      "A customer-facing retrieval-augmented question answering platform over enterprise documents, scoped with business stakeholders and built to corporate security and compliance requirements.",
    tags: ["RAG", "LangGraph", "Spring Boot", "MLflow", "MLOps"],
    links: [],
    sections: [
      {
        heading: "Problem",
        body: [
          "Enterprise document collections are large, messy and full of near-duplicates, and the people who need answers from them are not engineers. A single retrieve-then-answer chain gave confident wrong answers whenever retrieval missed.",
        ],
      },
      {
        heading: "What I did",
        body: [
          "Scoped the platform directly with business stakeholders and built it to their security and compliance requirements, for a user base of over ten thousand.",
          "Modelled the pipeline as a LangGraph state machine with explicit nodes for query rewriting, retrieval, grading of retrieved chunks and a fallback path when nothing relevant was found.",
          "Spring Boot microservices with secure REST endpoints connecting legacy enterprise databases to the ML pipelines.",
          "Led the MLflow-based MLOps pipeline for model versioning, tracking and promotion to production.",
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
    slug: "citi-bike-mlops",
    short: "citibike",
    title: "Citi Bike demand forecasting, end to end",
    org: "University at Buffalo",
    period: "Spring 2025",
    mode: "exploit",
    exploit: 0.75,
    explore: 0.4,
    reward: "MAE 139 → 34.4",
    rewardKnown: true,
    summary:
      "Station-level demand for New York's bike share in six-hour buckets, as a scheduled pipeline with a feature store, model registry and a monitoring dashboard, not a notebook.",
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
    short: "anymal",
    title: "Goal-conditioned quadruped navigation with a Mixture-of-Experts policy",
    org: "University at Buffalo",
    period: "2025",
    mode: "explore",
    exploit: 0.5,
    explore: 0.95,
    reward: "92% success",
    rewardKnown: true,
    summary:
      "The ANYmal C robot in MuJoCo, first taught to walk with PPO, then to reach targets with a Mixture-of-Experts policy in PyTorch: 92% success on target-reaching within 200 timesteps.",
    tags: ["MuJoCo", "PyTorch", "Mixture-of-Experts", "PPO", "robotics"],
    links: [{ label: "github (checkpoint)", href: "https://github.com/thanoojrao/RL_quadruped_locomotion" }],
    sections: [
      {
        heading: "What it is",
        body: [
          "A custom Gymnasium environment around the ANYbotics ANYmal C model from the MuJoCo Menagerie. Observations are joint positions and velocities, actions are the twelve actuator torques, and an episode ends when the body drops below 20 cm.",
          "Stage one: locomotion. A reward of forward velocity plus a posture bonus minus an action-cost penalty, trained with PPO from Stable-Baselines3, with video captured every ten thousand steps so the gait can be watched improving from falling over to an early walk.",
          "Stage two: goal-conditioned navigation. The observation gains a target, and the policy becomes a Mixture-of-Experts network in PyTorch, with a gating network choosing among specialist experts per step. It reaches 92% success on target-reaching tasks within 200 timesteps.",
        ],
      },
      {
        heading: "Why it is here",
        body: [
          "Agents that act in the physical world have all the problems of software agents, with worse failure modes. This is the arm I keep pulling outside work.",
        ],
      },
    ],
  },
  {
    slug: "warehouse-rl",
    short: "warehse",
    title: "A warehouse robot environment, solved with Q-learning and SARSA",
    org: "University at Buffalo",
    period: "Spring 2025",
    mode: "explore",
    exploit: 0.4,
    explore: 0.8,
    reward: "unknown",
    rewardKnown: false,
    summary:
      "A 2D grid world I designed from scratch: a robot picks up objects and delivers them around obstacles, in deterministic and stochastic versions, then tabular RL learns to do it.",
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
        heading: "Why it is here",
        body: [
          "This is where the theme of this site comes from. Watching epsilon decay change what the agent found was the first time explore versus exploit felt like a real decision rather than a formula.",
        ],
      },
    ],
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
