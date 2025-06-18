import { Logo } from "@conquest/ui/brand/logo";
import { Button } from "@conquest/ui/button";
import { Dispatch, SetStateAction } from "react";

type Props = {
  sentTo: string;
  setSentTo: Dispatch<SetStateAction<string>>;
  buttonLabel: string;
};

export const EmailSuccess = ({ sentTo, setSentTo, buttonLabel }: Props) => {
  return (
    <div className="flex w-full max-w-lg flex-col items-center justify-center gap-6">
      <Logo size={72} />
      <p className="font-medium text-xl">Check your email</p>
      <div className="text-center text-muted-foreground">
        <p>We've sent a temporary login link.</p>
        <p className="mt-2">Please check your inbox at </p>
        <p className="text-foreground">{sentTo}</p>
      </div>
      <Button variant="link" onClick={() => setSentTo("")}>
        {buttonLabel}
      </Button>
    </div>
  );
};
