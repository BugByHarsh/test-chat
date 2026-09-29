import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://www.guluguluchat.in";

const PAGE_SEO = {
  "/": {
    title: "Gulugulu — Anonymous Random Chat | Text, Voice & Video",
    description:
      "Meet someone new on Gulugulu with anonymous random chat by text, voice, or video. No signup or profile required. 18+ only.",
    robots: "index,follow",
  },
  "/terms": {
    title: "Terms of Use | Gulugulu",
    description: "Read the Gulugulu terms of use for anonymous text, voice, and video conversations.",
    robots: "index,follow",
  },
  "/privacy": {
    title: "Privacy | Gulugulu",
    description: "Learn what information Gulugulu processes and how temporary conversations and reports are handled.",
    robots: "index,follow",
  },
  "/safety": {
    title: "Safety Rules | Gulugulu",
    description: "Read the Gulugulu safety rules for respectful anonymous conversations and learn how to report rule-breaking.",
    robots: "index,follow",
  },
  "/gate": {
    title: "Start a Chat | Gulugulu",
    description: "Choose text, voice, or video and start an anonymous conversation on Gulugulu.",
    robots: "noindex,nofollow",
  },
  "/chat": {
    title: "Chat | Gulugulu",
    description: "Anonymous text, voice, and video conversations on Gulugulu.",
    robots: "noindex,nofollow",
  },
};

function setMeta(name, content) {
  let element = document.head.querySelector('meta[name="' + name + '"]');
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setProperty(property, content) {
  let element = document.head.querySelector('meta[property="' + property + '"]');
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setCanonical(url) {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", url);
}

export default function Seo() {
  const { pathname } = useLocation();
  const page = PAGE_SEO[pathname] || PAGE_SEO["/"];

  useEffect(() => {
    const canonicalUrl = SITE_URL + (pathname === "/" ? "/" : pathname);

    document.title = page.title;
    setMeta("description", page.description);
    setMeta("robots", page.robots);
    setProperty("og:type", "website");
    setProperty("og:site_name", "Gulugulu");
    setProperty("og:title", page.title);
    setProperty("og:description", page.description);
    setProperty("og:url", canonicalUrl);
    setProperty("twitter:card", "summary");
    setProperty("twitter:title", page.title);
    setProperty("twitter:description", page.description);
    setCanonical(canonicalUrl);

    const existingSchema = document.head.querySelector("#gulugulu-structured-data");
    if (existingSchema) existingSchema.remove();

    if (pathname === "/") {
      const script = document.createElement("script");
      script.id = "gulugulu-structured-data";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": SITE_URL + "/#organization",
            name: "Gulugulu",
            url: SITE_URL,
          },
          {
            "@type": "WebSite",
            "@id": SITE_URL + "/#website",
            name: "Gulugulu",
            url: SITE_URL,
            description: page.description,
            publisher: { "@id": SITE_URL + "/#organization" },
          },
        ],
      });
      document.head.appendChild(script);
    }
  }, [page, pathname]);

  return null;
}
