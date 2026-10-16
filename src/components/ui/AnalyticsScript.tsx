import Script from "next/script";
import { site } from "@/config/site";
import { analyticsProvider } from "@/lib/analytics";
import { isSet, text } from "@/lib/placeholder";

/** Loads Plausible or PostHog once site.analytics is configured. Renders nothing until then. */
export function AnalyticsScript() {
  if (!analyticsProvider || !isSet(site.analytics.key)) return null;
  const key = site.analytics.key;

  if (analyticsProvider === "plausible") {
    // For Plausible, `key` is the site domain registered in Plausible.
    return (
      <>
        <Script id="plausible-queue" strategy="afterInteractive">
          {`window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}`}
        </Script>
        <Script defer data-domain={key} src="https://plausible.io/js/script.js" strategy="afterInteractive" />
      </>
    );
  }

  if (analyticsProvider === "posthog") {
    return (
      <Script id="posthog" strategy="afterInteractive">
        {`!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);posthog.init(${JSON.stringify(
          key,
        )},{api_host:"https://us.i.posthog.com",person_profiles:"identified_only"});`}
      </Script>
    );
  }

  if (process.env.NODE_ENV !== "production") console.warn(`Unknown analytics provider: ${text(site.analytics.provider)}`);
  return null;
}
