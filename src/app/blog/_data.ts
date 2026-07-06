/**
 * Blog content for Steady Steps Coaching.
 *
 * Articles are data-driven: `List.tsx` renders the card grid from `blogPosts`
 * and `Article.tsx` renders a single post by `slug`. Content is expressed as a
 * sequence of typed blocks so the article layout stays consistent across posts.
 */

import likerAvatar from "../../imports/avatar.png";

export type ContentBlock =
  | { type: "lead"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "quote"; text: string; attribution?: string; small?: boolean }
  | { type: "list"; items: string[] }
  | {
      /** Embedded MP4 video. Defaults to a vertical short-form frame (9/16, 360px). */
      type: "video";
      /** Public path to the .mp4, e.g. "/videos/clip.mp4". */
      src: string;
      /** Optional thumbnail shown before playback, e.g. "/images/thumb.jpg". */
      poster?: string;
      caption?: string;
      /**
       * Sets sensible frame defaults:
       *   "portrait" (default) → 9/16 short capped at 360px
       *   "landscape"          → 16/9 filling the article column
       */
      orientation?: "portrait" | "landscape";
      /** Override the CSS aspect-ratio (e.g. "4 / 3"). */
      aspectRatio?: string;
      /** Override the max width of the player (e.g. "480px"). */
      maxWidth?: string;
    };

export interface Author {
  name: string;
  avatar: string;
  bio: string;
  articles: number;
  followers: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  /** Renders the "Sponsored" badge on the card when true. */
  sponsored?: boolean;
  author: Author;
  /** Short display date, e.g. "Jan 18". */
  date: string;
  readTime: string;
  tags: string[];
  likes: number;
  comments: number;
  content: ContentBlock[];
}

const chelsea: Author = {
  name: "Chelsea",
  avatar: likerAvatar,
  bio: "Chelsea is a mental-health and life coach with 15+ years helping people make personal growth feel natural, sustainable, and kind.",
  articles: 3,
  followers: "",
};

