"use client";

import { useState } from "react";
import Link from "next/link";
import HexagonAvatar from "@/components/HexagonAvatar";

// Mock product data - in real app this would come from API
const product = {
  id: 10,
  slug: "pixel-diamond-gaming-magazine",
  name: "Pixel Diamond Gaming Magazine",
  description: `The Best eSports and Gaming Magazine Template!

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

356+ HTML Elements Library included

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
  features: [
    "64 HTML Files",
    "CSS and JS Elements Library with 365+ Items!",
    "63 PSD Files Included SAVE $12",
    "Easy template customization using npm & grunt (optional)",
    "Vector Illustrations Included",
    "84+ eSports Widgets",
    "Custom Plugins",
    "Fully Responsive",
    "Google Fonts",
  ],
  category: "HTML Templates",
  categoryColor: "#615dfa",
  price: 26.0,
  extendedPrice: 126.0,
  sales: 1360,
  rating: 4.2,
  image: "/images/covers/cover_07.png",
  gallery: [
    "/images/covers/cover_07.png",
    "/images/covers/cover_01.png",
    "/images/covers/cover_02.png",
  ],
  author: {
    name: "Marina Valentine",
    avatar: "/images/avatars/avatar_01.png",
    level: 24,
    items: 5,
    badges: 9,
  },
  details: {
    updated: "October 13rd, 2019",
    created: "August 17th, 2019",
    files: "HTML Files, CSS Files, JS Files, Layered PSD",
    layout: "Responsive",
    tags: ["Gaming", "Magazine", "Web", "eSports", "Template"],
  },
};

const comments = [
  {
    id: 1,
    user: {
      name: "Bearded Wonder",
      avatar: "/images/avatars/avatar_06.png",
      level: 6,
    },
    text: "Hi! I just purchased this item and I have a question, does it have the PSD files included? Thanks!",
    time: "15 minutes ago",
    reaction: "Happy",
    likes: 4,
  },
  {
    id: 2,
    user: {
      name: "Marina Valentine",
      avatar: "/images/avatars/avatar_01.png",
      level: 24,
    },
    text: "Yes! They are all included in the pack!",
    time: "15 minutes ago",
    likes: 1,
    isReply: true,
  },
  {
    id: 3,
    user: {
      name: "Nick Grissom",
      avatar: "/images/avatars/avatar_02.png",
      level: 16,
    },
    text: "Hi Marina! I'm really liking what you did here! I've checked all the pages and the design is really great, plus it has lots of statistics and match overview options! Amazing job, and good luck!",
    time: "15 minutes ago",
    likes: 0,
  },
  {
    id: 4,
    user: {
      name: "Neko Bebop",
      avatar: "/images/avatars/avatar_03.png",
      level: 12,
    },
    text: "Thanks for this great template! I'm already using it and it's really awesome ;)",
    time: "15 minutes ago",
    likes: 0,
  },
];

const reviews = [
  {
    id: 1,
    user: {
      name: "Nick Grissom",
      avatar: "/images/avatars/avatar_02.png",
      level: 16,
    },
    rating: 5,
    reason: "Item Quality",
    text: "Main reason would pretty much be all, nice clean code, easy to customise and work with. Commenting on each section is great, could not really ask for anything better. Top work!",
    time: "15 minutes ago",
  },
  {
    id: 2,
    user: {
      name: "Bearded Wonder",
      avatar: "/images/avatars/avatar_06.png",
      level: 6,
    },
    rating: 5,
    reason: "Documentation",
    text: "Best template I have ever had. Good documentation and code practices.",
    time: "2 days ago",
  },
  {
    id: 3,
    user: {
      name: "Sarah Diamond",
      avatar: "/images/avatars/avatar_05.png",
      level: 26,
    },
    rating: 5,
    reason: "Item Quality",
    text: "5 stars for exceptional Customer Support (quick, precise, detailed responses to questions), but 5 stars also for Design Quality and Customization. It is a beautiful clean design that can easily be customized to your needs.",
    time: "4 weeks ago",
  },
];

export default function ProductPage() {
  const [activeTab, setActiveTab] = useState<
    "description" | "comments" | "reviews"
  >("description");
  const [selectedLicense, setSelectedLicense] = useState<
    "regular" | "extended"
  >("regular");
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-2 text-xs">
        <Link
          href="/marketplace"
          className="text-text-muted hover:text-primary transition-colors font-medium"
        >
          Marketplace
        </Link>
        <span className="text-text-muted">/</span>
        <Link
          href="/marketplace"
          className="text-text-muted hover:text-primary transition-colors font-medium"
        >
          Digital Items
        </Link>
        <span className="text-text-muted">/</span>
        <span className="text-white font-bold">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="widget-box p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-black">{product.name}</h1>
              <button className="px-4 py-2 bg-primary/20 text-primary text-xs font-bold rounded-lg hover:bg-primary/30 transition-colors">
                Live Preview
              </button>
            </div>

            <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
              <img
                src={product.gallery[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex gap-2">
              {product.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx
                      ? "border-primary"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="widget-box p-0! overflow-hidden">
            <div className="flex border-b border-border">
              {[
                { id: "description", label: "Description" },
                { id: "comments", label: `Comments ${comments.length}` },
                { id: "reviews", label: `Reviews ${reviews.length}` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-6 py-4 text-xs font-bold uppercase transition-colors relative ${
                    activeTab === tab.id
                      ? "text-white"
                      : "text-text-muted hover:text-white"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id ? (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                  ) : null}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === "description" ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold">
                    The Best eSports and Gaming Magazine Template!
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                  <h4 className="text-sm font-bold mt-6">
                    Included in the Pack:
                  </h4>
                  <ul className="space-y-2">
                    {product.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-3 text-xs text-text-muted"
                      >
                        <svg
                          className="w-4 h-4 text-accent-green shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {activeTab === "comments" ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`flex gap-4 ${comment.isReply ? "ml-12" : ""}`}
                    >
                      <HexagonAvatar
                        src={comment.user.avatar}
                        level={comment.user.level}
                        size="md"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold">
                            {comment.user.name}
                          </span>
                          {comment.reaction ? (
                            <span className="px-2 py-0.5 bg-accent-yellow/20 text-accent-yellow text-[9px] font-bold rounded">
                              {comment.reaction}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-text-muted mb-2">
                          {comment.text}
                        </p>
                        <div className="flex items-center gap-4 text-[10px] text-text-muted">
                          <button className="hover:text-primary transition-colors">
                            Like
                          </button>
                          {comment.likes > 0 && <span>{comment.likes}</span>}
                          <button className="hover:text-primary transition-colors">
                            React!
                          </button>
                          <button className="hover:text-primary transition-colors">
                            Reply
                          </button>
                          <span>{comment.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-border">
                    <h4 className="text-sm font-bold mb-3">Leave a Comment</h4>
                    <textarea
                      placeholder="Write your comment..."
                      className="w-full h-24 px-4 py-3 bg-background rounded-xl text-sm text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>
                </div>
              ) : null}

              {activeTab === "reviews" ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="flex gap-4 p-4 bg-background/50 rounded-xl"
                    >
                      <HexagonAvatar
                        src={review.user.avatar}
                        level={review.user.level}
                        size="md"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= review.rating
                                    ? "text-yellow-400"
                                    : "text-gray-600"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-[10px] text-primary font-bold">
                            Reason: {review.reason}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted mb-2">
                          {review.text}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-text-muted">
                          <span className="font-bold text-white">
                            {review.user.name}
                          </span>
                          <span>•</span>
                          <span>{review.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="widget-box p-6">
            <div className="text-3xl font-black text-primary mb-4">
              ${" "}
              {selectedLicense === "regular"
                ? product.price.toFixed(2)
                : product.extendedPrice.toFixed(2)}
            </div>

            <div className="space-y-3 mb-6">
              <label
                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  selectedLicense === "regular"
                    ? "bg-primary/10 border border-primary"
                    : "bg-background border border-transparent"
                }`}
              >
                <input
                  type="radio"
                  name="license"
                  checked={selectedLicense === "regular"}
                  onChange={() => setSelectedLicense("regular")}
                  className="mt-1"
                />
                <div>
                  <div className="text-xs font-bold">Regular License</div>
                  <p className="text-[10px] text-text-muted">
                    For use in a single end product which end users are not
                    charged for.
                  </p>
                </div>
              </label>
              <label
                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  selectedLicense === "extended"
                    ? "bg-primary/10 border border-primary"
                    : "bg-background border border-transparent"
                }`}
              >
                <input
                  type="radio"
                  name="license"
                  checked={selectedLicense === "extended"}
                  onChange={() => setSelectedLicense("extended")}
                  className="mt-1"
                />
                <div>
                  <div className="text-xs font-bold">Extended License</div>
                  <p className="text-[10px] text-text-muted">
                    For use in a single end product which end users can be
                    charged for.
                  </p>
                </div>
              </label>
            </div>

            <Link
              href="/marketplace/cart"
              className="w-full py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
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
              Add to Your Cart!
            </Link>

            <div className="flex justify-center gap-8 mt-6 pt-6 border-t border-border">
              <div className="text-center">
                <div className="text-lg font-black">
                  {product.sales.toLocaleString()}
                </div>
                <div className="text-[10px] text-text-muted font-bold uppercase">
                  sales
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black">{product.rating}/5</div>
                <div className="text-[10px] text-text-muted font-bold uppercase">
                  rating
                </div>
              </div>
            </div>
          </div>

          <div className="widget-box p-6">
            <h3 className="text-xs font-bold uppercase text-text-muted mb-4">
              Item Author
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <HexagonAvatar
                  src={product.author.avatar}
                  level={product.author.level}
                  size="lg"
                />
                <div className="absolute -right-1 -bottom-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                  +{product.author.badges}
                </div>
              </div>
              <div>
                <Link
                  href="/profile"
                  className="text-sm font-bold hover:text-primary transition-colors"
                >
                  {product.author.name}
                </Link>
                <p className="text-[10px] text-text-muted font-medium">
                  {product.author.items} items published
                </p>
              </div>
            </div>
            <Link
              href="/profile"
              className="w-full py-2.5 bg-secondary/20 text-secondary text-xs font-bold rounded-xl hover:bg-secondary/30 transition-all text-center block"
            >
              View Author&apos;s Store
            </Link>
          </div>

          <div className="widget-box p-6">
            <h3 className="text-xs font-bold uppercase text-text-muted mb-4">
              Item Details
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Updated</span>
                <span className="font-bold">{product.details.updated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Created</span>
                <span className="font-bold">{product.details.created}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Category</span>
                <Link
                  href="/marketplace"
                  className="font-bold text-primary hover:text-secondary transition-colors"
                >
                  {product.category}
                </Link>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Files Included</span>
                <span className="font-bold text-right max-w-[150px]">
                  {product.details.files}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Layout</span>
                <span className="font-bold">{product.details.layout}</span>
              </div>
              <div className="pt-3 border-t border-border">
                <span className="text-text-muted block mb-2">Tags</span>
                <div className="flex flex-wrap gap-2">
                  {product.details.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-background text-[10px] font-bold rounded hover:text-primary cursor-pointer transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
