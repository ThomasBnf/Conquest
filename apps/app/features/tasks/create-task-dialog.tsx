import { Button } from "@conquest/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@conquest/ui/dialog";
import { Input } from "@conquest/ui/input";
import { Plus } from "lucide-react";

export const CreateTaskDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus size={16} />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Input
            placeholder="Task Title"
            variant="transparent"
            className="font-medium text-lg"
          />
        </DialogBody>
        <DialogFooter className="flex items-center justify-between">
          <div className="flex flex-1 items-center gap-2">
            <Button variant="ghost">Due Date</Button>
            <Button variant="ghost">Assignee</Button>
            <Button variant="ghost">Member</Button>
          </div>
          <div className="flex items-center gap-2">
            <DialogTrigger>
              <Button variant="outline">Cancel</Button>
            </DialogTrigger>
            <Button>Create</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
