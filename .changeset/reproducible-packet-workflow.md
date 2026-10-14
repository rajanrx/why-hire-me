---
"why-hire-me": minor
---

Make the reviewed-packet portfolio workflow reproducible for anyone: approved interview answers apply
through an idempotent `packet-amendments` file (`amend-reviewed-packet.mjs`) that also keeps renamed
records in step across derived text; `approve-candidate.mjs` applies an approved candidate with
relative paths; `print-resume.mjs` renders a print-ready résumé from the portfolio's reviewed data and
prints it with a local Chrome; `verify-hosted.mjs` checks a hosted copy byte-for-byte. The preview
builds a first portfolio without a baseline, resolves assets relative to the packet, and treats a
re-run of the same build as unchanged; the NotebookLM handoff is likewise re-runnable. A fictional
sample packet and a CI test run the whole sequence twice and pin its digest. The README opens with a
three-skill getting-started path and copyable prompts.
