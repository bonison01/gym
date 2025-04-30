
export const Spinner = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <span className="text-sm font-medium text-muted-foreground">Loading...</span>
    </div>
  );
};
