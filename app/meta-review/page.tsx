import type { Metadata } from "next";
import LegalShell from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Meta App Review Support - TakeChat",
  description:
    "Meta App Review notes for TakeChat's official Instagram private reply workflow.",
};

export default function MetaReviewPage() {
  return (
    <LegalShell
      title="Meta App Review Support"
      description="TakeChat is designed for Instagram professional accounts that want to send private replies after keyword comments on their own posts or reels."
      updatedAt="November 14, 2026"
    >
      <section>
        <h2 className="text-xl font-bold text-white">User Flow</h2>
        <p className="mt-3">
          A business owner signs in by email, connects an Instagram professional
          account through Meta OAuth, creates a keyword campaign for a post or
          reel, and receives a webhook when someone comments. TakeChat queues
          the event, deduplicates it, checks rate limits, then sends a private
          reply using the comment ID.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Compliance Position</h2>
        <p className="mt-3">
          The app uses official Meta APIs, verifies webhook signatures, encrypts
          tokens, avoids scraping, avoids password collection, and sends no more
          than one private reply for a matched campaign/comment pair.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Review Test Notes</h2>
        <p className="mt-3">
          This app is currently in development mode for internal use. Accounts
          must be added as app roles or testers before they can connect. If Meta
          App Review is submitted later, a reviewer can connect an Instagram
          professional account, create a keyword such as LINK, comment that
          keyword on selected media, and confirm that the private reply is sent
          and logged once.
        </p>
      </section>
    </LegalShell>
  );
}
