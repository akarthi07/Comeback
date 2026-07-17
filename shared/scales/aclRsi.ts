/**
 * ACL-RSI — Anterior Cruciate Ligament Return to Sport after Injury scale.
 *
 * The validated 12-item scale (Webster, Feller & Lambros, 2008) measuring the
 * PSYCHOLOGICAL readiness to return to sport — the thing the research says
 * actually predicts return, and that physical ROM alone misses.
 *
 * Faithful to the source instrument:
 *  - 12 items across three subscales: emotions (5), confidence in performance
 *    (5), risk appraisal (2).
 *  - Each item answered 0–100 (here in 10-point steps for a phone UI).
 *  - Six negatively-worded items {2,3,6,7,9,10} are REVERSE-scored so that a
 *    higher adjusted score always means more psychological readiness.
 *  - Overall score = mean of the 12 adjusted item scores (0–100, higher =
 *    more ready). Subscale score = mean of that subscale's adjusted items.
 *
 * This module is PURE (no React / native) so it is unit-testable with synthetic
 * responses — same strategy as the measurement engine in shared/.
 */

export type Subscale = 'emotions' | 'confidence' | 'riskAppraisal';

export interface AclRsiItem {
  /** 1-based item number, matching the published instrument. */
  id: number;
  text: string;
  subscale: Subscale;
  /** Negatively worded → invert (100 - raw) so higher always = more ready. */
  reverse: boolean;
}

/**
 * The 12 items, verbatim wording, in the published order. Subscale grouping and
 * reverse-scoring follow the original Webster et al. instrument
 * (confidence {1,4,5,8,11}, emotions {3,6,7,9,12}, risk appraisal {2,10};
 * reverse {2,3,6,7,9,10}).
 */
export const ACL_RSI_ITEMS: readonly AclRsiItem[] = [
  { id: 1, subscale: 'confidence', reverse: false, text: 'Are you confident that you can perform at your previous level of sport participation?' },
  { id: 2, subscale: 'riskAppraisal', reverse: true, text: 'Do you think you are likely to re-injure your knee by participating in your sport?' },
  { id: 3, subscale: 'emotions', reverse: true, text: 'Are you nervous about playing your sport?' },
  { id: 4, subscale: 'confidence', reverse: false, text: 'Are you confident that your knee will not give way by playing your sport?' },
  { id: 5, subscale: 'confidence', reverse: false, text: 'Are you confident that you could play your sport without concern for your knee?' },
  { id: 6, subscale: 'emotions', reverse: true, text: 'Do you find it frustrating to have to consider your knee with respect to your sport?' },
  { id: 7, subscale: 'emotions', reverse: true, text: 'Are you fearful of re-injuring your knee by playing your sport?' },
  { id: 8, subscale: 'confidence', reverse: false, text: 'Are you confident about your knee holding up under pressure?' },
  { id: 9, subscale: 'emotions', reverse: true, text: 'Are you afraid of accidentally injuring your knee by playing your sport?' },
  { id: 10, subscale: 'riskAppraisal', reverse: true, text: 'Do thoughts of having to go through surgery and rehabilitation prevent you from playing your sport?' },
  { id: 11, subscale: 'confidence', reverse: false, text: 'Are you confident about your ability to perform well at your sport?' },
  { id: 12, subscale: 'emotions', reverse: false, text: 'Do you feel relaxed about playing your sport?' },
] as const;

export const ITEM_COUNT = ACL_RSI_ITEMS.length; // 12

/** Response steps for the phone UI: 0–100 in 10-point increments. */
export const RESPONSE_STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

/** Anchors shown at the ends of every item's scale (the VAS endpoints). */
export const SCALE_ANCHORS = { low: 'Not at all', high: 'Extremely' } as const;

export const SUBSCALE_LABELS: Record<Subscale, string> = {
  emotions: 'Emotions',
  confidence: 'Confidence',
  riskAppraisal: 'Risk appraisal',
};

/** One item's contribution after reverse-scoring, so higher = more ready. */
export function adjustedScore(item: AclRsiItem, raw: number): number {
  return item.reverse ? 100 - raw : raw;
}

export interface AclRsiScore {
  overall: number;
  emotions: number;
  confidence: number;
  riskAppraisal: number;
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/**
 * Score a completed check. `responses` is 12 raw answers (0–100) in item order
 * (index 0 = item 1). Returns overall + per-subscale means, each rounded 0–100.
 * Throws if the wrong number of responses is supplied — a partial check must not
 * be scored as if complete.
 */
export function scoreAclRsi(responses: number[]): AclRsiScore {
  if (responses.length !== ITEM_COUNT) {
    throw new Error(`ACL-RSI needs ${ITEM_COUNT} responses, got ${responses.length}`);
  }

  const adjusted = ACL_RSI_ITEMS.map((item, i) => adjustedScore(item, responses[i]));
  const bySubscale = (s: Subscale) =>
    adjusted.filter((_, i) => ACL_RSI_ITEMS[i].subscale === s);

  return {
    overall: Math.round(mean(adjusted)),
    emotions: Math.round(mean(bySubscale('emotions'))),
    confidence: Math.round(mean(bySubscale('confidence'))),
    riskAppraisal: Math.round(mean(bySubscale('riskAppraisal'))),
  };
}

/**
 * The trend is the point, not a single check. True once it's been at least
 * `days` since the most recent check (or if there are none yet).
 */
export function isCheckDue(lastCheckISO: string | undefined, days = 7, now = Date.now()): boolean {
  if (!lastCheckISO) return true;
  return now - Date.parse(lastCheckISO) >= days * 86_400_000;
}
