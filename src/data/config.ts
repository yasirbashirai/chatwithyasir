// Central config for the studio chat. The booking + contact routes that connect
// this chat to Yasir's wider presence. Change these in ONE place.

/** Cal.com 30-min call (same link used on yasirbashir.com). */
export const CAL_URL = "https://cal.com/yasir-bashir-bp4wob/30min";

/** Where onboarding / project-form emails are sent. */
export const CONTACT_EMAIL = "hello@yasirbashir.com";

/** The main services website. */
export const MAIN_SITE = "https://yasirbashir.com";
export const MAIN_SITE_PORTFOLIO = "https://yasirbashir.com/portfolio";

/** Yasir's WhatsApp — used for the instant "call" button (opens WhatsApp). */
export const WHATSAPP_NUMBER = "923446012505";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi Yasir 👋 I'd like to hop on a quick call.",
)}`;
