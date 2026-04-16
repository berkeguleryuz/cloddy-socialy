"use client";

import { useState, useMemo } from "react";
import ProfileHeader, { ProfileUser } from "@/components/ProfileHeader";
import PostCard from "@/components/PostCard";
import HexagonAvatar from "@/components/HexagonAvatar";
import { useAuth } from "@/components/AuthContext";
import { useCurrentUser } from "@/hooks/useUser";
import { useData } from "@/components/DataContext";
import { useQuestStats } from "@/hooks/useQuests";

// Demo data - shown when not authenticated
const demoUserPosts = [
  {
    id: 1,
    author: {
      name: "Marina Valentine",
      avatar: "/images/avatars/avatar_01.png",
      level: 24,
      time: "2 hours ago",
    },
    content:
      "Just finished an amazing gaming session! Who else is playing the new update? 🎮",
    image: "/images/covers/cover_01.png",
    likes: 287,
    comments: 42,
    shares: 15,
  },
  {
    id: 2,
    author: {
      name: "Marina Valentine",
      avatar: "/images/avatars/avatar_01.png",
      level: 24,
      time: "Yesterday",
    },
    content:
      "New artwork coming soon! Here's a little preview of what I've been working on. 🎨",
    image: "/images/covers/cover_04.png",
    likes: 523,
    comments: 89,
    shares: 34,
  },
];

const demoFriends = [
  {
    name: "Nick Grissom",
    avatar: "/images/avatars/avatar_02.png",
    level: 18,
  },
  {
    name: "Sarah Diamond",
    avatar: "/images/avatars/avatar_03.png",
    level: 31,
  },
  {
    name: "James Thunder",
    avatar: "/images/avatars/avatar_04.png",
    level: 15,
  },
  {
    name: "Olivia Chen",
    avatar: "/images/avatars/avatar_05.png",
    level: 27,
  },
  {
    name: "Alex Storm",
    avatar: "/images/avatars/avatar_06.png",
    level: 22,
  },
  {
    name: "Luna Grey",
    avatar: "/images/avatars/avatar_07.png",
    level: 19,
  },
];

const demoGroups = [
  {
    name: "Cosplayers of the World",
    members: 5632,
    image: "/images/covers/cover_01.png",
  },
  {
    name: "Pro Gaming League",
    members: 12500,
    image: "/images/covers/cover_02.png",
  },
  {
    name: "Digital Artists Hub",
    members: 8240,
    image: "/images/covers/cover_03.png",
  },
];

const demoPhotos = [
  "/images/covers/cover_01.png",
  "/images/covers/cover_02.png",
  "/images/covers/cover_03.png",
  "/images/covers/cover_04.png",
  "/images/covers/cover_05.png",
  "/images/covers/cover_06.png",
];

const demoBadges = [
  { name: "Forum Master", icon: "🏆", color: "#ffd700", earned: true, image_url: undefined },
  { name: "Streamer Elite", icon: "📺", color: "#9146ff", earned: true, image_url: undefined },
  { name: "Social Butterfly", icon: "🦋", color: "#ec4899", earned: true, image_url: undefined },
  { name: "Quest Champion", icon: "⚔️", color: "#ef4444", earned: true, image_url: undefined },
  { name: "Content Creator", icon: "🎨", color: "#06b6d4", earned: true, image_url: undefined },
  { name: "Community Leader", icon: "👑", color: "#f59e0b", earned: true, image_url: undefined },
  { name: "Night Owl", icon: "🦉", color: "#8b5cf6", earned: false, image_url: undefined },
  { name: "Pioneer", icon: "🚀", color: "#22c55e", earned: false, image_url: undefined },
];

