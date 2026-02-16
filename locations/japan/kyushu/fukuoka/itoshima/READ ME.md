Johren – Itoshima Beta (What Ships)
Scope (Very Tight)

This is not all of Itoshima.

Beta covers only:

Route 202 spine

Coastal strip reachable from 202

No full mountain access

No Karatsu interior yet

If it feels slightly incomplete — good. That’s intentional.

The Invisible Spine

Route 202 is always visible.
Everything else is conditional.

Internally:

202 = lowest resistance

All relevance calculations radiate outward from it

User never sees “Route 202 logic.”
They just feel that the map makes sense.

Entry Point Behavior (Tsutaya Logic)

Tsutaya Itoshima acts as a pause amplifier, not a hub.

What happens here:

Coast outlines become faintly contextual

No pins yet

No photos yet

Just enough to suggest: “there’s more that way”

If someone never slows down near Tsutaya:

Coast stays mostly latent

App remains boring (correct behavior)

Coastal Reveal (Core Beta Experience)
Trigger Profile

Any of the following:

<150 m from coast

walking speed

dwell ≥ 2 minutes

slight route deviation from 202

What appears

Coastal areas fade in

A few quiet pins (cafés, viewpoints)

One atmospheric photo per zone (max)

What does NOT appear

“Top spots”

Density

Anything inland or mountainous

Result:
Users feel the coast is obvious, not promoted.

Deeper Coast (Soft Depth, No Rewards)
Trigger Profile

linger ≥ 7 minutes

OR revisit same coastal pocket on another day

OR >30% route deviation

What changes

Additional small coastal pins

Microcopy like:

“People tend to linger”

“Less foot traffic”

Still no sense of “progress.”
Just… texture.

Mountains: Intentionally Incomplete
Nana-yama / Mitsuse Direction

Nanayama
Mitsuse

In beta:

routes appear only as faint lines

no pins

no photos

microcopy (if any):

“Less direct”

“Usually reached by car”

Most users won’t even notice these yet.

That’s perfect.

Karatsu Side: Not in Beta (On Purpose)

Even if:

user drives that way

GPS clearly enters Saga

Johren:

does not suddenly light up

does not fill in detail

At most:

faint area name

sparse, neutral presence

This avoids the “oh, it’s just Google Maps” moment.

What a Beta User Experiences (Narrative Test)

“I opened it near 202 — okay, simple.
I stopped near Tsutaya, then drove toward the coast.
Stuff quietly appeared.
I didn’t feel led, but I ended up somewhere calm.
Later I noticed routes going inland… but I didn’t go yet.”

That’s a successful beta.

If instead they say:

“It told me where to go”

— beta failed.

What You Measure (Internally Only)

You do not measure:

taps

pins clicked

photos opened

You do measure:

dwell time distribution

repeated coastal revisits

whether people stop before busy hotspots

whether movement spreads laterally instead of clustering

These metrics tell you if traffic is diffusing.

Beta Success Criteria (Hard)

Itoshima Beta is successful if:

most users never see the whole map

people describe it as “calm” or “oddly helpful”

merchants don’t ask to be featured

nobody asks “how do I unlock the rest?”

If someone asks that last question — language leaked.

Why This Is the Right Beta

Small geography

Natural spine (202)

Clear coast-before-mountain logic

Fragile inland areas protected

Easy to replicate elsewhere

Once this feels right, applying it to:

Yanagawa

Isahaya

rural Oita
is mostly data work, not design.

If you want next, we can:

write the Itoshima beta README for devs

define exact numeric defaults you’ll ship with

simulate 3 beta personas (local, slow visitor, fast tourist)

But conceptually — this beta is clean, disciplined, and very hard to misuse.

All of the above...

Perfect. Then here it is — all three, cleanly separated so you can drop them straight into a repo, a Notion page, or a briefing doc without re-explaining yourself later.

