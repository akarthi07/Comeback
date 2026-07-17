import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ACL_RSI_ITEMS,
  ITEM_COUNT,
  scoreAclRsi,
  adjustedScore,
  isCheckDue,
} from './aclRsi.ts';

// Run with:  npm test

test('has 12 items split 5 confidence / 5 emotions / 2 risk appraisal', () => {
  assert.equal(ITEM_COUNT, 12);
  const count = (s: string) => ACL_RSI_ITEMS.filter((i) => i.subscale === s).length;
  assert.equal(count('confidence'), 5);
  assert.equal(count('emotions'), 5);
  assert.equal(count('riskAppraisal'), 2);
});

test('exactly items 2,3,6,7,9,10 are reverse-scored', () => {
  const reversed = ACL_RSI_ITEMS.filter((i) => i.reverse).map((i) => i.id);
  assert.deepEqual(reversed, [2, 3, 6, 7, 9, 10]);
});

test('reverse-scoring inverts negatively-worded items so higher = more ready', () => {
  const item2 = ACL_RSI_ITEMS[1]; // "likely to re-injure" — reverse
  const item1 = ACL_RSI_ITEMS[0]; // "confident..." — normal
  // Answering "extremely likely to re-injure" (100) is a POOR outcome → 0.
  assert.equal(adjustedScore(item2, 100), 0);
  assert.equal(adjustedScore(item2, 0), 100);
  // A normal item passes through unchanged.
  assert.equal(adjustedScore(item1, 100), 100);
});

test('all-ready answers score 100 overall and on every subscale', () => {
  // "Fully confident/relaxed" = 100 on positive items, 0 on negative items.
  const responses = ACL_RSI_ITEMS.map((i) => (i.reverse ? 0 : 100));
  const s = scoreAclRsi(responses);
  assert.equal(s.overall, 100);
  assert.equal(s.emotions, 100);
  assert.equal(s.confidence, 100);
  assert.equal(s.riskAppraisal, 100);
});

test('worst-case answers score 0 everywhere', () => {
  const responses = ACL_RSI_ITEMS.map((i) => (i.reverse ? 100 : 0));
  const s = scoreAclRsi(responses);
  assert.equal(s.overall, 0);
  assert.equal(s.riskAppraisal, 0);
});

test('a uniform mid response yields 50 across the board', () => {
  const s = scoreAclRsi(new Array(12).fill(50));
  assert.equal(s.overall, 50);
  assert.equal(s.emotions, 50);
  assert.equal(s.confidence, 50);
  assert.equal(s.riskAppraisal, 50);
});

test('subscales are computed independently', () => {
  // Confident but still fearful: max the confidence items, worst the emotions.
  const responses = ACL_RSI_ITEMS.map((i) => {
    if (i.subscale === 'confidence') return 100; // normal items
    if (i.subscale === 'emotions') return i.reverse ? 100 : 0; // worst
    return i.reverse ? 100 : 0; // risk: worst
  });
  const s = scoreAclRsi(responses);
  assert.equal(s.confidence, 100);
  assert.equal(s.emotions, 0);
  assert.equal(s.riskAppraisal, 0);
});

test('scoring rejects an incomplete check', () => {
  assert.throws(() => scoreAclRsi([10, 20, 30]));
});

test('isCheckDue: due when never checked, or after the cadence window', () => {
  const now = Date.parse('2026-07-15T00:00:00Z');
  assert.equal(isCheckDue(undefined, 7, now), true);
  assert.equal(isCheckDue('2026-07-14T00:00:00Z', 7, now), false); // 1 day ago
  assert.equal(isCheckDue('2026-07-01T00:00:00Z', 7, now), true); // 14 days ago
});
