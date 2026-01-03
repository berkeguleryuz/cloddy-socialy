"use client";

import Link from "next/link";
import HexagonAvatar from "@/components/HexagonAvatar";

const categories = [
  {
    id: 1,
    name: "Browse All",
    description: "Check out all items",
    count: 1360,
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
          clipRule="evenodd"
        />
      </svg>
    ),
    color: "#615dfa",
  },
  {
    id: 2,
    name: "Featured",
    description: "Handpicked by us",
    count: 254,
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ),
    color: "#f59e0b",
  },
  {
    id: 3,
    name: "Digital",
    description: "Logos, banners...",
    count: 1207,
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
          clipRule="evenodd"
        />
      </svg>
    ),
    color: "#06b6d4",
  },
  {
    id: 4,
    name: "Physical",
    description: "Prints, joysticks...",
    count: 153,
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
        <path
          fillRule="evenodd"
          d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    color: "#23d2e2",
  },
];

const products = [
  {
    id: 1,
    slug: "twitch-stream-ui-pack",
    name: "Twitch Stream UI Pack",
    description:
      "Awesome hexagon themed stream pack, you can change all colors and...",
    category: "Stream Packs",
    categoryColor: "#7c3aed",
    price: 12.0,
    image: "/images/covers/cover_01.png",
    author: {
      name: "Marina Valentine",
      avatar: "/images/avatars/avatar_01.png",
    },
  },
  {
    id: 2,
    slug: "jaxxy-witch-black-frame",
    name: "Jaxxy Witch Black Frame",
    description:
      "30x60 inches fine art print, with glossy paper and a polymer black frame...",
    category: "Art Prints",
    categoryColor: "#ec4899",
    price: 34.0,
    image: "/images/covers/cover_02.png",
    author: {
      name: "Neko Bebop",
      avatar: "/images/avatars/avatar_03.png",
    },
  },
  {
    id: 3,
    slug: "flaming-skull-team-logo",
    name: "Flaming Skull Team Logo",
    description:
      "Get this incredible horned skull logo! It's really easy to change colors with the...",
    category: "Logos & Badges",
    categoryColor: "#06b6d4",
    price: 40.0,
    image: "/images/covers/cover_03.png",
    author: {
      name: "Marina Valentine",
      avatar: "/images/avatars/avatar_01.png",
    },
  },
  {
    id: 4,
    slug: "carbon-black-joystick",
    name: "Carbon Black Joystick",
    description:
      "Slightly used X-Rock Carbon model joystick. Works perfectly, like the first...",
    category: "Electronics",
    categoryColor: "#f59e0b",
    price: 29.0,
    image: "/images/covers/cover_04.png",
    author: {
      name: "Bearded Wonder",
      avatar: "/images/avatars/avatar_06.png",
    },
  },
  {
    id: 5,
    slug: "emerald-dragon-marketplace",
    name: "Emerald Dragon Digital Marketpl...",
    description:
      "Digital marketplace HTML template with all you need to build your own web...",
    category: "HTML Templates",
    categoryColor: "#615dfa",
    price: 24.0,
    image: "/images/covers/cover_05.png",
    author: {
      name: "Marina Valentine",
      avatar: "/images/avatars/avatar_01.png",
    },
  },
  {
    id: 6,
    slug: "crimson-red-joystick",
    name: "Crimson Red Joystick",
    description:
      "Almost new joystick! I bought it but my console gave up so I haven't used it...",
    category: "Electronics",
    categoryColor: "#f59e0b",
    price: 26.0,
    image: "/images/covers/cover_06.png",
    author: {
      name: "Bearded Wonder",
      avatar: "/images/avatars/avatar_06.png",
    },
  },
  {
    id: 7,
    slug: "mercenaries-white-frame",
    name: "Mercenaries White Frame",
    description:
      "30x30 inches fine art print, with glossy paper and a whitewood white frame...",
    category: "Art Prints",
    categoryColor: "#ec4899",
    price: 40.0,
    image: "/images/covers/cover_29.png",
    author: {
      name: "Neko Bebop",
      avatar: "/images/avatars/avatar_03.png",
    },
  },
  {
    id: 8,
    slug: "people-illustrations-pack-02",
    name: "People Illustrations Pack 02",
    description:
      "Pack that includes 6 people illustrations made with PS vectors. Photoshop files...",
    category: "Illustrations",
    categoryColor: "#23d2e2",
    price: 5.0,
    image: "/images/covers/cover_28.png",
    author: {
      name: "Destroy Dex",
      avatar: "/images/avatars/avatar_09.png",
    },
  },
  {
    id: 9,
    slug: "people-illustrations-pack-01",
    name: "People Illustrations Pack 01",
    description:
      "Pack that includes 6 people illustrations made with PS vectors. Photoshop files...",
    category: "Illustrations",
    categoryColor: "#23d2e2",
    price: 5.0,
    image: "/images/covers/cover_30.png",
    author: {
      name: "Destroy Dex",
      avatar: "/images/avatars/avatar_09.png",
    },
  },
  {
    id: 10,
    slug: "pixel-diamond-gaming-magazine",
    name: "Pixel Diamond Gaming Magazine",
    description:
      "Awesome HTML template for eSports and gaming! Also includes a forum...",
    category: "HTML Templates",
    categoryColor: "#615dfa",
    price: 26.0,
    image: "/images/covers/cover_07.png",
    author: {
      name: "Marina Valentine",
      avatar: "/images/avatars/avatar_01.png",
    },
  },
  {
    id: 11,
    slug: "gaming-coin-badges-pack",
    name: "Gaming Coin Badges Pack",
    description:
      "Very detailed gaming coin illustration badges, perfect for forums and...",
    category: "Logos & Badges",
    categoryColor: "#06b6d4",
    price: 6.0,
    image: "/images/covers/cover_08.png",
    author: {
      name: "Nick Grissom",
      avatar: "/images/avatars/avatar_02.png",
    },
  },
  {
    id: 12,
    slug: "crazy-bunny-coffee-mug",
    name: "Crazy Bunny Coffee Mug",
    description:
      "Incredible white coffee mug with the Crazy Bunny Illustration! Sizes are...",
    category: "Crafts",
    categoryColor: "#ec4899",
    price: 16.0,
    image: "/images/covers/cover_09.png",
    author: {
      name: "Bearded Wonder",
      avatar: "/images/avatars/avatar_06.png",
    },
  },
];