// Demo profile info
const demoProfileInfo = {
  bio: "Hi! I'm Marina Valentine, a digital illustrator and graphic designer living in London. I love coffee, gaming and sushi! Currently working as a freelance artist and streaming my creative process on Twitch.",
  city: "London, United Kingdom",
  birthday: "August 24th, 1996",
  occupation: "Graphic Designer",
  email: "marina@gamehuntress.com",
  status: "Single",
  joined: "March 2019",
  country: "United Kingdom",
  age: 28,
  interests: {
    tvShows: "Breaking Bad, Game of Thrones, Stranger Things",
    music: "Pop, Electronic, K-Pop",
    movies: "Inception, Interstellar, The Matrix",
    books: "Harry Potter, The Witcher, Lord of the Rings",
    games: "League of Legends, Valorant, Genshin Impact",
  },
  jobs: [
    {
      title: "Freelance Graphic Designer",
      company: "Self-Employed",
      period: "2019 - Present",
      icon: "🎨",
    },
  ],
  education: [
    {
      title: "University of Arts London",
      degree: "BA Graphic Design",
      period: "2014 - 2018",
      icon: "🎓",
    },
  ],
  profileCompletion: 59,
  questsCompleted: "11/30",
  badgesUnlocked: "22/46",
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("About");
  const { user: authUser, isDemo, isAuthenticated } = useAuth();
  const { user: dbUser, isLoading: isUserLoading } = useCurrentUser();
  const { feed, social, gamification, groups: groupsData } = useData();
  const questStats = useQuestStats();

  // Construct profile user from database user or auth user
  const profileUser: ProfileUser | null = useMemo(() => {
    if (isDemo) {
      return null; // Will use demo data in ProfileHeader
    }

    if (dbUser) {
      return {
        id: dbUser.id,
        display_name: dbUser.display_name,
        avatar_url: dbUser.avatar_url,
        cover_url: dbUser.cover_url,
        level: dbUser.level,
        tagline: dbUser.tagline,
        wallet_address: dbUser.wallet_address ?? undefined,
        ens_name: dbUser.ens_name,
        stats: {
          posts: feed.posts?.length || 0,
          friends: social.friends?.length || 0,
          visits: (dbUser as any).profile_visits || 0,
        },
      };
    }

    return null;
  }, [isDemo, dbUser, feed.posts, social.friends]);

  // Use real data when authenticated, demo data when not
  const userPosts = isDemo ? demoUserPosts : feed.posts.map((post: any) => ({
    id: post.id,
    author: {
      name: authUser?.name || "User",
      avatar: authUser?.avatar || "/images/avatars/avatar_01.png",
      level: authUser?.level || 1,
      time: formatTimeAgo(post.created_at),
    },
    content: post.content,
    image: post.media?.[0]?.url,
    likes: post.likes_count || 0,
    comments: post.comments_count || 0,
    shares: post.shares_count || 0,
  }));

  const friends = isDemo
    ? demoFriends
    : social.friends.map((f: any) => ({
        name: f.user?.display_name || "User",
        avatar: f.user?.avatar_url || "/images/avatars/avatar_01.png",
        level: f.user?.level || 1,
      }));

  const groups = isDemo
    ? demoGroups
    : groupsData.items.map((g: any) => ({
        name: g.name,
        members: g.members_count || 0,
        image: g.cover_url || "/images/covers/cover_01.png",
      }));

  // Use real photos from posts or demo data
  const photos = isDemo
    ? demoPhotos
    : feed.posts
        .filter((p: any) => p.media?.some((m: any) => m.type === "image"))
        .flatMap((p: any) => p.media?.filter((m: any) => m.type === "image").map((m: any) => m.url))
        .slice(0, 12) || demoPhotos;

  const badges = isDemo
    ? demoBadges
    : gamification.badges.map((b: any) => ({
        name: b.name,
        icon: b.icon || "🏆", // Use icon emoji, not image_url
        image_url: b.image_url,
        color: b.color || "#7750f8",
        earned: gamification.userBadges.some((ub: any) => ub.badge_id === b.id),
      }));

  const profileInfo = isDemo
    ? demoProfileInfo
    : {
        bio: dbUser?.bio || "No bio yet",
        city: dbUser?.city || "Unknown",
        birthday: dbUser?.birthday || "Not set",
        occupation: dbUser?.occupation || "Not set",
        email: dbUser?.email || "Not set",
        status: dbUser?.status || "Not set",
        joined: dbUser?.created_at ? formatDate(dbUser.created_at) : "Unknown",
        country: dbUser?.country || "Unknown",
        age: dbUser?.birthday ? calculateAge(dbUser.birthday) : null,
        interests: {
          tvShows: "Not set",
          music: "Not set",
          movies: "Not set",
          books: "Not set",
          games: "Not set",
        },
        jobs: [],
        education: [],
        profileCompletion: dbUser?.profile_completion || 0,
        questsCompleted: `${questStats.stats.daily.completed + questStats.stats.weekly.completed + questStats.stats.achievements.completed}/${questStats.stats.daily.total + questStats.stats.weekly.total + questStats.stats.achievements.total}`,
        badgesUnlocked: `${gamification.userBadges.length}/${gamification.badges.length}`,
      };

  const renderTabContent = () => {
    switch (activeTab) {
      case "About":
        return <AboutTab profileInfo={profileInfo} friends={friends} />;
      case "Timeline":
        return <TimelineTab userPosts={userPosts} user={profileUser} isDemo={isDemo} authUser={authUser} badges={badges} profileInfo={profileInfo} />;
      case "Friends":
        return <FriendsTab friends={friends} />;
      case "Groups":
        return <GroupsTab groups={groups} />;
      case "Photos":
        return <PhotosTab photos={photos} />;
      case "Videos":
        return <VideosTab photos={photos} />;
      case "Badges":
        return <BadgesTab badges={badges} />;
      case "Stream":
        return <StreamTab />;
      case "Blog":
        return <BlogTab photos={photos} />;
      default:
        return <AboutTab profileInfo={profileInfo} friends={friends} />;
    }
  };

  if (isUserLoading && !isDemo) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col animate-in fade-in duration-700">
      <ProfileHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={profileUser}
        isOwnProfile={true}
        isDemo={isDemo}
      />
      {renderTabContent()}
    </div>
  );
}

