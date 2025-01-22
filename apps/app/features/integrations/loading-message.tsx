export const LoadingMessage = () => (
  <div className="rounded border bg-muted p-3">
    <div className="mb-1 flex items-center gap-2">
      <p className="text-base">⚠️</p>
      <p className="font-medium">Sync in progress</p>
    </div>
    <p className="text-muted-foreground">
      The process can take from a few minutes to several hours, depending on the
      volume of your data. <br />
      <span className="text-foreground">
        You will be notified by email when the sync is complete.
      </span>
    </p>
  </div>
);
