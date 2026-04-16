// Centralized demo data for unauthenticated users
// This file consolidates all demo data to reduce bundle size per page

// Demo posts for feed
export const demoPosts = {
  textPosts: [
    {
      id: 1,
      author: {
        name: "Marina Valentine",
        avatar: "/images/avatars/avatar_01.png",
        level: 24,
        time: "15 minutes ago",
      },
      content:
        "Just finished my new gaming setup! The RGB lighting is absolutely insane. Can't wait to stream tonight and show it off to everyone!",
      image: "/images/posts/gaming_setup.jpg",
      likes: 87,
      comments: 23,
      shares: 5,
    },
  ],
  videoPost: {
    author: {
      name: "Neko Bebop",
      avatar: "/images/avatars/avatar_03.png",
      level: 16,
      time: "2 hours ago",
    },
    content:
      "Check out my latest video of the sandbox expansion for Cosmo Slime! G.I. is really excited, because my last video had almost 50,000 views. Don't forget to like and subscribe!",
    videoThumbnail: "/images/posts/video_thumbnail.jpg",
    videoTitle: "Cosmo Slime - Sandbox Expansion Full Gameplay",
    videoDuration: "12:45",
    videoViews: "48.2K",
    likes: 342,
    comments: 89,
    shares: 24,
  },
  pollPost: {
    author: {
      name: "Sarah Diamond",
      avatar: "/images/avatars/avatar_08.png",
      level: 19,
      time: "4 hours ago",
    },
    question: "Which game should I stream this weekend?",
    options: [
      { id: 1, text: "Elden Ring - New DLC", votes: 156 },
      { id: 2, text: "Cyberpunk 2077 - Phantom Liberty", votes: 98 },
      { id: 3, text: "Baldur's Gate 3", votes: 234 },
      { id: 4, text: "Starfield", votes: 67 },
    ],
    totalVotes: 555,
    likes: 45,
    comments: 32,
    shares: 8,
  },
  galleryPost: {
    author: {
      name: "Destroy Dex",
      avatar: "/images/avatars/avatar_07.png",
      level: 32,
      time: "6 hours ago",
    },
    content:
      "Screenshots from today's epic gaming session! We finally beat the raid boss after 47 attempts",
    images: [
      "/images/posts/gallery_1.jpg",
      "/images/posts/gallery_2.jpg",
      "/images/posts/gallery_3.jpg",
      "/images/posts/gallery_4.jpg",
      "/images/posts/gallery_5.jpg",
      "/images/posts/gallery_6.jpg",
    ],
    likes: 156,
    comments: 41,
    shares: 12,
  },
}

// Empty data for authenticated users with no data
export const emptyPosts = {
  textPosts: [],
  videoPost: null,
  pollPost: null,
  galleryPost: null,
}

// Demo members data
export const demoMembersData = {
  Newest: [
    { name: "Nick Grissom", avatar: "/images/avatars/avatar_02.png", level: 16 },
    { name: "Neko Bebop", avatar: "/images/avatars/avatar_03.png", level: 12 },
    { name: "Matt Parker", avatar: "/images/avatars/avatar_04.png", level: 8 },
    { name: "Sandra Strange", avatar: "/images/avatars/avatar_05.png", level: 27 },
    { name: "James Walker", avatar: "/images/avatars/avatar_06.png", level: 5 },
  ],
  Popular: [
    { name: "Marina Valentine", avatar: "/images/avatars/avatar_01.png", level: 24 },
    { name: "Sandra Strange", avatar: "/images/avatars/avatar_05.png", level: 27 },
    { name: "Nick Grissom", avatar: "/images/avatars/avatar_02.png", level: 16 },
    { name: "Destroy Dex", avatar: "/images/avatars/avatar_07.png", level: 32 },
    { name: "Sarah Diamond", avatar: "/images/avatars/avatar_08.png", level: 19 },
  ],
  Active: [
    { name: "Destroy Dex", avatar: "/images/avatars/avatar_07.png", level: 32 },
    { name: "Marina Valentine", avatar: "/images/avatars/avatar_01.png", level: 24 },
    { name: "Neko Bebop", avatar: "/images/avatars/avatar_03.png", level: 12 },
    { name: "Matt Parker", avatar: "/images/avatars/avatar_04.png", level: 8 },
    { name: "Nick Grissom", avatar: "/images/avatars/avatar_02.png", level: 16 },
  ],
}

// Demo events data
export const demoEvents = [
  {
    id: 1,
    title: "Breakfast with Neko",
    time: "9:00 AM",
    date: "Today",
    image: "/images/avatars/avatar_03.png",
    attendees: 12,
    color: "from-secondary to-accent-blue",
  },
  {
    id: 2,
    title: "FLAVOR Meeting",
    time: "2:30 PM",
    date: "Today",
    image: "/images/avatars/avatar_07.png",
    attendees: 8,
    color: "from-primary to-secondary",
  },
  {
    id: 3,
    title: "Streaming Party",
    time: "8:00 PM",
    date: "Tomorrow",
    image: "/images/avatars/avatar_02.png",
    attendees: 45,
    color: "from-accent-orange to-accent-yellow",
  },
  {
    id: 4,
    title: "Gaming Tournament",
    time: "6:00 PM",
    date: "Sat, Jan 11",
    image: "/images/avatars/avatar_05.png",
    attendees: 120,
    color: "from-accent-blue to-primary",
  },
]

// Demo quests data
export const demoQuests = [
  {
    id: 1,
    title: "Social King/Queen",
    description: "Get 100 reactions on your posts",
    progress: 67,
    exp: 120,
    icon: "crown",
  },
  {
    id: 2,
    title: "The Explorer",
    description: "Join 10 different groups",
    progress: 40,
    exp: 80,
    icon: "map",
  },
  {
    id: 3,
    title: "Content Creator",
    description: "Create 50 posts",
    progress: 88,
    exp: 150,
    icon: "edit",
  },
]

// Demo activities data
export const demoActivities = [
  {
    id: 1,
    user: { name: "Nick Grissom", avatar: "/images/avatars/avatar_02.png" },
    action: "liked",
    target: "Marina Valentine's status",
    time: "2 min ago",
    icon: "heart",
  },
  {
    id: 2,
    user: { name: "Sandra Strange", avatar: "/images/avatars/avatar_05.png" },
    action: "commented on",
    target: "Neko's photo",
    time: "5 min ago",
    icon: "comment",
  },
  {
    id: 3,
    user: { name: "Matt Parker", avatar: "/images/avatars/avatar_04.png" },
    action: "joined",
    target: "Gaming Warriors group",
    time: "12 min ago",
    icon: "group",
  },
  {
    id: 4,
    user: { name: "Destroy Dex", avatar: "/images/avatars/avatar_07.png" },
    action: "earned",
    target: "Gold User badge",
    time: "28 min ago",
    icon: "badge",
  },
  {
    id: 5,
    user: { name: "Sarah Diamond", avatar: "/images/avatars/avatar_08.png" },
    action: "shared",
    target: "a new video",
    time: "45 min ago",
    icon: "share",
  },
]

// Event color palette
export const eventColors = [
  "from-secondary to-accent-blue",
  "from-primary to-secondary",
  "from-accent-orange to-accent-yellow",
  "from-accent-blue to-primary",
]

// Type exports
export type DemoPosts = typeof demoPosts
export type EmptyPosts = typeof emptyPosts
export type DemoMembersData = typeof demoMembersData
export type DemoEvent = typeof demoEvents[number]
export type DemoQuest = typeof demoQuests[number]
export type DemoActivity = typeof demoActivities[number]
