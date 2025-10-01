import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizonal, Bot, User } from "lucide-react";

interface Msg {
  id: string;
  role: "bot" | "user";
  text: string;
}

export default function Help() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: "m1",
      role: "bot",
      text: "Hi! I’m your RideLink assistant. Ask about rides, payments or safety.",
    },
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [msgs]);

  const send = () => {
    const q = input.trim();
    if (!q) return;
    const userMsg: Msg = { id: `u_${Date.now()}`, role: "user", text: q };
    setMsgs((m) => [...m, userMsg]);
    setInput("");
    const reply: Msg = {
      id: `b_${Date.now()}`,
      role: "bot",
      text: "Thanks! Our team will get back shortly. For urgent issues, call 112 or see Safety.",
    };
    setTimeout(() => setMsgs((m) => [...m, reply]), 400);
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Card className="h-[70vh] grid grid-rows-[auto_1fr_auto]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" /> RideLink Help
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-full" ref={listRef as any}>
            <div className="space-y-3 p-4">
              {msgs.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "bot" && (
                    <Bot className="mt-1 h-4 w-4 text-primary" />
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
                  >
                    {m.text}
                  </div>
                  {m.role === "user" && <User className="mt-1 h-4 w-4" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-center gap-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
            />
            <Button onClick={send} className="gap-2">
              <SendHorizonal className="h-4 w-4" />
              Send
            </Button>
          </div>
        </CardFooter>
      </Card>
    </section>
  );
}