export const blogPosts: BlogPost[] = [
  {
    slug: "ai-cannot-replace-humans",
    title: "Why AI Can't Replace Your Coach",
    excerpt:
      "AI can be a powerful tool, but it can't remember your journey or feel the weight of your experience. Here's why the human connection remains irreplaceable.",
    image: "/ai-coaching-fails.jpg",
    author: chelsea,
    date: "Jun 25",
    readTime: "5 min read",
    tags: ["AI Coaching", "Human Connections", "Habits", "Mindset", "Growth", "Self-care"],
    likes: 875,
    comments: 0,
    content: [
      {
        type: "lead",
        text: "In an era where you can ask a computer to write an essay, debug code, or even generate a workout plan, it is tempting to wonder: *Can AI replace a Life Coach*?",
      },
      {
        type: "paragraph",
        text: "While artificial intelligence can be a powerful tool for productivity, data analysis, and organization, it lacks the most fundamental component of genuine progress: shared **human experience.**",
      },
      {
        type: "video",
        src: "/videos/ai-vs-human-v2.mp4",
        poster: "/ai-vs-human.jpg",
        caption: "Why the human connection still matters",
        orientation: "landscape",
      },
      {
        type: "paragraph",
        text: "When you engage in **1:1 coaching**, you aren’t just looking for output—you are looking for a mirror, a partner, and a witness to your growth. Here is why the human element remains irreplaceable in your journey toward your goals.",
      },

      {
        type: "heading",
        text: "1. The Gift of Being Remembered",
      },
      {
        type: "paragraph",
        text: "In my practice, I’ve seen how exhausting it is for anyone to feel like they’re constantly starting over. Because AI generates responses based only on the current conversation, it doesn’t actually retain the history of your growth.",
      },
      {
        type: "paragraph",
        text: 'Relying on technology for support often forces you to re-explain your background, your challenges, and your goals every single time—it’s like hitting "reset" on your own progress. For anyone seeking real change, that is more than just a technical hurdle; it’s a nightmare. It creates a cycle of frustration where you’re stuck rehashing the past just to get a "bot" up to speed, rather than using your time to actually move forward. You deserve to be heard by someone who **remembers your journey** as clearly as you do, so you can focus entirely on what matters most today.',
      },
      {
        type: "heading",
        text: '2. The Power of "In-Between" Communication',
      },
      {
        type: "paragraph",
        text: 'AI models are trained on patterns of language, but they cannot read the "in-between."',
      },
      {
        type: "video",
        src: "/videos/how_subtext_reveals.mp4",
        poster: "/how-subtext-reveals.jpg",
        caption: "Why the human connection still matters",
      },
      {
        type: "paragraph",
        text: "A human coach provides a depth of connection that an automated tool completely misses by tuning into the unspoken elements of our dialogue.",
      },
      {
        type: "paragraph",
        text: "A coach hears what you say, but they also tune into what you *don’t* say; they notice the weight of a sigh, a subtle shift in your tone, a change in posture, or the specific hesitation in your voice when you discuss a certain goal. This subtext often reveals where you are truly stuck or where you might be minimizing your own achievements.",
      },
      {
        type: "heading",
        text: "3. Radical Accountability vs. Algorithmic Reminders",
      },
      {
        type: "paragraph",
        text: 'AI can send you a push notification to "drink more water" or "work on your project." That is a reminder. Accountability, however, is a **relational commitment**.',
      },
      {
        type: "paragraph",
        text: "When you show up for a coaching session, you are entering a supportive professional partnership. Knowing that another person—someone who understands your vision and is deeply invested in your success—is waiting to hear about your progress creates a level of psychological commitment that an automated bot simply cannot replicate.",
      },
      {
        type: "heading",
        text: "4. Empathy: A Foundation of Growth",
      },
      {
        type: "paragraph",
        text: "Deep-level coaching requires empathy. True empathy requires the capacity to *feel*, or at least fully *understand* the weight of another’s experience.",
      },
      {
        type: "paragraph",
        text: "AI can simulate supportive language, but it has never felt fear, felt the sting of a setback, or experienced the triumph of a hard-won victory. It doesn't have a personal stake in your outcome. The trust built in a 1:1 coaching relationship—the kind that allows you to be vulnerable enough to welcome real change—is founded on the reality that you are working with a fellow human being.",
      },
      {
        type: "heading",
        text: "5. Safety and Professional Ethics",
      },
      {
        type: "paragraph",
        text: "AI is not designed to navigate the complexities of emotional distress or deep-seated psychological patterns. It cannot provide the ethical and human-to-human care necessary for personal growth and emotional well-being.",
      },
      {
        type: "paragraph",
        text: "True growth requires a safe space—and that kind of environment is built through the professional, human-centered dedication that only a dedicated professional can provide. If you are struggling with your mental health, it is important to seek the right professional and learn about appropriate resources best suited for your needs to ensure that you feel safe and supported.",
      },
      {
        type: "heading",
        text: "The Bottom Line",
      },
      {
        type: "paragraph",
        text: "Think of AI as a **digital assistant**—it’s great for drafting emails, organizing a calendar, or summarizing information. But when it comes to the messy, beautiful, and complex work of becoming who you want to be, you need a human partner.",
      },
      {
        type: "paragraph",
        text: "**You are not a data point.** You are a person with a story, and that story deserves to be heard by someone who can truly listen.",
      },
    ],
  },
  {
    slug: "the-art-of-saying-no",
    title: "The Art of Saying No",
    excerpt:
      "Protecting your bandwidth isn't selfish—it's how you stay steady. A gentle guide to setting boundaries that hold.",
    image:
      "https://images.unsplash.com/photo-1542125387-c71274d94f0a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=560&q=80",
    author: chelsea,
    date: "Jan 11",
    readTime: "6 min read",
    tags: ["Boundaries", "Energy", "Well-being"],
    likes: 642,
    comments: 24,
    content: [
      {
        type: "lead",
        text: "Many people spend so much time caring for responsibilities that they rarely pause to listen to their own needs. Learning to say no is one of the kindest things you can do for yourself—and for the people who rely on you.",
      },
      {
        type: "paragraph",
        text: "A boundary isn't a wall. It's a clear, honest line that tells people how to work with you. When you protect your energy, you show up more fully for the things that matter most.",
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1670272498380-eb330b61f3cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=560&q=80",
        alt: "Two people in conversation over coffee",
        caption: "A clear, kind no makes room for a wholehearted yes.",
      },
      {
        type: "heading",
        text: "Saying no without the guilt",
      },
      {
        type: "list",
        items: [
          'Pause before you answer—"Let me check and get back to you" is a complete sentence.',
          "Be warm and brief; you don't owe a long justification.",
          "Offer an alternative only when you genuinely want to.",
        ],
      },
      {
        type: "quote",
        text: "Every time you say yes to something that drains you, you're saying no to something that restores you.",
      },
      {
        type: "paragraph",
        text: "Boundaries take practice. Start small, notice how it feels, and adjust gently. Over time, protecting your bandwidth becomes second nature.",
      },
    ],
  },
  {
    slug: "building-routines-that-last",
    title: "Building Routines That Last",
    excerpt:
      "Routines fail when they fight your life. Here's how to build ones that fit your energy—steady, repeatable, and kind.",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=560&q=80",
    author: chelsea,
    date: "Jan 4",
    readTime: "7 min read",
    tags: ["Routines", "Habits", "Consistency"],
    likes: 531,
    comments: 9,
    content: [
      {
        type: "lead",
        text: "Most routines don't fail because we lack discipline. They fail because they were designed for a version of us that doesn't exist—one with endless time, energy, and willpower.",
      },
      {
        type: "paragraph",
        text: "A routine that lasts is one that fits your actual life. It bends on hard days and holds on good ones. The goal isn't perfection; it's a rhythm you can return to.",
      },
      {
        type: "heading",
        text: "Anchor new habits to old ones",
      },
      {
        type: "paragraph",
        text: "The easiest way to build something new is to attach it to something you already do. After your morning coffee, take three deep breaths. After you close your laptop, write one line about your day.",
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=560&q=80",
        alt: "A calm morning workspace with a warm drink",
        caption: "Small anchors turn intentions into rhythms.",
      },
      {
        type: "quote",
        text: "Keep what works. Review your wins, adjust gently, and protect your bandwidth.",
        attribution: "The Steady Steps approach",
      },
      {
        type: "paragraph",
        text: "When you build routines that respect your energy, consistency stops being a battle. You're no longer forcing change—you're living it.",
      },
    ],
  },
];

export function getPostBySlug(slug: string | undefined): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