// Helper functions
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function calculateAge(birthday: string): number | null {
  const birthDate = new Date(birthday);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

interface ProfileInfo {
  bio: string;
  city: string;
  birthday: string;
  occupation: string;
  email: string;
  status: string;
  joined: string;
  country: string;
  age: number | null;
  interests: {
    tvShows: string;
    music: string;
    movies: string;
    books: string;
    games: string;
  };
  jobs: Array<{ title: string; company: string; period: string; icon: string }>;
  education: Array<{ title: string; degree: string; period: string; icon: string }>;
  profileCompletion: number;
  questsCompleted: string;
  badgesUnlocked: string;
}

interface Friend {
  name: string;
  avatar: string;
  level: number;
}

function AboutTab({ profileInfo, friends }: { profileInfo: ProfileInfo; friends: Friend[] }) {
  const completionOffset = 251.2 - (251.2 * profileInfo.profileCompletion) / 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="flex flex-col gap-6">
        <div className="widget-box p-6">
          <h3 className="text-sm font-black mb-4 uppercase">About Me</h3>
          <p className="text-xs leading-relaxed text-text-muted font-medium mb-6">
            {profileInfo.bio}
          </p>
          <div className="flex flex-col gap-4">
            <InfoRow
              icon="🏠"
              label="City"
              value={profileInfo.city}
              color="primary"
            />
            <InfoRow
              icon="📅"
              label="Birthday"
              value={profileInfo.birthday}
              color="secondary"
            />
            <InfoRow
              icon="💼"
              label="Occupation"
              value={profileInfo.occupation}
              color="accent-blue"
            />
            <InfoRow
              icon="📧"
              label="Email"
              value={profileInfo.email}
              color="accent-orange"
            />
          </div>
        </div>

        <div className="widget-box p-6">
          <h3 className="text-sm font-black mb-4 uppercase">Personal Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted font-bold uppercase">
                Status
              </span>
              <span className="text-xs font-bold">{profileInfo.status}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted font-bold uppercase">
                Joined
              </span>
              <span className="text-xs font-bold">{profileInfo.joined}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted font-bold uppercase">
                Country
              </span>
              <span className="text-xs font-bold">{profileInfo.country}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted font-bold uppercase">
                Age
              </span>
              <span className="text-xs font-bold">{profileInfo.age || "Not set"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="widget-box p-6">
          <h3 className="text-sm font-black mb-4 uppercase">Interests</h3>
          <div className="space-y-4">
            <InterestRow
              label="TV Shows"
              value={profileInfo.interests.tvShows}
            />
            <InterestRow label="Music" value={profileInfo.interests.music} />
            <InterestRow
              label="Movies"
              value={profileInfo.interests.movies}
            />
            <InterestRow
              label="Books"
              value={profileInfo.interests.books}
            />
            <InterestRow
              label="Games"
              value={profileInfo.interests.games}
            />
          </div>
        </div>

        <div className="widget-box p-6">
          <h3 className="text-sm font-black mb-4 uppercase">
            Jobs & Education
          </h3>
          <div className="space-y-4">
            {profileInfo.jobs.length > 0 ? (
              profileInfo.jobs.map((job, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-lg">
                    {job.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">{job.title}</h4>
                    <p className="text-[10px] text-text-muted">
                      {job.company} • {job.period}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-lg">
                  🎨
                </div>
                <div>
                  <h4 className="text-xs font-bold">Freelance Graphic Designer</h4>
                  <p className="text-[10px] text-text-muted">Self-Employed • 2019 - Present</p>
                </div>
              </div>
            )}
            {profileInfo.education.length > 0 ? (
              profileInfo.education.map((edu, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center text-lg">
                    {edu.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">{edu.title}</h4>
                    <p className="text-[10px] text-text-muted">
                      {edu.degree} • {edu.period}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center text-lg">
                  🎓
                </div>
                <div>
                  <h4 className="text-xs font-bold">University of Arts London</h4>
                  <p className="text-[10px] text-text-muted">BA Graphic Design • 2014 - 2018</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="widget-box p-6">
          <h3 className="text-sm font-black mb-4 uppercase">
            Profile Completion
          </h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#2f3749"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="url(#gradient)"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray="251.2"
                  strokeDashoffset={completionOffset}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#7750f8" />
                    <stop offset="100%" stopColor="#40d04f" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black">{profileInfo.profileCompletion}%</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted font-bold">
                Quests Completed
              </span>
              <span className="font-bold">{profileInfo.questsCompleted}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted font-bold">Badges Unlocked</span>
              <span className="font-bold">{profileInfo.badgesUnlocked}</span>
            </div>
          </div>
        </div>

        <div className="widget-box p-6">
          <h3 className="text-sm font-black mb-4 uppercase">
            Featured Friends
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {friends.slice(0, 6).map((friend, index) => (
              <div
                key={`${friend.name}-${index}`}
                className="flex flex-col items-center gap-2"
              >
                <HexagonAvatar
                  src={friend.avatar}
                  size="md"
                  level={friend.level}
                />
                <span className="text-[10px] font-bold text-center truncate w-full">
                  {friend.name.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface UserPost {
  id: string | number;
  author: {
    name: string;
    avatar: string;
    level: number;
    time: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
}

interface Badge {
  name: string;
  icon: string;
  image_url?: string;
  color: string;
  earned: boolean;
}

function TimelineTab({
  userPosts,
  user,
  isDemo,
  authUser,
  badges,
  profileInfo,
}: {
  userPosts: UserPost[];
  user: ProfileUser | null;
  isDemo: boolean;
  authUser: any;
  badges: Badge[];
  profileInfo: ProfileInfo;
}) {
  const displayName = user?.display_name || authUser?.name || "Marina Valentine";
  const avatar = user?.avatar_url || authUser?.avatar || "/images/avatars/avatar_01.png";
  const level = user?.level || authUser?.level || 24;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="flex flex-col gap-6">
        <div className="widget-box p-6">
          <h3 className="text-sm font-black mb-4 uppercase">About Me</h3>
          <p className="text-xs leading-relaxed text-text-muted font-medium">
            {profileInfo.bio.slice(0, 150)}...
          </p>
        </div>
        <div className="widget-box p-6">
          <h3 className="text-sm font-black mb-4 uppercase">Featured Badges</h3>
          <div className="grid grid-cols-4 gap-2">
            {badges.slice(0, 4).map((badge) => (
              <div
                key={badge.name}
                className="flex items-center justify-center text-2xl w-12 h-12 rounded-lg overflow-hidden"
                style={{ backgroundColor: `${badge.color}20` }}
              >
                {badge.image_url ? (
                  <img src={badge.image_url} alt={badge.name} className="w-full h-full object-cover" />
                ) : (
                  badge.icon
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="widget-box p-6 flex items-center gap-4">
          <HexagonAvatar
            src={avatar}
            level={level}
            size="md"
          />
          <div className="flex-1 bg-background rounded-xl px-6 py-3 text-sm text-text-muted font-medium cursor-pointer hover:bg-surface transition-colors">
            What&apos;s on your mind, {displayName.split(" ")[0]}?
          </div>
        </div>

        {userPosts.length > 0 ? (
          userPosts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))
        ) : (
          <div className="widget-box p-6 text-center">
            <p className="text-text-muted text-sm">No posts yet. Share your first post!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FriendsTab({ friends }: { friends: Friend[] }) {
  const displayFriends = friends.length > 0 ? friends : demoFriends;

  return (
    <div className="widget-box p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase">Friends ({displayFriends.length})</h3>
        <input
          type="text"
          placeholder="Search friends..."
          className="bg-background border border-border rounded-lg px-4 py-2 text-xs font-medium outline-none focus:border-primary"
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayFriends.map((friend, i) => (
          <div
            key={`${friend.name}-${i}`}
            className="flex flex-col items-center gap-3 p-4 bg-background rounded-xl hover:bg-surface transition-colors cursor-pointer"
          >
            <HexagonAvatar
              src={friend.avatar}
              size="lg"
              level={friend.level}
            />
            <span className="text-xs font-bold text-center">{friend.name}</span>
            <button className="w-full py-1.5 text-[10px] font-bold uppercase bg-primary/20 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
              Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Group {
  name: string;
  members: number;
  image: string;
}

function GroupsTab({ groups }: { groups: Group[] }) {
  const displayGroups = groups.length > 0 ? groups : demoGroups;

  return (
    <div className="widget-box p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase">Groups ({displayGroups.length})</h3>
        <button className="px-4 py-2 bg-linear-to-r from-primary to-secondary text-white text-xs font-black rounded-lg uppercase">
          + Create Group
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayGroups.map((group, index) => (
          <div
            key={`${group.name}-${index}`}
            className="bg-background rounded-xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <div className="h-24 relative">
              <img
                src={group.image}
                alt={group.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#161b28] to-transparent"></div>
            </div>
            <div className="p-4 -mt-4 relative z-10">
              <h4 className="text-sm font-bold mb-1">{group.name}</h4>
              <p className="text-[10px] text-text-muted font-bold">
                {group.members.toLocaleString()} Members
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhotosTab({ photos }: { photos: string[] }) {
  const displayPhotos = photos.length > 0 ? photos : demoPhotos;

  return (
    <div className="widget-box p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase">Photos ({displayPhotos.length * 2})</h3>
        <button className="px-4 py-2 bg-linear-to-r from-primary to-secondary text-white text-xs font-black rounded-lg uppercase">
          + Upload Photo
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[...displayPhotos, ...displayPhotos].map((photo, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <img
              src={photo}
              alt={`Photo ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function VideosTab({ photos }: { photos: string[] }) {
  const displayPhotos = photos.length > 0 ? photos : demoPhotos;

  return (
    <div className="widget-box p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase">Videos (12)</h3>
        <button className="px-4 py-2 bg-linear-to-r from-primary to-secondary text-white text-xs font-black rounded-lg uppercase">
          + Upload Video
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayPhotos.slice(0, 6).map((photo, i) => (
          <div
            key={i}
            className="aspect-video rounded-xl overflow-hidden relative cursor-pointer group hover:scale-[1.02] transition-transform"
          >
            <img
              src={photo}
              alt={`Video ${i + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <svg
                  className="w-6 h-6 text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BadgesTab({ badges }: { badges: Badge[] }) {
  const displayBadges = badges.length > 0 ? badges : demoBadges;
  const earnedCount = displayBadges.filter((b) => b.earned).length;

  return (
    <div className="widget-box p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase">Badges ({earnedCount}/{displayBadges.length})</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayBadges.map((badge, index) => (
          <div
            key={`${badge.name}-${index}`}
            className={`flex flex-col items-center gap-3 p-4 rounded-xl transition-all ${
              badge.earned ? "bg-background" : "bg-background/50 opacity-50"
            }`}
          >
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl overflow-hidden"
              style={{ backgroundColor: `${badge.color}20` }}
            >
              {badge.image_url ? (
                <img src={badge.image_url} alt={badge.name} className="w-full h-full object-cover" />
              ) : (
                badge.icon
              )}
            </div>
            <span className="text-xs font-bold text-center">{badge.name}</span>
            {badge.earned ? (
              <span className="text-[10px] font-bold text-secondary uppercase">
                Unlocked
              </span>
            ) : (
              <span className="text-[10px] font-bold text-text-muted uppercase">
                Locked
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StreamTab() {
  return (
    <div className="widget-box p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase">Stream</h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-xs font-bold text-red-500 uppercase">
            Live Now
          </span>
        </div>
      </div>
      <div className="aspect-video bg-background rounded-xl overflow-hidden relative mb-4">
        <img
          src="/images/covers/cover_01.png"
          alt="Stream Preview"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="w-16 h-16 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform">
            <svg
              className="w-8 h-8 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold">
            Playing Valorant - Road to Immortal!
          </h4>
          <p className="text-xs text-text-muted">1,234 viewers</p>
        </div>
        <button className="px-4 py-2 bg-[#9146ff] text-white text-xs font-black rounded-lg uppercase">
          Watch on Twitch
        </button>
      </div>
    </div>
  );
}

function BlogTab({ photos }: { photos: string[] }) {
  const displayPhotos = photos.length > 0 ? photos : demoPhotos;

  return (
    <div className="widget-box p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase">Blog Posts (8)</h3>
        <button className="px-4 py-2 bg-linear-to-r from-primary to-secondary text-white text-xs font-black rounded-lg uppercase">
          + Write Post
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-background rounded-xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <div className="h-32 relative">
              <img
                src={displayPhotos[i - 1] || displayPhotos[0]}
                alt={`Blog ${i}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <span className="text-[10px] font-bold text-primary uppercase">
                Gaming
              </span>
              <h4 className="text-sm font-bold mt-1 mb-2">
                Top 10 Tips for Climbing in Ranked
              </h4>
              <p className="text-xs text-text-muted line-clamp-2">
                Learn the secrets to improving your gameplay and reaching higher
                ranks...
              </p>
              <div className="flex items-center gap-4 mt-3 text-[10px] font-bold text-text-muted">
                <span>Dec 28, 2025</span>
                <span>•</span>
                <span>5 min read</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className={`text-${color} text-lg`}>{icon}</div>
      <div className="flex flex-col">
        <span className="text-[10px] text-text-muted font-bold uppercase">
          {label}
        </span>
        <span className="text-xs font-bold">{value}</span>
      </div>
    </div>
  );
}

function InterestRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-text-muted font-bold uppercase">
        {label}
      </span>
      <span className="text-xs font-bold">{value}</span>
    </div>
  );
}
