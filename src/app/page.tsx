import BadgeMaker from "@/components/BadgeMaker";
import ComingSoon from "@/components/ComingSoon";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import { Skyline } from "@/components/Kochi";
import Nav from "@/components/Nav";
import Speakers from "@/components/Speakers";
import Venue from "@/components/Venue";
import { event, seoDescription, siteUrl } from "@/content/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: `DevFest Kochi ${event.start.slice(0, 4)}`,
  description: seoDescription,
  startDate: event.start,
  endDate: event.end,
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  image: [`${siteUrl}/og.png`],
  url: `${siteUrl}/`,
  location: {
    "@type": "Place",
    name: `${event.place.split(",")[0]} (${event.venue})`,
    address: {
      "@type": "PostalAddress",
      streetAddress: event.venueArea.replace(/,?\s*Kochi\s*\d{6}$/, ""),
      addressLocality: "Kochi",
      addressRegion: "Kerala",
      postalCode: event.venueArea.match(/\d{6}/)?.[0],
      addressCountry: "IN",
    },
  },
  organizer: { "@type": "Organization", name: event.host, url: event.communityUrl, email: event.email },
  offers: { "@type": "Offer", url: event.ticketsUrl, availability: "https://schema.org/InStock" },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Nav />
      <main id="main">
        <Hero />
        <Intro />
        <ComingSoon />
        <Speakers />
        <BadgeMaker />
        <Venue />
        <Faq />
      </main>
      <Skyline />
      <Footer />
    </>
  );
}
