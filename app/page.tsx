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
const CONTACT_URL = "mailto:marceloholcomercial@gmail.com";
const LOGIN_URL = "/login";

const getLandingLocale = cache(async (): Promise<LandingLocale> => {
  const cookieStore = await cookies();
  return cookieStore.get(LOCALE_COOKIE)?.value === "en" ? "en" : "pt-BR";
});

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
  const locale = await getLandingLocale();
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
              <a href="#features">{copy.nav.setup}</a>
              <a href={CONTACT_URL}>{copy.nav.contact}</a>
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
                <a className="or-button or-button-primary" href={LOGIN_URL}>
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
                    <a className="or-text-link" href={LOGIN_URL}>
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
              <a className="or-button or-button-primary" href={LOGIN_URL}>
                {copy.closing.setup} <span aria-hidden="true">↗</span>
              </a>
              <a className="or-text-link" href={CONTACT_URL}>
                {copy.closing.contact} <span aria-hidden="true">↗</span>
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
                <a href={LOGIN_URL}>{copy.footer.setup}</a>
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
