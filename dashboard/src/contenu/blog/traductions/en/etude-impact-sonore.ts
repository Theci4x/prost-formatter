import type { TraductionBillet } from "@/types/blog";

export const traduction: TraductionBillet = {
  slug: "noise-impact-study-who-is-actually-concerned",
  titre: "Noise impact study: who is actually concerned",
  resume:
    "No, a speaker in the ceiling is not enough to bring you within scope. But a DJ on Friday night is — and the study has to come before the soundproofing work, not after it.",
  essentiel: [
    "The study is not imposed on “any place that plays music”: two conditions must be met together — on a habitual basis AND above the equal-energy rule based on 80 dB(A) over 8 hours.",
    "Background music during service is out of scope; a Friday DJ, a rooftop with a real sound system, a music bar are not.",
    "The threshold is lower than it looks: it is a dose, not a volume. 86 dB(A) for two hours already exceeds it.",
    "It has to come before the soundproofing work — it is what decides that work.",
  ],
  markdown: `
You read everywhere that “any establishment that plays music” must carry out a noise impact study. That is not true, and the approximation does two kinds of damage: it makes people who do not need one spend money, and it makes the people who should care shrug.

The rule is precise. It comes down to two conditions, and you need both.

## The two conditions

Decree no. 2017-1244 of 7 August 2017 applies to places open to or receiving the public, enclosed or open, hosting activities that involve amplified sound:

1. **on a habitual basis** — festivals aside, a one-off event is out of scope;
2. **at high sound levels**, defined by the equal-energy rule based on **80 dB(A) equivalent over 8 hours**.

A restaurant playing background music during service, at a volume that still lets tables talk to each other, does not reach that level: it is not concerned. A music bar, a restaurant that books a DJ on Friday, a rooftop with a real sound system, a room that hosts gigs: concerned.

::: chiffre 80 dB(A) over 8 hours
This is not a volume, it is a **dose**. The equal-energy rule says that doubling the sound energy halves the permitted duration: 83 dB(A) for 4 hours, 86 for 2 hours, 89 for one hour — same dose, same breach.
:::

And 86 dB(A) is not a concert. It is a full, lively room with music over the top, on a Friday at 10 pm. Plenty of places that believe themselves out of scope are in it. And the only way to know is not to argue about it: it is to measure.

## What the study is

The noise impact study — EINS to acousticians — has two parts:

- **the acoustic study** proper: what your installation produces in its various configurations, and what reaches the neighbours;
- **the measures you put in place** to stay compliant: insulation, speaker placement and orientation, level capping, an acoustic pressure limiter.

It takes account of neighbouring activities that also play amplified sound — your neighbour is not only someone you disturb, sometimes they are feeding the same background. And it must be kept available for inspectors: there is no office to send it to, there is a document you have to be able to produce.

## The timing trap

This is the point that costs the most, and it has nothing to do with law.

::: attention The order matters more than the text
The study exists to **decide** the soundproofing work: where to insulate, with what, how far. Doing it after the work means finding out you have to take down a ceiling you have just paid for, or reopen a finished partition.
:::

So it belongs at the design stage, with the architect, when the plan exists and nothing has been installed yet. An acoustician consulted at that point costs a fraction of what the same acoustician costs after the first complaint.

Same logic as for the surveys: what you do beforehand is an expense, what you do afterwards is rework.
→ [The surveys to do before touching the walls](/blog/diagnostics-avant-travaux-restaurant)

## The limiter, and what you are risking

When the study concludes that insulation is not enough, it prescribes an **acoustic pressure limiter**: a box between the desk and the amplifiers, set and then sealed, which caps the level.

Not installing it when the study prescribes it, or interfering with it — the famous setting that creeps back up on a Saturday night — is a **5th-class** offence: up to €1,500, €3,000 for a repeat, with possible confiscation of the sound equipment.

The real risk, though, is not the fine. It is the administrative closure order, which comes after the complaints, and which is not negotiable.

## The three sets of rules people confuse

Three texts deal with noise in your establishment, and they protect three different people. They get mixed up constantly.

**Your customers' ears.** Article R1336-1 of the public health code forbids exceeding, anywhere accessible to the public, 102 dB(A) and 118 dB(C) over 15 minutes. Add to that making ear protection available and providing periods or areas of auditory rest. Continuous recording and display of levels, on the other hand, only applies to nightclubs whatever their capacity and to venues above 300 people: a restaurant almost always escapes it.

**Your neighbours' ears.** This is the logic of emergence: what counts is not your level, but the difference you make against the ambient noise measured without you. The order of magnitude is 5 dB(A) by day and 3 dB(A) between 10 pm and 7 am, with corrective terms for duration, and tighter values per octave band. What to remember above all: **it is the bass that catches you out.** A neighbour almost never complains about volume — they complain about the bass coming through the wall, and bass is not stopped by a curtain.

**Your staff's ears.** The labour code has its own daily exposure thresholds: 80 dB(A) triggers information and making protection available, 85 dB(A) requires a noise reduction programme, 87 dB(A) must never be exceeded. Your customers spend two hours in the room; your team spends eight. It is not the same calculation, and it is the one that gets forgotten.

## What to check yourself

- **Your actual level is measured.** Any discussion about “are we concerned” without a sound level meter is an empty discussion.
- **The departmental public health bylaw** and prefectoral or municipal orders can be stricter, particularly on hours and on terraces.
- **Terraces and rooftops** fall under the same text: “open air” does not mean out of scope.

And if you are putting together a building-works file, bring the acoustician in at the same time as the architect. It is the only moment when their opinion costs almost nothing.
`,
};
