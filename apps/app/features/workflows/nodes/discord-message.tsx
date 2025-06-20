import { VARIABLES } from "@/constant";
import { trpc } from "@/server/client";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@conquest/ui/command";
import { Label } from "@conquest/ui/label";
import { EditorContainer, PlateEditor } from "@conquest/ui/plate/editor";
import { EmojiToolbarButton } from "@conquest/ui/plate/emoji-toolbar";
import { FixedToolbar } from "@conquest/ui/plate/fixed-toolbar";
import { MarkToolbarButton } from "@conquest/ui/plate/mark-toolbar-button";
import { MentionElement } from "@conquest/ui/plate/mention-node";
import { ToolbarButton } from "@conquest/ui/plate/toolbar";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { NodeDiscordMessageSchema } from "@conquest/zod/schemas/node.schema";
import emojiMartData from "@emoji-mart/data";
import {
  BoldPlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from "@platejs/basic-nodes/react";
import { EmojiPlugin } from "@platejs/emoji/react";
import { MentionPlugin } from "@platejs/mention/react";
import { useReactFlow } from "@xyflow/react";
import {
  Bold,
  CurlyBraces,
  Hash,
  Italic,
  Strikethrough,
  Underline,
} from "lucide-react";
import { Plate, createPlateEditor } from "platejs/react";
import { useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import { useWorkflow } from "../context/workflowContext";
import { TestDiscordMessage } from "./test-discord-message";

export const DiscordMessage = () => {
  const { node, setFocus } = useWorkflow();
  const { updateNodeData } = useReactFlow();
  const { message } = NodeDiscordMessageSchema.parse(node?.data);
  const [open, setOpen] = useState(false);
  const [openChannel, setOpenChannel] = useState(false);

  const editor = useMemo(
    () =>
      createPlateEditor({
        plugins: [
          BoldPlugin,
          ItalicPlugin,
          UnderlinePlugin,
          StrikethroughPlugin,
          MentionPlugin.configure({
            options: {
              trigger: uuid(),
            },
          }).withComponent(MentionElement),
          EmojiPlugin.configure({
            options: {
              trigger: uuid(),
              // @ts-expect-error - emojiMartData is not typed
              data: emojiMartData as unknown,
            },
          }),
        ],
        handlers: {
          onFocus: () => setFocus(true),
          onBlur: ({ editor }) => {
            if (!node) return;
            if (editor.children[0]?.text === "") return;

            setFocus(false);
            updateNodeData(node.id, { ...node.data, message: editor.children });
          },
        },
        value: message,
      }),
    [node?.id],
  );

  const { data } = trpc.channels.list.useQuery({ source: "Discord" });

  const channels = data?.map((channel) => ({
    label: channel.name,
    text: `{#${channel.name}}`,
  }));

  const onClick = (text: string) => {
    editor.tf.focus();

    editor.tf.insertNode({
      type: "mention",
      value: text,
      children: [{ text: "" }],
    });

    editor.tf.insertText(" ");
  };

  return (
    <>
      <div className="space-y-1">
        <Label>Message</Label>
        <div className="rounded-md border">
          <Plate editor={editor}>
            <FixedToolbar className="flex justify-start gap-1">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <ToolbarButton
                    pressed={open}
                    tooltip="Member variables"
                    isDropdown
                  >
                    <CurlyBraces size={16} />
                  </ToolbarButton>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="mention"
                          onSelect={() => onClick("{@mention}")}
                        >
                          Mention member
                        </CommandItem>
                      </CommandGroup>
                      <CommandSeparator />
                      <CommandGroup>
                        {VARIABLES.map((item) => (
                          <CommandItem
                            key={item.label}
                            value={item.label}
                            onSelect={() => onClick(item.text)}
                          >
                            {item.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Popover open={openChannel} onOpenChange={setOpenChannel}>
                <PopoverTrigger asChild>
                  <ToolbarButton
                    pressed={openChannel}
                    tooltip="Channel variables"
                    isDropdown
                  >
                    <Hash size={16} />
                  </ToolbarButton>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup>
                        {channels?.map((channel) => (
                          <CommandItem
                            key={channel.label}
                            value={channel.label}
                            onSelect={() => onClick(channel.text)}
                          >
                            <Hash size={16} className="mr-1" />
                            {channel.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <div className="h-6 w-px bg-border" />
              <MarkToolbarButton nodeType="bold" tooltip="Bold (⌘+B)">
                <Bold size={16} />
              </MarkToolbarButton>
              <MarkToolbarButton nodeType="italic" tooltip="Italic (⌘+I)">
                <Italic size={16} />
              </MarkToolbarButton>
              <MarkToolbarButton nodeType="underline" tooltip="Underline (⌘+U)">
                <Underline size={16} />
              </MarkToolbarButton>
              <MarkToolbarButton
                nodeType="strikethrough"
                tooltip="Strikethrough (⌘+⇧+m)"
              >
                <Strikethrough size={16} />
              </MarkToolbarButton>
              <EmojiToolbarButton />
            </FixedToolbar>
            <EditorContainer>
              <PlateEditor
                placeholder="Write your message here..."
                className="text-sm sm:px-2 sm:pt-2 sm:pb-24"
              />
            </EditorContainer>
          </Plate>
        </div>
      </div>
      <TestDiscordMessage />
    </>
  );
};
