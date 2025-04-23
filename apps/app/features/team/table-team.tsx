"use client";

import { trpc } from "@/server/client";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { format } from "date-fns";
import { UserMenu } from "./user-menu";

export const TableTeam = () => {
  const { data: users } = trpc.team.list.useQuery();
  const { data: invitations } = trpc.team.invitations.useQuery();

  return (
    <div className="mt-4 divide-y rounded-md border">
      <div className="flex items-center justify-between p-2 px-4">
        <p className="w-full max-w-52">Name</p>
        <p className="w-full min-w-20 max-w-96">Email</p>
        <p className="w-24 shrink-0">Role</p>
        <p className="w-24 shrink-0">Joined</p>
        <p className="w-24 shrink-0">Last seen</p>
        <div className="w-8" />
      </div>
      <div className="bg-muted p-2 px-4">
        <p className="text-muted-foreground">Active</p>
      </div>
      <div>
        {users?.map((user) => (
          <div
            key={user.id}
            className="flex h-12 items-center justify-between border-b px-4 last:border-b-0"
          >
            <div className="flex h-12 w-full max-w-52 items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage src={user.avatar_url ?? ""} />
                <AvatarFallback>
                  {user.first_name?.charAt(0)}
                  {user.last_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <p className="font-medium">
                {user.first_name} {user.last_name}
              </p>
            </div>
            <p className="w-full min-w-20 max-w-96 truncate text-muted-foreground">
              {user.email}
            </p>
            <p className="w-24 shrink-0 text-muted-foreground">{user.role}</p>
            <p className="w-24 shrink-0 text-muted-foreground">
              {format(user.created_at, "MMM dd")}
            </p>
            <p className="w-24 shrink-0 text-muted-foreground">
              {format(user.last_activity_at, "MMM dd")}
            </p>
          </div>
        ))}
      </div>
      <div className="bg-muted p-2 px-4">
        <p className="text-muted-foreground">Invited</p>
      </div>
      <div>
        {invitations?.map((user) => (
          <div
            key={user.id}
            className="flex h-12 items-center justify-between border-b px-4 last:border-b-0"
          >
            <div className="flex h-12 w-full max-w-52 items-center gap-2">
              <p className="font-medium">{user.email}</p>
            </div>
            <p className="w-full min-w-20 max-w-96 truncate text-muted-foreground">
              {user.email}
            </p>
            <UserMenu />
          </div>
        ))}
      </div>
    </div>
  );
};
