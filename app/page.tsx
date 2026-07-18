import type { Metadata } from "next";
import ScrollDeck from "./ScrollDeck";

export const metadata: Metadata = {
  title: "DS Cinema — The autonomous camera operator",
  description:
    "A privacy-first AI cinematography system for solo creators. No crew. No cloud upload.",
};

export default function Home() {
  return <ScrollDeck />;
}
