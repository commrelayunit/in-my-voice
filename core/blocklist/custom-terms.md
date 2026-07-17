# Custom Terms Blocklist

Your own extensible list of flagged terms/patterns, applied globally across every voice profile, on top of `core/blocklist/ai-tells-baseline.md`. Git-tracked — these are just words, not sensitive data.

Same severity model as the baseline: **hard** (replaces evidence with an unsupported claim), **soft** (generic/over-polished but context-dependent), **style** (only suspicious if repeated or voice-mismatched).

Add entries as you notice patterns the baseline misses. One per line, in this format:

```text
- severity: hard | soft | style
  term: <exact phrase or short pattern description>
  reason: <why this is a giveaway for you specifically>
```

## Entries

(none yet — add your own below this line)
