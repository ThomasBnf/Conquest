"use client";

import { Skeleton } from "@conquest/ui/skeleton";

const TableLoadingState = () => {
  return (
    <>
      <div className="flex h-fit items-center gap-1 border-b px-4 py-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="relative h-full">
        <div className="flex">
          <div
            className="flex items-center gap-2 border-r border-b px-3"
            style={{ width: 325 }}
          >
            <div className="flex h-12 items-center">
              <Skeleton className="h-5 w-5" />
            </div>
            <div className="flex h-12 items-center">
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex divide-x border-b">
            {Array.from({ length: 5 }).map((_, colIndex) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={colIndex}
                className="flex h-12 items-center px-3"
                style={{ width: 250 }}
              >
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
        <div>
          {Array.from({ length: 20 }).map((_, rowIndex) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={rowIndex}
              className="[&:not(:last-child)]:border-b"
            >
              <div className="flex">
                <div
                  className="flex items-center gap-2 border-r px-3"
                  style={{ width: 325 }}
                >
                  <div className="flex h-12 items-center">
                    <Skeleton className="h-5 w-5" />
                  </div>
                  <div className="flex h-12 items-center">
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="flex divide-x">
                  {Array.from({ length: 5 }).map((_, colIndex) => (
                    <div
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      key={colIndex}
                      className="flex h-12 items-center px-3"
                      style={{ width: 250 }}
                    >
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex border-t">
          <div
            className="flex h-12 items-center justify-end border-r px-3"
            style={{ width: 325 }}
          >
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    </>
  );
};

export default TableLoadingState;
