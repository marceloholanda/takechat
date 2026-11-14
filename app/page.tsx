import { cache } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import localFont from "next/font/local";
import { DemoNotice } from "@/components/demo-notice";
import { LandingLanguageSwitcher } from "@/components/landing-language-switcher";
import { I18nProvider } from "@/lib/i18n/provider";
import { LOCALE_COOKIE } from "@/lib/i18n";
import { landingCopy, type LandingCopy, type LandingLocale } from "@/lib/landing-copy";
import "./landing.css";

const geist = localFont({
  src: "../public/fonts/geist-latin.woff2",
  display: "swap",
  weight: "100 900",
});
const GITHUB_URL = "https://github.com/marceloholanda/takechat";
const CONTACT_URL = "mailto:marceloholcomercial@gmail.com";
const SETUP_DOCS_URL = `${GITHUB_URL}/blob/codex/cloudflare-queues-supabase/docs/takechat-deploy-cloudflare.md`;

const getLandingLocale = cache(async (): Promise<LandingLocale> => {
  const cookieStore = await cookies();
  return cookieStore.get(LOCALE_COOKIE)?.value === "en" ? "en" : "pt-BR";
});

function formatStars(count: number, locale: LandingLocale): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(count);
}

const githubIconPath =
  "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92-.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z";

