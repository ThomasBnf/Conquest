"use client";

import { cn } from "@conquest/ui/cn";
import type { TMentionElement } from "platejs";
import { IS_APPLE, KEYS } from "platejs";
import type { PlateElementProps } from "platejs/react";
import {
  PlateElement,
  useFocused,
  useReadOnly,
  useSelected,
} from "platejs/react";
import * as React from "react";
import { useMounted } from "../../hooks/use-mounted";

export function MentionElement(
  props: PlateElementProps<TMentionElement> & {
    prefix?: string;
  },
) {
  const element = props.element;

  const selected = useSelected();
  const focused = useFocused();
  const mounted = useMounted();
  const readOnly = useReadOnly();

  return (
    <PlateElement
      {...props}
      className={cn(
        "inline-block rounded-md bg-blue-50 px-1 py-0.5 align-baseline text-blue-600",
        !readOnly && "cursor-pointer",
        selected && focused && "ring-1 ring-ring",
        element.children[0]?.[KEYS.bold] === true && "font-bold",
        element.children[0]?.[KEYS.italic] === true && "italic",
        element.children[0]?.[KEYS.underline] === true && "underline",
      )}
      attributes={{
        ...props.attributes,
        contentEditable: false,
        "data-slate-value": element.value,
        draggable: true,
      }}
    >
      {mounted && IS_APPLE ? (
        // Mac OS IME https://github.com/ianstormtaylor/slate/issues/3490
        <React.Fragment>
          {props.children}
          {props.prefix}
          {element.value}
        </React.Fragment>
      ) : (
        // Others like Android https://github.com/ianstormtaylor/slate/pull/5360
        <React.Fragment>
          {props.prefix}
          {element.value}
          {props.children}
        </React.Fragment>
      )}
    </PlateElement>
  );
}
