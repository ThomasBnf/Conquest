export const LoadingMessage = () => (
  <div className="rounded border bg-muted p-3">
    <div className="mb-1 flex items-center gap-2">
      <p className="text-base">⚠️</p>
      <p className="font-medium">Sync in progress</p>
    </div>
    <p className="text-muted-foreground">
      It may take from a few minutes to several hours, depending on your
      community size. <br />
      <span className="text-foreground">
        You'll be notified by email when is finished.
      </span>
    </p>
  </div>
);
