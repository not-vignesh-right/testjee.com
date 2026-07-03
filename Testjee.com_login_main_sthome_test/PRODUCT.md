# Product

## Register

product

## Users
Coaching institutes and colleges of varying scale — from small JEE-prep coaching centers running live exams for around 30 students, up to large colleges conducting proctored exams for much bigger cohorts. The person using this admin panel is institute staff (owner, coordinator, or teacher) responsible for scheduling a live exam, distributing credentials, monitoring it while it runs, and reviewing results afterward. They are not necessarily technical, and during a live exam window they are under real time pressure — a live cohort of students is actively taking a proctored exam, and the admin needs a fast, unambiguous read of what's happening (who's submitted, who's stuck, who needs a resume request approved).

## Product Purpose
TestJEE's admin panel lets an institute schedule, run, and grade synchronized live mock exams (JEE Main, NEET UG, KCET variants) for a batch of students using temporary credentials — separate from the platform's self-serve student practice mode. Success looks like: an admin can schedule an exam in under a minute, hand out credentials confidently, watch a live session with an instant read of progress, and resolve a student's "my browser crashed" appeal without breaking flow. It has to work identically whether the batch is 30 students or several hundred.

## Brand Personality
Precise and calm — quiet confidence, not decoration. High information density delivered cleanly, in the register of Linear or the Stripe dashboard: nothing is loud, everything is legible at a glance, and the UI never competes with the fact that real students are mid-exam on the other end of this screen. Trustworthy over playful — this is exam infrastructure, not a consumer app.

## Anti-references
- The generic "Tailwind default" look: white cards on a gray canvas, every section boxed into its own bordered/shadowed card, identical stat-card grids, plain HTML `<select>` dropdowns, tiny all-caps tracked labels above every section.
- Nested cards (a card inside a card).
- Anything that reads as playful/consumer-SaaS — bouncy motion, gradient accents, decorative illustration. This is closer to mission control than a marketing site.

## Design Principles
1. **Calm under load** — the busiest screen (live monitor) is used while real students are actively testing; legibility and instant comprehension beat visual flourish every time.
2. **Scale-agnostic** — every layout must read the same whether there are 5 rows or 500; nothing that only works for a "demo-sized" dataset.
3. **Whitespace and typography over borders** — structure comes from hierarchy and spacing, not boxes around boxes.
4. **Motion with purpose, not decoration** — transitions confirm state changes (a student just submitted, a session just went live); they don't perform.
5. **One confident action per screen** — busy operators need the obvious next action to be obvious; don't make every button compete for attention equally.

## Accessibility & Inclusion
Standard WCAG 2.1 AA hygiene: ≥4.5:1 body text contrast, ≥3:1 for large text, visible focus states, full keyboard operability, `prefers-reduced-motion` respected throughout. No additional specific requirements known.
