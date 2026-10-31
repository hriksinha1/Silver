/**
 * Store policies — edit the `paragraphs` once each policy is finalised.
 * Nothing here is a business commitment until you replace the pending text.
 */
export type PolicyId = 'shipping' | 'returns' | 'privacy' | 'terms';

export interface Policy {
  id: PolicyId;
  title: string;
  /** Empty array = "not yet published" notice is shown. */
  paragraphs: string[];
  /** Shown when `paragraphs` is empty. */
  pendingNote: string;
}

export const POLICIES: Record<PolicyId, Policy> = {
  shipping: {
    id: 'shipping',
    title: 'Shipping Policy',
    paragraphs: [],
    pendingNote:
      'Silveram’s shipping policy has not been published yet. Please ask us on WhatsApp for delivery timelines and charges for your location before ordering.',
  },
  returns: {
    id: 'returns',
    title: 'Return & Exchange Policy',
    paragraphs: [],
    pendingNote:
      'Silveram’s return and exchange policy has not been published yet. Please confirm the terms with us on WhatsApp before ordering.',
  },
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    paragraphs: [
      'Your bag is stored only in this browser. It is not sent to Silveram unless you choose to share it.',
      'When you use a WhatsApp button, the message you send, together with your WhatsApp number, is shared with Silveram through WhatsApp.',
    ],
    pendingNote: '',
  },
  terms: {
    id: 'terms',
    title: 'Terms & Conditions',
    paragraphs: [],
    pendingNote:
      'Silveram’s terms and conditions have not been published yet. An enquiry sent on WhatsApp is not an order; an order is only confirmed when Silveram confirms it with you.',
  },
};
