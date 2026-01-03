interface ProductCardProps {
  name: string;
  category: string;
  price: number;
  image: string;
  rating: number;
  sales: number;
}

export default function ProductCard({
  name,
  category,
  price,
  image,
  rating,
  sales,
}: ProductCardProps) {
  return (
    <div className="card overflow-hidden group border border-transparent hover:border-primary/30 transition-all duration-300">
      <div className="h-48 overflow-hidden relative">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4 py-1 px-3 bg-primary text-white text-[10px] font-black rounded-lg shadow-xl shadow-primary/40 uppercase">
          ${price.toFixed(2)}
        </div>
      </div>

      <div className="p-6 flex flex-col gap-1">
        <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
          {category}
        </p>
        <h3 className="text-sm font-black hover:text-primary transition-colors cursor-pointer mb-2">
          {name}
        </h3>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(rating)
                    ? "text-yellow-400"
                    : "text-text-muted/40"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
            ))}
            <span className="text-[10px] text-text-muted font-bold ml-1">
              ({sales})
            </span>
          </div>
          <button className="w-10 h-10 bg-background text-white rounded-lg flex items-center justify-center hover:bg-primary transition-all">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
