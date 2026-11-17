# CalConnect Mockup

Clickable, phone-sized mockup of **CalConnect**, a UC Berkeley class project (UGBA 177).

## What CalConnect is

An AI app that matches new students into small groups of 4–5 in their first weeks, then keeps recommending hangouts and activities, both social (e.g. a hike) and professional (e.g. a JP Morgan info session), with group discounts. Matching keeps going, so students can always meet new people. The AI learns from how students rate events and matches.

## Three ways to connect

Students choose any combination during onboarding and can change it later:

- **Fun group** (default): 4–5 students for social hangouts. They can also go to professional events together.
- **Professional circle** (opt-in): a separate, slightly larger networking group chat (about 6–10 students with shared career interests) for info sessions, workshops and coffee chats.
- **Mentor** (opt-in): a 1:1 match with an upper-year student or alum (fake). The mentor accepts each coffee-chat request.

## Discounts drive meetups

Discounts are the main reason to open the app, and they reward meeting in person:
- The discount grows with how many group members come (e.g. 3+ people = 10%, the whole group = 20%).
- A discount unlocks when the group checks in together at the venue.
- The app shows "hours together" and "money saved", never time spent in the app.

## Screens to mock up

1. **Onboarding**: a 10-question quiz inside the CalCentral checklist. One tap skips it. The last step chooses fun group / professional circle / mentor.
2. **Home**: the next meetup, hours together and money saved, and cards for each of the student's groups. No feed.
3. **Your group**: 4–5 matched students (or the professional circle), plus "why you were matched".
4. **Group chat**: the AI posts the intro and answers `@AI` requests. Every AI message is clearly labeled as AI.
5. **Activity ideas**: 2–3 suggestions with the group discount shown, a group vote, and booking with a cost split that each student approves. Sponsored items are labeled.
6. **Mentor**: the mentor's profile, why you were matched, and a "request a coffee chat" button.
7. **Rating**: one-tap rating after a meetup, plus a private "would meet again?" question.

## Design principles

- **The AI recommends, students decide.** Nothing gets booked, paid or joined without each student's approval.
- **No protected traits.** Never match or explain matches using race, religion, gender, sexuality, disability, nationality, etc.
- **Success = hours spent together, not time in the app.** No engagement-bait patterns (streaks, infinite feeds, guilt notifications). Every screen should move students toward a real meetup in a few taps.
- AI content and sponsored content are always visibly labeled.
- "Would meet again?" answers are private and never shown to other students.

## Tech constraints

- Plain HTML, CSS and JavaScript. No frameworks, no build step, no npm. It must run as-is on GitHub Pages.
- Use relative paths so it works from a GitHub Pages subpath.
- Phone-sized layout (around 390×844), centered on desktop.
- **Fake sample data only.** No real student names, emails or IDs.
- Every activity and event takes place at a real Berkeley or Bay Area location (e.g. Tilden Park, Telegraph Ave, Haas, San Francisco). Prices and times are made up.
- Colors: Berkeley Blue `#002676` and California Gold `#FDB515`.
- **No official university logos** or seals. Use text or neutral icons instead.