export default function MarketplacePage() {
  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="relative rounded-xl overflow-hidden bg-linear-to-r from-primary via-secondary to-primary p-8">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-8 w-24 h-24 border-4 border-white/30 rounded-full"></div>
          <div className="absolute bottom-4 right-32 w-16 h-16 border-4 border-white/20 rounded-full"></div>
          <div className="absolute top-8 right-48 w-8 h-8 bg-white/10 rounded-full"></div>
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">
              MARKETPLACE
            </h1>
            <p className="text-sm text-white/80 font-medium max-w-md">
              Discover premium digital goods from the community!
            </p>
          </div>
          <Link
            href="/marketplace/cart"
            className="px-5 py-3 bg-white/20 backdrop-blur-sm text-white text-sm font-bold rounded-xl hover:bg-white/30 transition-all flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            View Cart
          </Link>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-linear-to-b from-primary to-secondary rounded-full" />
          <h2 className="text-lg font-black uppercase">Market Categories</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              className="widget-box p-5 text-left transition-all duration-300 hover:translate-y-[-4px] group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all group-hover:scale-110"
                style={{
                  backgroundColor: `${category.color}20`,
                  color: category.color,
                }}
              >
                {category.icon}
              </div>
              <h3 className="text-sm font-bold mb-1">{category.name}</h3>
              <p className="text-[11px] font-medium text-text-muted mb-2">
                {category.description}
              </p>
              <div
                className="text-xs font-bold"
                style={{ color: category.color }}
              >
                {category.count.toLocaleString()} items
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="widget-box p-6 flex items-center justify-between bg-linear-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
            <svg
              className="w-6 h-6 text-secondary"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold">See what&apos;s new!</h3>
            <p className="text-xs text-text-muted">
              Browse the latest items from our sellers
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-linear-to-b from-secondary to-primary rounded-full" />
            <h2 className="text-lg font-black uppercase">Latest Items</h2>
          </div>
          <button className="text-xs font-bold text-primary hover:text-secondary transition-colors">
            Browse All Latest →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/marketplace/product/${product.slug}`}
              className="widget-box overflow-hidden transition-all duration-300 hover:translate-y-[-4px] group"
            >
              <div className="relative h-36 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-surface to-transparent opacity-60"></div>
                <div className="absolute top-3 left-3 px-3 py-1.5 bg-primary text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/30">
                  $ {product.price.toFixed(2)}
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors mb-1 line-clamp-1">
                  {product.name}
                </h3>

                <div className="flex items-center gap-1.5 mb-2">
                  <span
                    className="text-[10px] font-bold uppercase"
                    style={{ color: product.categoryColor }}
                  >
                    {product.category}
                  </span>
                </div>

                <p className="text-[11px] text-text-muted font-medium line-clamp-2 mb-3">
                  {product.description}
                </p>

                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  <span className="text-[10px] text-text-muted font-medium">
                    Posted By
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full overflow-hidden">
                      <img
                        src={product.author.avatar}
                        alt={product.author.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-white">
                      {product.author.name}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
