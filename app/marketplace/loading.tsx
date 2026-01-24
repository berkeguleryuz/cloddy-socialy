export default function MarketplaceLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="widget-box animate-pulse">
              <div className="h-48 bg-background rounded-xl mb-4"></div>
              <div className="h-3 bg-background rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-background rounded w-3/4 mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="w-3 h-3 bg-background rounded"></div>
                  ))}
                </div>
                <div className="w-10 h-10 bg-background rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-1">
        <div className="widget-box animate-pulse">
          <div className="h-4 bg-background rounded w-1/2 mb-6"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-background rounded-lg mb-3"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
