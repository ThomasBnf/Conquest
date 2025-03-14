import { useUser } from "@/context/userContext";
import { trpc } from "@/server/client";
import { cn } from "@conquest/ui/cn";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useDebounce } from "use-debounce";
import type { Workspace } from "../schemas/create-workspace.schema";

type Props = {
  form: UseFormReturn<Workspace>;
};

export const WorkspaceFields = ({ form }: Props) => {
  return <></>;
};
