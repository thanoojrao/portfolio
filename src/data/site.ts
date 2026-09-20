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
    period: "Aug 2023 — Jan 2025",
    kind: "school",
    lines: [
      "Reinforcement Learning · Machine Learning · Pattern Recognition · NLP · Computer Vision & Image Processing",
      "Data-Intensive Computing · Algorithm Analysis & Design · Numerical Methods · Fundamentals of AI",
    ],
  },
  {
    org: "NIT Durgapur",
    role: "BTech",
    period: "",
    kind: "school",
    lines: ["Robocell, the robotics club."],
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
    slug: "citi-bike-mlops",
    title: "Citi Bike demand forecasting, end to end",
    org: "University at Buffalo",
    period: "Spring 2025",
    mode: "exploit",
    exploit: 0.8,
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
    title: "Teaching a quadruped to walk with PPO",
    org: "University at Buffalo",
    period: "Spring 2025",
    mode: "explore",
    exploit: 0.35,
    explore: 0.95,
    reward: "unknown",
    rewardKnown: false,
    summary:
      "The ANYmal C robot in MuJoCo, wrapped as a Gymnasium environment and trained from scratch with PPO. It walks. Not well yet. That is the point.",
    tags: ["MuJoCo", "Gymnasium", "PPO", "Stable-Baselines3", "robotics"],
    links: [{ label: "github", href: "https://github.com/thanoojrao/RL_quadruped_locomotion" }],
    sections: [
      {
        heading: "What it is",
        body: [
          "A custom environment around the ANYbotics ANYmal C model from the MuJoCo Menagerie. Observations are joint positions and velocities, actions are the twelve actuator torques, and an episode ends when the body drops below 20 cm.",
          "Reward is forward velocity, plus a bonus for keeping the body up, minus a small penalty on action magnitude. Trained with PPO from Stable-Baselines3, with TensorBoard logs and video captured every ten thousand steps so the gait can be watched improving.",
        ],
      },
      {
        heading: "Where it stands",
        body: [
          "After 100k timesteps the policy averages a few hundred reward per episode with a wide spread between runs. That is an early, wobbly gait, not a controller. Next steps are a longer run, a reward that cares about posture and energy, and domain randomisation.",
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
