export default function MembersLoading() {
  return (
    <div className="space-y-8">
      <div className="widget-box animate-pulse">
        <div className="h-6 bg-background rounded w-1/4 mb-4"></div>
        <div className="flex gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-background rounded-lg w-24"></div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="widget-box animate-pulse">
            <div className="h-20 bg-background rounded-t-xl -mx-7 -mt-8 mb-4"></div>
            <div className="flex gap-6">
              <div className="w-24 h-24 bg-background rounded-full -mt-12"></div>
              <div className="flex-1 pt-2">
                <div className="h-4 bg-background rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-background rounded w-1/3 mb-4"></div>
                <div className="flex gap-4 mb-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-8 bg-background rounded w-16"></div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <div className="h-10 bg-background rounded-lg flex-1"></div>
                  <div className="h-10 bg-background rounded-lg flex-1"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
