// ─────────────────────────────────────────────────────────────
//  Everything on the site comes from this file.
//  Edit, then run `node build.mjs` (Netlify runs it for you).
//  Anything set to null is hidden on the page, never faked.
// ─────────────────────────────────────────────────────────────

import cpData from "./cp.json" with { type: "json" };

const LEVELS = {
  Advanced: ["Dynamic Programming", "Divide and Conquer", "Backtracking", "Trie", "Segment Tree", "Binary Indexed Tree", "Union-Find", "Quickselect", "Ordered Set"],
  Intermediate: ["HashMap and Set", "Binary Search", "Math", "Greedy Algorithms", "Bit Manipulation", "Trees", "Binary Tree", "Recursion", "DFS", "BFS", "Design", "Brainteaser"],
  Fundamental: ["Arrays", "String", "Sorting", "Two Pointers", "Matrix", "Simulation", "Enumeration", "Linked Lists", "Queue and Stacks"],
};
function groupTopics(counts, minShown) {
  const known = new Set(Object.values(LEVELS).flat());
  const unknown = Object.keys(counts).filter((t) => !known.has(t));
  if (unknown.length) console.warn(`! topics with no level yet (add them to LEVELS in content.js): ${unknown.join(", ")}`);
  return Object.entries(LEVELS).map(([level, names]) => {
    const all = names.filter((n) => counts[n]).map((n) => [n, counts[n]]).sort((x, y) => y[1] - x[1]);
    return { level, items: all.filter(([, c]) => c >= minShown), more: all.filter(([, c]) => c < minShown) };
  });
}

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
    avatar: { src: "img/avatar.webp", alt: "Aman's avatar: a chibi character with messy black hair and a black hoodie", note: "a.k.a. Lucifer" },
    polaroid: { src: "img/haunted-house-level2.webp", alt: "Haunted House, level 2: a gargoyle's red vision cone sweeps a purple bedroom while the player sneaks past", caption: "haunted house, level 2" },
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
    alsoInto: ["VALORANT, AMVS", "AND ", { blue: "100 DAYS" }, " OF LEETCODE"],
    education: "B.Tech CSE · ABES Engineering College (AKTU) · 2028",
    lookingFor: "SDE internships now. Indie game dev later.",
  },

  links: {
    email: "amansingh.makemeup@gmail.com",
    github: "https://github.com/not-Lucifer",
    linkedin: "https://www.linkedin.com/in/thc-aman-singh/",
    leetcode: "https://leetcode.com/u/not_lucy_13/",
    codechef: "https://www.codechef.com/users/lucifer_609",
    resume: "/aman-singh-resume.pdf", // the PDF lives in site/
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
      screenshots: [
        { src: "img/gamestash-free-now.webp", label: "FREE NOW", alt: "GameStash's Free now tab: a spotlight on the giveaway ending soonest, store filters with counts, and a grid of free games" },
        { src: "img/gamestash-my-stash.webp", label: "MY STASH", alt: "GameStash's My stash tab: 12 claimed games worth Rs. 10,512 at list price, each with a button to open its store" },
        { src: "img/gamestash-profile.webp", label: "PROFILE", alt: "GameStash's profile page: games stashed, money saved, a per-store breakdown and an editable bio" },
      ],
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
        // Unity Play's game frame (the player without the page around it). Overrides the self-hosted build.
        embed: "https://play-prod.struckd.com/api/v1/games/game/7e52970d-9ecd-4dbd-9a49-3eefb72661fd/build/latest/frame",
        page: "https://play.unity.com/en/games/7e52970d-9ecd-4dbd-9a49-3eefb72661fd/haunted-house",
        aspect: "16 / 9",
      },
      screenshot: "img/haunted-house-level2.webp",
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
        // Unity Play's game frame, like Haunted House. Overrides the self-hosted build.
        embed: "https://play-prod.struckd.com/api/v1/games/game/b3080f64-4f1a-4d4f-ad74-fbd22210822d/build/latest/frame",
        page: "https://play.unity.com/en/games/b3080f64-4f1a-4d4f-ad74-fbd22210822d/kitchen-chaos",
        aspect: "16 / 9",
      },
      screenshot: "img/kitchen-chaos.webp",
    },
  ],

  firstProject: {
    name: "Roll-a-Ball",
    note: "where it started: my first Unity project",
    repo: "https://github.com/not-Lucifer/Roll-A-Ball",
  },

  // ── Competitive programming ───────────────────────────
  // Numbers come from cp.json. Refresh it with `node update-cp.mjs` (reads your Codolio profile).
  cp: {
    source: cpData.source,
    lastUpdated: cpData.lastUpdated,
    leetcode: {
      ...cpData.leetcode,
      topPercent: 58, // from the LeetCode profile itself: global rank 511,564 of 888,637
      language: "C++",
    },
    codechef: { ...cpData.codechef, division: "Div 4" },
    hackerrank: cpData.hackerrank,
    // Grouped the way LeetCode's own skills panel groups them. Topics under minShown are listed, not drawn.
    topics: groupTopics(cpData.leetcode.topics, 4),
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
    { group: "Tools", items: ["Git / GitHub", "VS Code", "Unity Editor", "Claude / Claude Code"] },
  ],
  // Listed on /certificates/ (each opens its PDF from site/certificates/). The main page shows only a small folder.
  certifications: [
    { name: "3D Stealth Game: Haunted House", issuer: "Unity Learn", date: "2026-10-18", length: "4h course", file: "unity-3d-stealth-game-haunted-house.pdf", course: "https://learn.unity.com/course/3d-stealth-game-haunted-house" },
    { name: "Exploratory Data Analysis", issuer: "NASSCOM FutureSkills Prime", date: "2026-10-16", note: "IT-ITeS Sector Skills Council", file: "nasscom-exploratory-data-analysis.pdf" },
    { name: "3D Beginner Game: Roll-a-Ball", issuer: "Unity Learn", date: "2026-06-20", length: "2h 50m course", file: "unity-roll-a-ball.pdf", course: "https://learn.unity.com/course/roll-a-ball" },
    { name: "Python Essentials 2", issuer: "Cisco Networking Academy", date: "2026-02-13", note: "with Python Institute, via ABES", file: "cisco-python-essentials-2.pdf" },
    { name: "Networking Basics", issuer: "Cisco Networking Academy", date: "2026-02-11", note: "via ABES Engineering College", file: "cisco-networking-basics.pdf" },
    { name: "Python Essentials 1", issuer: "Cisco Networking Academy", date: "2026-02-06", note: "with Python Institute, via ABES", file: "cisco-python-essentials-1.pdf" },
    { name: "Getting Started with Cisco Packet Tracer", issuer: "Cisco Networking Academy", date: "2025-10-30", note: "via ABES Engineering College", file: "cisco-packet-tracer.pdf" },
  ],
  afterHours: [
    { name: "Lucilock", what: "YouTube · Valorant & story-mode gaming", url: "https://www.youtube.com/@LuciLock-i2i" },
    { name: "Lucilock Hub", what: "Discord · gaming & content creation (founder)", url: "https://discord.com/invite/cQdYMTGSWV" },
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
