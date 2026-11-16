# CalConnect Mockup

Clickable, phone-sized mockup of **CalConnect**, a UC Berkeley class project (UGBA 177).

## What CalConnect is

An AI app that matches new students into small groups of 4–5 in their first weeks, then keeps recommending hangouts and activities, both social (e.g. a hike) and professional (e.g. a JP Morgan info session), with group discounts. Matching keeps going, so students can always meet new people. The AI learns from how students rate events and matches.

## Screens to mock up

1. **Onboarding**: a 10-question quiz inside the CalCentral checklist. One tap skips it.
2. **Your group**: 4–5 matched students, plus "why you were matched".
3. **Group chat**: the AI posts the intro and answers `@AI` requests. Every AI message is clearly labeled as AI.
4. **Activity ideas**: 2–3 suggestions, a group vote, and booking with a cost split that each student approves. Sponsored items are labeled.
5. **Rating**: one-tap rating after a meetup, plus a private "would meet again?" question.

## Design principles

- **The AI recommends, students decide.** Nothing gets booked, paid or joined without each student's approval.
- **No protected traits.** Never match or explain matches using race, religion, gender, sexuality, disability, nationality, etc.
- **Success = hours spent together, not time in the app.** No engagement-bait patterns (streaks, infinite feeds, guilt notifications).
- AI content and sponsored content are always visibly labeled.
- "Would meet again?" answers are private and never shown to other students.

## Tech constraints

- Plain HTML, CSS and JavaScript. No frameworks, no build step, no npm. It must run as-is on GitHub Pages.
- Use relative paths so it works from a GitHub Pages subpath.
- Phone-sized layout (around 390×844), centered on desktop.
- **Fake sample data only.** No real student names, emails or IDs.
- Colors: Berkeley Blue `#002676` and California Gold `#FDB515`.
- **No official university logos** or seals. Use text or neutral icons instead.