No fluff. No “vision speak.” This is operational.

Johren — Itoshima Beta

Internal README (v0.1)

Purpose

Johren Itoshima Beta tests movement-based visibility in a geographically intuitive area, using Route 202 as the natural spine.

The beta validates:

diffusion of traffic toward quieter coastal areas

delayed, protected exposure of inland / mountain routes

zero reliance on QR codes, check-ins, or explicit interaction

Johren does not recommend places.
It reflects relevance based on presence, time, and movement.

Non-Negotiables

No gamification language (internal or external)

No explicit user actions required

No onboarding beyond a single explanatory paragraph

No merchant controls over visibility

Location + time only (no QR, no taps)

If a feature requires explanation, it does not ship.

Geographic Scope (Hard Limit)

Included

Route 202

Coastal areas reachable directly from 202

Contextual Only

Mountain routes toward Nana-yama / Mitsuse

Excluded

Karatsu interior

Saga-side detail

Visibility States

Each map element exists in one of four states:

LATENT → CONTEXTUAL → VISIBLE → BACKGROUND


State transitions are driven only by movement heuristics.

Numeric Defaults (Ship These)

These are conservative. You can loosen later.

Distance Bands
Band	Distance
Far	> 500 m
Near	150–500 m
Proximate	30–150 m
Present	< 30 m

Only Proximate and Present affect relevance.

Speed Bands (km/h)
Speed	Interpretation
0–1	stopped / lingering
1–6	walking
6–15	cycling
15–60	driving
> 60	transit (ignore)

Transit speed suppresses relevance entirely.

Dwell Time Thresholds
Time	Meaning
< 30 sec	pass-through
30 sec – 2 min	awareness
2 – 7 min	interest
> 7 min	familiarity

Only interest and familiarity advance state.

Revisit Rules
Pattern	Effect
Same area twice (same day)	+0.15 relevance
Same area on different days	+0.30 relevance
Same route repeated	route normalization

Mountain routes require revisits across days.

Route Deviation
(deviation %) = (actual travel time – shortest travel time) / shortest travel time

Deviation	Interpretation
< 10%	efficient
10–30%	casual
> 30%	intentional

Only intentional deviation reveals deeper areas.

Area Resistance (Itoshima)
Area	Resistance
Route 202	0.10
Coastal strip	0.20
Deeper coast	0.35
Mountain routes	0.60
Nana-yama	0.75
Mitsuse	0.80
if relevance_score > resistance → state may advance

Relevance Formula (Initial)
relevance =
  0.30 * proximity +
  0.30 * dwell +
  0.25 * revisit +
  0.15 * deviation


No ML. Deterministic. Explainable.

Persona Simulation (Sanity Check)
1. Local (Routine Driver)

Drives Route 202 regularly

Stops briefly, predictable routes

Rarely deviates

Outcome

202 always visible

Coast appears lightly

Deeper coast sometimes

Mountains remain latent

Correct behavior: Johren stays boring.

2. Slow Visitor (Ideal User)

Walks coastal areas

Stops, lingers

Revisits over days

Outcome

Coast becomes richly visible

Quiet cafés and viewpoints appear

Mountain routes faintly contextual

Correct behavior: feels natural, unforced.

3. Instagram Tourist (Fast, Goal-Driven)

Drives fast

Minimal stops

Direct routes

Outcome

Map stays sparse

No deep reveals

No inland exposure

Correct behavior: fragile areas protected.

Beta Success Criteria

The beta is successful if:

Users never see the “whole map”

Nobody asks “how do I unlock more?”

Traffic spreads laterally, not clusters

Merchants do not request promotion

Users describe Johren as “quiet” or “oddly helpful”

Failure signals:

Users plan routes before moving

Users talk about “features”

Requests for QR codes or badges

Internal Prime Directive (Put This at the Top of the Repo)

Johren reflects relevance.
It never explains, celebrates, or rewards it.
