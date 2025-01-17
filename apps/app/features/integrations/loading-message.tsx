export const LoadingMessage = () => (
  <div className="actions-primary rounded bg-foreground p-3 text-white">
    <div className="mb-1 flex items-center gap-2">
      <p className="text-xl">⚠️</p>
      <p className="font-medium">Sync in progress</p>
    </div>
    <p className="opacity-80">
      It may take from a few minutes to several hours, depending on your
      community <br />
      You'll be notified by email when complete.
      <br />
      View imported members in real-time.
    </p>
  </div>
);