async function getGitHubStars(): Promise<number | null> {
  try {
    const res = await fetch("https://api.github.com/repos/marceloholanda/takechat", {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: number };
    return typeof data.stargazers_count === "number"
      ? data.stargazers_count
      : null;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const copy = landingCopy[await getLandingLocale()];
  return {
    title: copy.metadataTitle,
    description: copy.metadataDescription,
  };
}

function ReplyPreview({ copy }: { copy: LandingCopy["preview"] }) {
  return (
    <figure className="or-preview" aria-label={copy.ariaLabel}>
      <div className="or-preview-top">
        <span className="or-wordmark">
          TakeChat<span aria-hidden="true">↗</span>
        </span>
        <span className="or-mono">{copy.heading}</span>
      </div>
      <div className="or-preview-body">
        <div className="or-preview-heading">
          <span className="or-avatar">S</span>
          <div>
            <strong>{copy.accountName}</strong>
            <span>{copy.accountHandle}</span>
          </div>
          <span className="or-active">{copy.active}</span>
        </div>
        <div className="or-post">
          <span className="or-mono">{copy.campaign}</span>
          <p>
            {copy.postPrompt[0]}
            <br />
            {copy.postPrompt[1]}
          </p>
          <span>
            {copy.keywordLabel} {copy.keyword}
          </span>
          <div className="or-post-lines" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className="or-comment">
          <span className="or-avatar or-avatar-small">M</span>
          <div>
            <strong>{copy.commenter}</strong>
            <p>{copy.comment}</p>
          </div>
        </div>
        <div className="or-match">
          <span aria-hidden="true">↓</span>
          <span>
            {copy.keywordLabel} <code>{copy.keyword}</code> {copy.matched}
          </span>
          <span className="or-match-line" />
          <span>{copy.privateReply}</span>
        </div>
        <div className="or-message">
          <span className="or-mono">{copy.sender}</span>
          <p>{copy.message}</p>
          <span className="or-message-link">
            {copy.link} <span aria-hidden="true">↗</span>
          </span>
        </div>
        <div className="or-delivered">
          <span aria-hidden="true">✓</span> {copy.delivered}
        </div>
      </div>
      <figcaption>{copy.caption}</figcaption>
    </figure>
  );
}

export default async function Home() {
  const [locale, stars] = await Promise.all([getLandingLocale(), getGitHubStars()]);
  const copy = landingCopy[locale];

  return (
    <I18nProvider locale={locale}>
      <div id="top" className={`or-landing ${geist.className}`}>
        <a className="or-skip" href="#main">
          {copy.skipContent}
        </a>
        <DemoNotice variant="banner" />
        <header className="or-header">
          <div className="or-container or-nav">
            <a className="or-wordmark" href="#top" aria-label={copy.nav.homeAria}>
              TakeChat
            </a>
            <nav aria-label={copy.nav.mainAria}>
              <a href="#how">{copy.nav.how}</a>
              <a href="#setup">{copy.nav.setup}</a>
              <a href={CONTACT_URL}>{copy.nav.contact}</a>
              <a
                className="or-stars"
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                aria-label={copy.nav.githubAria}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d={githubIconPath} />
                </svg>
                {stars !== null && <span>{formatStars(stars, locale)}</span>}
              </a>
            </nav>
            <div className="or-nav-cta">
              <LandingLanguageSwitcher />
              <a className="or-nav-signin" href="/login">
                {copy.nav.signIn}
              </a>
              <a className="or-button or-button-small" href="/login">
                {copy.nav.getStarted} <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </header>
        <main id="main">
          <section className="or-container or-hero">
            <div className="or-hero-copy">
              <h1>
                {copy.hero.title[0]}
                <br />
                {copy.hero.title[1]}
              </h1>
              <p className="or-lead">{copy.hero.description}</p>
              <div className="or-actions">
                <a className="or-button or-button-primary" href={SETUP_DOCS_URL}>
                  {copy.hero.setup} <span aria-hidden="true">↗</span>
                </a>
                <a className="or-text-link" href="#how">
                  {copy.hero.how} <span aria-hidden="true">↓</span>
                </a>
              </div>
              <p className="or-hero-note">{copy.hero.note}</p>
            </div>
            <ReplyPreview copy={copy.preview} />
          </section>
          <div className="or-container or-principles">
            {copy.principles.map((principle) => (
              <span key={principle}>{principle}</span>
            ))}
          </div>
          <div className="or-container">
            <div className="or-sheet">
              <section id="how" className="or-section or-how">
                <div>
                  <h2>{copy.how.title}</h2>
                  <p>{copy.how.description}</p>
                </div>
                <ol className="or-steps">
                  {copy.how.steps.map((step, index) => (
                    <li key={step.title}>
                      <span className="or-step-number">0{index + 1}</span>
                      <div>
                        <h3>{step.title}</h3>
                        <p>{step.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
              <section id="features" className="or-section">
                <div className="or-section-intro">
                  <h2>{copy.features.title}</h2>
                </div>
                <div className="or-feature-grid">
                  {copy.features.cards.map((feature) => (
                    <article key={feature.title}>
                      <h3>{feature.title}</h3>
                      <p>{feature.description}</p>
                    </article>
                  ))}
                </div>
              </section>
              <section className="or-technical">
                <div>
                  <h2>
                    {copy.technical.title[0]}
                    <br />
                    {copy.technical.title[1]}
                  </h2>
                  <p>{copy.technical.description}</p>
                  <a href={GITHUB_URL} className="or-text-link">
                    {copy.technical.sourceLink} <span aria-hidden="true">↗</span>
                  </a>
                </div>
                <div className="or-runtime">
                  {copy.technical.runtime.map((item) => (
                    <div key={item.title}>
                      <span className="or-mono">{item.label}</span>
                      <strong>{item.title}</strong>
                      <span>{item.description}</span>
                    </div>
                  ))}
                </div>
              </section>
              <section id="setup" className="or-section">
                <div className="or-section-intro">
                  <h2>{copy.setup.title}</h2>
                  <p>{copy.setup.description}</p>
                </div>
                <div className="or-provider-grid">
                  <article>
                    <div className="or-provider-title">
                      <h3>{copy.setup.connectTitle}</h3>
                      <span>{copy.setup.apiLabel}</span>
                    </div>
                    <p>{copy.setup.accountDescription}</p>
                    <a className="or-text-link" href={SETUP_DOCS_URL}>
                      {copy.setup.detailsLink} <span aria-hidden="true">↗</span>
                    </a>
                  </article>
                </div>
                <p className="or-setup-note">{copy.setup.note}</p>
              </section>
              <section className="or-section or-faq">
                <div>
                  <h2>{copy.faq.title}</h2>
                </div>
                <div>
                  {copy.faq.items.map((item) => (
                    <details key={item.title}>
                      <summary>{item.title}</summary>
                      <p>{item.description}</p>
                    </details>
                  ))}
                </div>
              </section>
            </div>
          </div>
          <section className="or-container or-closing">
            <h2>{copy.closing.title}</h2>
            <p>{copy.closing.description}</p>
            <div className="or-actions">
              <a className="or-button or-button-primary" href={SETUP_DOCS_URL}>
                {copy.closing.setup} <span aria-hidden="true">↗</span>
              </a>
              <a className="or-text-link" href={GITHUB_URL}>
                {copy.closing.star} <span aria-hidden="true">↗</span>
              </a>
            </div>
          </section>
        </main>
        <footer className="or-footer">
          <div className="or-container">
            <div className="or-footer-top">
              <div>
                <Link href="/" className="or-wordmark">
                  TakeChat<span aria-hidden="true">↗</span>
                </Link>
                <p>{copy.footer.description}</p>
              </div>
              <nav aria-label={copy.footer.navAria}>
                <a href={GITHUB_URL}>GitHub</a>
                <a href={SETUP_DOCS_URL}>{copy.footer.setup}</a>
                <Link href="/privacy">{copy.footer.privacy}</Link>
                <Link href="/terms">{copy.footer.terms}</Link>
                <Link href="/data-deletion">{copy.footer.dataDeletion}</Link>
              </nav>
            </div>
            <div className="or-footer-bottom">
              <span>TakeChat · marceloholcomercial@gmail.com</span>
            </div>
          </div>
        </footer>
      </div>
    </I18nProvider>
  );
}
