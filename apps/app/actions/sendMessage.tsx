"use client";

import { Button } from "@conquest/ui/button";
import { postMessage } from "./postMessage";

export const SendMessage = async () => {
  return <Button onClick={() => postMessage()}>Post Message</Button>;
};
