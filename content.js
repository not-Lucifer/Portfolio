// ─────────────────────────────────────────────────────────────
//  Everything on the site comes from this file.
//  Edit, then run `node build.mjs` (Netlify runs it for you).
//  Anything set to null is hidden on the page, never faked.
// ─────────────────────────────────────────────────────────────

export default {
  site: {
    url: "https://aman0singh-portfolio.netlify.app", // change if you move to a custom domain
    title: "Aman Singh · games & software",
    description:
      "Aman Singh, CSE student at ABES Engineering College (2028). I build software in C++ and Python, and games in Unity. Two of them are playable here.",
  },

  person: {
    name: ["AMAN", "SINGH"],
    alias: "Lucifer",
    location: "GHAZIABAD, INDIA",
    coords: "28.67° N, 77.45° E",
    timeZone: "Asia/Kolkata",
    tagline: ["building games & software,", "one project at a time."],
    intro: {
      before: "I'm a CSE student who builds software in C++ and Python, and ",
      underline: "games in Unity",
      after: ".",
    },
    currentlyInto: [
      { label: "GAMES", dot: "blue" },
      { label: "CODE", dot: "ink" },
      { label: "UNITY", dot: "yolk" },
      { label: "C++", dot: "red" },
    ],
    alsoInto: ["VALORANT, AMVS", "AND A ", { blue: "100-DAY" }, " LEETCODE STREAK"],
    education: "B.Tech CSE · ABES Engineering College (AKTU) · 2028",
    lookingFor: "SDE internships now. Indie game dev later.",
  },

  links: {
    email: "amansingh.makemeup@gmail.com",
    github: "https://github.com/not-Lucifer",
    linkedin: "https://www.linkedin.com/in/thc-aman-singh/",
    leetcode: "https://leetcode.com/u/not_lucy_13/",
    codechef: "https://www.codechef.com/users/lucifer_609",
    cv: null, // PLACEHOLDER: e.g. "/aman-singh-cv.pdf" (put the PDF in site/) or a Drive link
  },

  // ── Projects, in slide order ───────────────────────────────
  projects: [
    {
      id: "gamestash",
      accent: "red",
      title: ["GAME", "STASH"],
      tagline: "never miss a free game.",
      summary:
        "A Windows desktop app that tracks live free-game giveaways across Steam, Epic, GOG, Ubisoft, EA, Itch.io and more, and keeps a stash of the ones you've claimed.",
      category: "DESKTOP APP / C++",
      stack: ["C++", "WebView2", "SQLite", "CMake + vcpkg"],
      badge: "AI-assisted",
      statement: ["FREE GAMES ARE GREAT.", "MISSING THEM ISN'T."],
      repo: "https://github.com/not-Lucifer/GameStash-Free-Game-Tracker",
      cta: { label: "VIEW ON GITHUB", href: "https://github.com/not-Lucifer/GameStash-Free-Game-Tracker/releases" },
      blueprint: [
        { key: "UI", value: "WebView2" },
        { key: "CORE", value: "C++ · cpp-httplib · nlohmann-json" },
        { key: "DATA", value: "SQLite, on your machine" },
        { key: "FEED", value: "GamerPower API" },
        { key: "SHIP", value: "Inno Setup + GitHub Releases" },
      ],
      screenshot: null, // PLACEHOLDER: "img/gamestash.webp"
    },
    {
      id: "rag-qa",
      accent: "blue",
      title: ["ACADEMIC", "RAG QA"],
      tagline: "answers that cite the page.",
      summary:
        "Ask questions about your own study PDFs. Every answer cites the file and page, and questions your notes can't answer are refused before the LLM is ever called.",
      category: "AI / RETRIEVAL-AUGMENTED GENERATION",
      stack: ["Python", "FastAPI", "LangChain", "ChromaDB", "Streamlit"],
      badge: "AI-assisted",
      statement: ["SEARCHING NOTES IS SLOW.", "ASKING THEM IS FASTER."],
      repo: "https://github.com/not-Lucifer/RAG-based-Question-Answering-System",
      cta: { label: "VIEW ON GITHUB", href: "https://github.com/not-Lucifer/RAG-based-Question-Answering-System" },
      // Replayed from a real session (docs/screenshots in the repo), trimmed for length.
      chat: {
        question: "difference between biodata a cv and resume",
        answer: [
          "A biodata is a shortened form of biographical data and is now an obsolete term ",
          { cite: 1 },
          ". A CV is more detailed about academic credentials and is used for research positions ",
          { cite: 2 },
          ". A resume covers skills and experience for most job openings.",
        ],
        source: { file: "Unit 2 communication skills for Career building.pdf", page: "p.1" },
        status: "llama3.2:3b via Ollama · retrieval: mmr",
      },
      pipeline: ["UPLOAD", "CHUNK", "EMBED", "RETRIEVE", "ANSWER"],
      details: "Similarity, MMR or hybrid (BM25 + vector) retrieval, an optional cross-encoder reranker, OpenAI or local LLaMA. Evaluated with Hit@k, MRR and LLM-judged faithfulness.",
      screenshot: "img/rag/cited-answer.webp", // from the repo's docs/screenshots
    },
    {
      id: "fitvision",
      accent: "lime",
      title: ["FIT", "VISION"],
      tagline: "counts the reps for you.",
      summary:
        "A real-time webcam trainer: MediaPipe pose detection, rep counting for five exercises, and spoken coaching from an LLM. Built by a team of five.",
      category: "TEAM PROJECT / COMPUTER VISION",
      stack: ["Python", "MediaPipe", "Streamlit", "Groq", "Text-to-speech"],
      badge: "Team project",
      myPart: ["my part: redesigned the UI", "(with Claude Code) + co-wrote", "the research paper"],
      exercises: ["SQUAT", "PUSH-UP", "LUNGES", "BICEPS CURL", "SHOULDER PRESS"],
      statement: ["COUNTING REPS IS BORING.", "THE WEBCAM DOESN'T MIND."],
      repo: "https://github.com/not-Lucifer/FitVision-Mini-Project",
      cta: { label: "VIEW ON GITHUB", href: "https://github.com/not-Lucifer/FitVision-Mini-Project" },
      screenshot: null, // PLACEHOLDER: "img/fitvision.webp"
    },
    {
      id: "haunted-house",
      accent: "magenta",
      title: ["HAUNTED", "HOUSE"],
      tagline: "don't let them see you.",
      summary:
        "A 3D isometric stealth game. Sneak past patrolling ghosts and watchful gargoyles to reach the exit. Get spotted and the level restarts.",
      category: "3D STEALTH GAME / UNITY 6",
      stack: ["Unity 6", "C#", "URP", "Cinemachine", "Input System"],
      badge: "Tutorial + my additions",
      additions: "added: a second level, level progression, footstep audio",
      howItWorks: "Enemies see you through a trigger vision cone, then a raycast checks the line of sight.",
      controls: [{ keys: ["W", "A", "S", "D"], does: "move" }],
      statement: ["GHOSTS PATROL.", "YOU TIPTOE."],
      repo: "https://github.com/not-Lucifer/Haunted-House",
      play: {
        embed: null, // PLACEHOLDER: itch.io embed URL, e.g. "https://itch.io/embed-upload/1234567?color=151515"
        page: null, // PLACEHOLDER: itch.io game page, e.g. "https://not-lucifer.itch.io/haunted-house"
        aspect: "16 / 9",
      },
      screenshot: null, // PLACEHOLDER: "img/haunted-house.webp"
    },
    {
      id: "kitchen-chaos",
      accent: "yolk",
      title: ["KITCHEN", "CHAOS"],
      tagline: "orders up!",
      summary:
        "An Overcooked-style kitchen game: chop, fry, plate and deliver orders. Event-driven code, ScriptableObject recipes, rebindable keys, and a full menu, pause and game-over flow.",
      category: "ARCADE COOKING GAME / UNITY",
      stack: ["Unity", "C#", "ScriptableObjects", "Input System"],
      badge: "From Code Monkey's course",
      additions: "followed the course to the end, shipped v0.1.0",
      controls: [
        { keys: ["W", "A", "S", "D"], does: "move" },
        { keys: ["E"], does: "interact" },
        { keys: ["F"], does: "cut" },
        { keys: ["ESC"], does: "pause" },
      ],
      statement: ["THE ORDERS KEEP COMING.", "THE PAN KEEPS BURNING."],
      repo: "https://github.com/not-Lucifer/Kitchen-Chaos",
      play: {
        embed: null, // PLACEHOLDER: itch.io embed URL
        page: null, // PLACEHOLDER: itch.io game page
        aspect: "16 / 9",
      },
      screenshot: null, // PLACEHOLDER: "img/kitchen-chaos.webp"
    },
  ],

  firstProject: {
    name: "Roll-a-Ball",
    note: "where it started: my first Unity project",
    repo: "https://github.com/not-Lucifer/Roll-A-Ball",
  },

  // ── Competitive programming. Update by hand. ──────────────
  cp: {
    lastUpdated: "2026-10-20", // PLACEHOLDER: confirm these numbers are current
    leetcode: {
      handle: "not_lucy_13",
      rating: 1461,
      peak: 1507,
      contests: 4,
      topPercent: 58, // global rank 511,564 / 888,637
      solved: null, // PLACEHOLDER: exact total, e.g. 141
      split: null, // PLACEHOLDER: { easy: 0, medium: 0, hard: 0 }
      solvedApprox: "~140",
      badges: ["50 Days Badge 2026", "100 Days Badge 2026"],
      language: "C++",
    },
    codechef: {
      handle: "lucifer_609",
      rating: 1171,
      stars: 1,
      division: "Div 4",
      contests: 11,
      solved: 182,
    },
    topics: [
      { level: "Advanced", items: [["Dynamic Programming", 11], ["Divide and Conquer", 6], ["Backtracking", 1]] },
      { level: "Intermediate", items: [["Hash Table", 31], ["Binary Search", 29], ["Math", 21]] },
      {
        level: "Fundamental",
        items: [["Array", 93], ["String", 30], ["Sorting", 26], ["Two Pointers", 22], ["Matrix", 9], ["Simulation", 9], ["Stack", 6], ["Enumeration", 3]],
      },
    ],
  },

  // ── How I work with AI ────────────────────────────────────
  ai: {
    steps: [
      ["Idea", "pick something worth building"],
      ["Specify", "write down what it must do"],
      ["Generate with AI", "Claude & Claude Code draft it"],
      ["Review & understand", "read it until I can explain it"],
      ["Test & debug", "break it, fix it, again"],
      ["Ship", "release, installer, README"],
    ],
    myPart: [
      "choosing what to build",
      "writing clear requirements",
      "reviewing and testing every change",
      "fixing the bugs",
      "knowing the architecture well enough to explain it",
    ],
    canExplain: [
      {
        project: "GameStash",
        points: [
          "how the C++ core and the WebView2 UI talk to each other",
          "why the data lives in local SQLite and not a server",
          "how giveaways come in from the GamerPower API",
          "how update alerts read GitHub Releases",
        ],
      },
      {
        project: "RAG QA",
        points: [
          "ingestion: PDF → chunks that keep file + page",
          "embeddings in ChromaDB, and similarity vs MMR vs hybrid BM25",
          "how out-of-scope questions get refused before the LLM",
          "what Hit@k, MRR and faithfulness actually measure",
        ],
      },
      {
        project: "FitVision UI",
        points: ["what I changed in the default Streamlit UI, and why"],
      },
    ],
  },

  // ── Toolbox, certificates, after hours ────────────────────
  skills: [
    { group: "Languages", items: ["C", "C++", "C#", "Python", "HTML", "CSS"] },
    { group: "Game dev", items: ["Unity", "C# scripting", "URP", "Cinemachine", "Input System", "UI Toolkit", "ScriptableObjects"] },
    { group: "Backend / AI", items: ["FastAPI", "LangChain", "ChromaDB", "SQLite", "Streamlit", "MediaPipe (team)"] },
    { group: "Problem solving", items: ["Data Structures & Algorithms in C++"] },
    { group: "Networking", items: ["Network protocols", "Cisco Packet Tracer"] },
    { group: "Tools", items: ["Git / GitHub", "Claude / Claude Code"] },
  ],
  certifications: {
    issuer: "Cisco Networking Academy",
    items: [
      { name: "Networking Basics", url: null }, // PLACEHOLDER: credential link
      { name: "Packet Tracer", url: null },
      { name: "Python Essentials 1", url: null },
      { name: "Python Essentials 2", url: null },
    ],
  },
  afterHours: [
    { name: "Lucilock", what: "YouTube · Valorant & story-mode gaming", url: null }, // PLACEHOLDER: channel URL
    { name: "Shadow Sync", what: "YouTube · AMVs", url: null }, // PLACEHOLDER: channel URL
    { name: "The Hollow Crew", what: "Discord · gaming & content creation (founder)", url: null }, // PLACEHOLDER: invite link
  ],
  afterHoursSkills: "video editing, visual design, showing up every week",

  // ── Closing notebook ──────────────────────────────────────
  notebook: {
    notes: [
      ["I learn by ", { circle: "building the thing" }, ", then reading how it works."],
      ["I use AI to go faster,", " never to skip understanding."],
      ["Games first. ", "But I'll happily debug your C++."],
    ],
    ticket: ["ABES · CSE '28", "B.TECH, THIRD YEAR"],
    nextCaption: "open to SDE internships. someday, indie games.",
  },
};
