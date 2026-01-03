import BadgeCard from "@/components/BadgeCard";

const badges = [
  // User Tier Badges
  {
    id: 1,
    name: "Bronze User",
    description: "Has posted more than 1 post on their profile",
    image: "/images/badges/badge_bronze-s.png",
    unlocked: true,
    exp: 20,
  },
  {
    id: 2,
    name: "Silver User",
    description: "Has posted more than 100 posts on their profile",
    image: "/images/badges/badge_silver-s.png",
    unlocked: true,
    exp: 40,
  },
  {
    id: 3,
    name: "Gold User",
    description: "Has posted more than 500 posts on their profile",
    image: "/images/badges/badge_gold-s.png",
    unlocked: true,
    exp: 60,
  },
  {
    id: 4,
    name: "Platinum User",
    description: "Has posted more than 1000 posts on their profile",
    image:
      "/images/badges/badge_platinum-s.png",
    unlocked: false,
    exp: 100,
  },
  // Community Badges
  {
    id: 5,
    name: "Forum Traveller",
    description: "Created at least 1 topic on 5 different groups forums",
    image:
      "/images/badges/badge_traveller-s.png",
    unlocked: true,
    exp: 40,
  },
  {
    id: 6,
    name: "Caffeinated",
    description: "Commented on a friend's post inside 30 seconds of posting",
    image:
      "/images/badges/badge_caffeinated-s.png",
    unlocked: true,
    exp: 40,
    hasNextTier: true,
  },
  {
    id: 7,
    name: "Ultra Powered",
    description: "Received 50+ reacts inside 30 minutes of posting",
    image: "/images/badges/badge_upower-s.png",
    unlocked: false,
    exp: 80,
  },
  {
    id: 8,
    name: "Crazy Scientist",
    description: "Helped us beta test new awesome features",
    image:
      "/images/badges/badge_scientist-s.png",
    unlocked: true,
    exp: 40,
  },
  {
    id: 9,
    name: "Night Creature",
    description: "Created 100+ posts between 1AM and 5AM",
    image:
      "/images/badges/badge_ncreature-s.png",
    unlocked: false,
    exp: 20,
  },
  {
    id: 10,
    name: "The Warrior",
    description: "Helped the team enforce the community rules",
    image: "/images/badges/badge_warrior-s.png",
    unlocked: true,
    exp: 40,
  },
  // Social Badges
  {
    id: 11,
    name: "Liked User",
    description: "Received 500+ like or love reactions in their profile posts",
    image: "/images/badges/badge_liked-s.png",
    unlocked: true,
    exp: 60,
  },
  {
    id: 12,
    name: "Super Loved User",
    description: "Received 1000+ like or love reactions in their profile posts",
    image: "/images/badges/badge_sloved-s.png",
    unlocked: false,
    exp: 80,
  },
  {
    id: 13,
    name: "Quest Conqueror",
    description: "Successfully completed at least 10 quests at 100%",
    image: "/images/badges/badge_qconq-s.png",
    unlocked: true,
    exp: 40,
  },
  {
    id: 14,
    name: "Super Villain",
    description: "Received 100+ dislike reactions in their profile posts",
    image:
      "/images/badges/badge_svillain-s.png",
    unlocked: false,
    exp: 40,
  },
  {
    id: 15,
    name: "Profile Age",
    description: "Congrats! You've been part of the community for 2 years",
    image: "/images/badges/badge_age-s.png",
    unlocked: true,
    exp: 20,
  },
  {
    id: 16,
    name: "Thunderstruck",
    description: "The user reacted first on 50+ friends posts",
    image:
      "/images/badges/badge_tstriker-s.png",
    unlocked: false,
    exp: 60,
    hasNextTier: true,
  },
  // Explorer Badges
  {
    id: 17,
    name: "Universe EXPlorer",
    description: "Joined and posted on 20 different groups",
    image: "/images/badges/badge_uexp-s.png",
    unlocked: true,
    exp: 20,
  },
  {
    id: 18,
    name: "Globe Trotter",
    description: "Has at least 10 friends from different countries",
    image: "/images/badges/badge_globe-s.png",
    unlocked: true,
    exp: 40,
  },
  {
    id: 19,
    name: "Verified Streamer",
    description: "Has linked a stream that was verified by the staff",
    image:
      "/images/badges/badge_vstreamer-s.png",
    unlocked: true,
    exp: 40,
  },
  {
    id: 20,
    name: "Rare GemPost",
    description: "Received 100+ likes and 50+ comments on a single post",
    image: "/images/badges/badge_gempost-s.png",
    unlocked: false,
    exp: 80,
  },
  // Leadership Badges
  {
    id: 21,
    name: "People's Person",
    description: "Has accepted at least 200 friends requests",
    image: "/images/badges/badge_pperson-s.png",
    unlocked: true,
    exp: 40,
  },
  {
    id: 22,
    name: "Ruler of Masses",
    description: "Has created and admins 5+ different groups",
    image: "/images/badges/badge_rmasses-s.png",
    unlocked: false,
    exp: 40,
  },
  {
    id: 23,
    name: "The Marketeer",
    description: "Has posted at least 10 items on their shop",
    image: "/images/badges/badge_market-s.png",
    unlocked: true,
    exp: 20,
    hasNextTier: true,
  },
  {
    id: 24,
    name: "Business Tycoon",
    description: "Sold more than 100 items on their shop",
    image: "/images/badges/badge_tycoon-s.png",
    unlocked: false,
    exp: 80,
  },
  // Activity Badges
  {
    id: 25,
    name: "Mightier Than Sword",
    description: "Wrote at least 50 blog posts in their profile",
    image: "/images/badges/badge_mtsword-s.png",
    unlocked: true,
    exp: 40,
  },
  {
    id: 26,
    name: "The Phantom",
    description: "Visited other profiles but hasn't posted in 1+ year",
    image: "/images/badges/badge_phantom-s.png",
    unlocked: false,
    exp: 40,
  },
  {
    id: 27,
    name: "Forums Fan",
    description: "Started at least 20 topics on the forums",
    image: "/images/badges/badge_ffan-s.png",
    unlocked: true,
    exp: 40,
  },
  {
    id: 28,
    name: "Friendship Cultivator",
    description: "Commented first on 100+ friend's posts",
    image: "/images/badges/badge_fcult-s.png",
    unlocked: true,
    exp: 40,
  },
  {
    id: 29,
    name: "Super Planner",
    description: "Has created at least 25 public or private events",
    image: "/images/badges/badge_planner-s.png",
    unlocked: false,
    exp: 20,
  },
  {
    id: 30,
    name: "The Collector",
    description: "Bought at least 5 items in the marketplace",
    image: "/images/badges/badge_collect-s.png",
    unlocked: true,
    exp: 40,
  },
  // Competition Badges
  {
    id: 31,
    name: "Pro Photographer",
    description: "Uploaded more than 500 photos to their profile",
    image: "/images/badges/badge_photo-s.png",
    unlocked: false,
    exp: 40,
  },
  {
    id: 32,
    name: "Referral Machine",
    description: "Referred at least 50 friends that joined the community",
    image:
      "/images/badges/badge_referral-s.png",
    unlocked: false,
    exp: 40,
  },
  {
    id: 33,
    name: "Bronze Cup",
    description: "Won third place on a verified forum competition",
    image:
      "/images/badges/badge_bronze-cup-s.png",
    unlocked: true,
    exp: 20,
  },
  {
    id: 34,
    name: "Silver Cup",
    description: "Won second place on a verified forum competition",
    image:
      "/images/badges/badge_silver-cup-s.png",
    unlocked: false,
    exp: 40,
  },
  {
    id: 35,
    name: "Gold Cup",
    description: "Won first place on a verified forum competition",
    image:
      "/images/badges/badge_gold-cup-s.png",
    unlocked: false,
    exp: 60,
  },
  {
    id: 36,
    name: "Platinum Cup",
    description: "Won an official Social Network competition",
    image:
      "/images/badges/badge_platinum-cup-s.png",
    unlocked: false,
    exp: 100,
  },
];

export default function BadgesPage() {
  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const totalExp = badges
    .filter((b) => b.unlocked)
    .reduce((sum, b) => sum + b.exp, 0);

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="widget-box p-8 bg-linear-to-r from-primary/10 via-transparent to-secondary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-secondary/5 opacity-5" />
        <div className="relative z-10">
          <h1 className="text-2xl font-black uppercase tracking-wider mb-2">
            Badges
          </h1>
          <p className="text-sm text-text-muted font-medium">
            Check out all your unlocked and locked badges!
          </p>

          <div className="flex gap-8 mt-6">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-primary">
                {unlockedCount}
              </span>
              <span className="text-xs text-text-muted font-bold uppercase">
                Unlocked
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-secondary">
                {badges.length - unlockedCount}
              </span>
              <span className="text-xs text-text-muted font-bold uppercase">
                Locked
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-accent-yellow">
                {totalExp}
              </span>
              <span className="text-xs text-text-muted font-bold uppercase">
                Total EXP
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {badges.map((badge) => (
          <BadgeCard key={badge.id} {...badge} />
        ))}
      </div>
    </div>
  );
}
