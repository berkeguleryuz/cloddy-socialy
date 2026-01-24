export default function ProfileLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="widget-box">
        <div className="h-32 bg-background rounded-xl -mx-7 -mt-8 mb-4"></div>
        <div className="flex items-end gap-6 -mt-16 relative z-10 px-6">
          <div className="w-32 h-32 bg-background rounded-full border-4 border-surface"></div>
          <div className="flex-1 pb-4">
            <div className="h-6 bg-background rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-background rounded w-1/4"></div>
          </div>
        </div>
        <div className="flex gap-8 px-6 mt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-5 bg-background rounded w-12 mb-1"></div>
              <div className="h-3 bg-background rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="widget-box">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-background rounded-full"></div>
                <div>
                  <div className="h-4 bg-background rounded w-32 mb-2"></div>
                  <div className="h-3 bg-background rounded w-24"></div>
                </div>
              </div>
              <div className="h-20 bg-background rounded-xl"></div>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <div className="widget-box">
            <div className="h-4 bg-background rounded w-1/2 mb-4"></div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-background rounded mb-2"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
