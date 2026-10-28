"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import rules from "./rules.json";

// ---------- Types ----------
type Rule = {
  intent: string;
  keywords: string[];
  reply: string;
};

type Message = {
  id: number;
  sender: "user" | "bot";
  text: string;
};

// ---------- Settings ----------
const RULES: Rule[] = rules as Rule[];

const WELCOME_MESSAGE =
  "Assalam o Alaikum! 👋 Welcome to Desi Bites, Sargodha.\n\nI can help you with our menu, deals, delivery, timings, location and payment. Tap a button below or type your question.";

const FALLBACK_MESSAGE =
  "Sorry, I didn't understand that. 🙏\n\nYou can ask me about:\n• Menu\n• Deals\n• Delivery\n• Timings\n• Location\n• Payment\n• How to order\n• Contact";

const QUICK_TOPICS = ["Menu", "Deals", "Timings", "Location", "Delivery", "Payment"];

const TYPING_DELAY_MS = 500;

// ---------- Matching logic ----------

// Makes text lowercase, removes punctuation and extra spaces.
// Example: "Hi!! What's the MENU?" -> "hi what s the menu"
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Finds the first rule whose keyword appears as a whole word.
// Spaces are added around the message and keyword, so
// " hi " is found in " hi there " but NOT in " this is good ".
function getBotReply(userText: string): string {
  const paddedMessage = ` ${normalize(userText)} `;

  for (const rule of RULES) {
    for (const keyword of rule.keywords) {
      const paddedKeyword = ` ${normalize(keyword)} `;
      if (paddedMessage.includes(paddedKeyword)) {
        return rule.reply;
      }
    }
  }

  return FALLBACK_MESSAGE;
}

// ---------- Page component ----------
export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, sender: "bot", text: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const nextId = useRef(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to the newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function sendMessage(text: string) {
    const cleanText = text.trim();
    if (cleanText === "" || isTyping) return;

    const userMessage: Message = {
      id: nextId.current++,
      sender: "user",
      text: cleanText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Wait half a second, then show the bot reply
    setTimeout(() => {
      const botMessage: Message = {
        id: nextId.current++,
        sender: "bot",
        text: getBotReply(cleanText),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, TYPING_DELAY_MS);
  }

  // Pressing Enter in the input submits the form
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="min-h-dvh bg-orange-50 text-gray-900 flex justify-center">
      <div className="w-full max-w-2xl h-dvh flex flex-col bg-white shadow-lg">
        {/* Header */}
        <header className="bg-orange-500 text-white px-4 py-3 flex items-center gap-3 shadow">
          <div className="h-10 w-10 rounded-full bg-white text-orange-500 flex items-center justify-center text-xl font-bold">
            🍛
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Desi Bites</h1>
            <p className="text-xs text-orange-100">
              {isTyping ? "typing..." : "Online • Sargodha"}
            </p>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-orange-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2 text-sm sm:text-base whitespace-pre-line wrap-break-word shadow-sm ${
                  message.sender === "user"
                    ? "bg-orange-500 text-white rounded-br-sm"
                    : "bg-white text-gray-800 border border-orange-100 rounded-bl-sm"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-orange-100 text-gray-500 italic rounded-2xl rounded-bl-sm px-4 py-2 text-sm shadow-sm">
                typing...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </main>

        {/* Quick topic buttons */}
        <div className="px-3 pt-2 pb-1 border-t border-orange-100 bg-white">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {QUICK_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => sendMessage(topic)}
                disabled={isTyping}
                className="shrink-0 rounded-full border border-orange-300 bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-700 hover:bg-orange-100 active:bg-orange-200 disabled:opacity-50"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2 px-3 py-3 bg-white">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type your message..."
            className="flex-1 min-w-0 rounded-full border border-orange-300 bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            type="submit"
            disabled={isTyping || input.trim() === ""}
            className="rounded-full bg-orange-500 px-5 py-2 font-semibold text-white hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}