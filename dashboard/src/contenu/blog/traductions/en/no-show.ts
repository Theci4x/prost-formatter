import type { TraductionBillet } from "@/types/blog";

export const traduction: TraductionBillet = {
  slug: "no-shows-what-they-cost-and-what-actually-reduces-them",
  titre: "No-shows: what they cost, and what actually reduces them",
  resume:
    "Nobody knows their real rate, and the figures going round are worthless. The calculation to do on your own room, what French law says about card guarantees, and why the reminder text is not there to remind anyone.",
  essentiel: [
    "The rates going round — 10%, 14%, up to 50% — all come from commercial sources. The only one that counts is yours, and it takes a month to count.",
    "A no-show does not cost you the price of the meal: it costs you the margin, and the seat you did not give to someone else. On a 40-cover room the order of magnitude is €2,300 a month.",
    "A card guarantee is not a payment, and it is lawful — provided the amount is announced beforehand, you never store the card yourself, and you know whether you are taking arrhes or an acompte: French law does not treat them the same.",
    "The confirmation text is not there to remind. It is there to make cancelling easy: a table cancelled at 5 pm can be resold, a no-show at 8.30 pm cannot.",
  ],
  markdown: `
Ask ten restaurateurs their no-show rate. Ten will answer “a lot”. None will give you a figure.

That is the central problem, and it comes before all the others: you cannot treat what you do not measure. The rates going round — 10%, 14%, up to 30% or 50% depending on the place — all come from software vendors selling the solution to the problem they are quantifying. We found no public French study to rely on.

So let us start there.

## Measure, before treating

For a month, on every booking, one extra column with four values:

- **honoured**
- **cancelled in time** (early enough for the table to be taken back)
- **cancelled late**
- **no-show**

After a month you have your rate — and, more usefully, you have something else: **its distribution**.

::: exemple What you are going to find
No-shows are almost never uniform. They cluster:

- on **bookings made a long time ahead** — the longer the lead time, the more life has happened in between;
- on **groups**, where the decision to cancel belongs to nobody in particular;
- on **peak slots** — Friday and Saturday evening — which is precisely where a seat is worth most.

Those three facts, once established on your own numbers, change everything: they say where to put a guarantee, and above all where not to.
:::

## What it really costs

A no-show does not cost you the price of the meal. It costs you **the margin** on that meal — and the seat you did not give to someone else.

Take a 40-cover room, an average spend of €35, a food cost of 30%, and a 10% no-show rate on the evening service:

| | |
|---|---|
| Covers lost per service | 4 |
| Average spend incl. VAT | €35.00 |
| Excl. VAT (10% VAT) | €31.82 |
| Food cost (30%) | − €9.55 |
| **Margin per cover** | **€22.27** |
| **Loss per service** | **€89** |

::: chiffre ≈ €2,300 a month
€89 per service, six services a week: about €534 a week, that is **close to €2,300 a month** of margin that does not come in.

And that calculation is **optimistic**. It counts neither the food prepped for nothing, nor staff scheduled for a full room, nor the customers you turned away while the table waited.
:::

Redo it with your figures. The method for establishing a margin per cover is the same as for a dish:
[Set menu or à la carte: what your choice does to your margins](/blog/menu-ou-carte-restaurant-marges).

## Overbooking: a tool, not a solution

The temptation is immediate: if 10% do not come, take 10% more.

It works **in a room that turns**. A hundred-cover brasserie with two sittings and continuous flow absorbs four people too many: they wait ten minutes at the bar and that is that.

It does not work in a small room with a single sitting. Four people standing in a thirty-cover restaurant on a Saturday night is a ruined evening for them, needless pressure on the team, and an online review that will cost you more than the four covers.

**Overbooking is a turnover tool, not a filling tool.** If you do one sitting, forget it.

## The card guarantee: what French law actually says

This is the subject where the most nonsense is spoken, so let us take it in order.

**A card guarantee is not a payment.** It is an authorisation: the card is verified, an amount may be held, nothing is debited. If the customer comes, the hold is released and nothing happened. If they do not, you may debit the amount **announced in advance**.

**Announced in advance, and accepted.** That is the condition of validity. An amount appearing after the fact, or a penalty unrelated to the loss suffered, is a clause you will not be able to enforce.

::: attention Arrhes or acompte: French law does not treat them the same
Absent any statement to the contrary, **money paid in advance is arrhes** (a forfeitable deposit). And arrhes work both ways:

- the **customer** who backs out loses them;
- **you**, if you cancel, must **return double**.

An **acompte** (a down payment) firmly binds both parties: if a group of twenty cancels the day before, you are entitled to claim the agreed price.

The difference hangs on one word in your terms, and nobody knows it until they need it. Write it down in black and white, and write it down before you need it.
:::

**And above all: never store the card yourself.** The CNIL is clear — card data is not to be kept beyond the transaction, and the security code must never be kept after the first operation. A card number written in the reservations book, in a spreadsheet or in an email is a breach of the rules, doubled by a risk: your customers will pay for the leak, and you will answer for it.

The card must live with a payment provider, and you should never see anything but the last four digits.

## What the guarantee also costs

An honest article has to say it: **a card guarantee deters no-shows, and it also deters bookings.**

Some of your customers will give up rather than hand over their card to eat for two on a Tuesday. It is a trade-off, and it depends entirely on your situation:

- a house that is **full every night** can afford it: it trades a few bookings for a reliable room;
- a house **still building its clientele** cannot: it needs every booking, including the ones that will not turn up.

Hence the value of the measurement at the start: **target the guarantee where the no-shows cluster.** Groups above a certain size, peak slots, private hire. Asking two people for a card on a Tuesday evening costs you more bookings than it saves.

## The confirmation text is not there to remind

This is the most widespread misunderstanding. A message is sent so the customer “does not forget”. But the customer who does not come has almost never forgotten: they changed their mind, they are stuck, something came up — and they do not dare ring during service.

**The message is not there to remind. It is there to make cancelling easy.**

A table cancelled at 5 pm can be resold. A no-show at 8.30 pm cannot. Anything that turns the second into the first earns you money.

Three practical consequences:

- **Timing.** Too early and the message is forgotten. Too late and the cancellation is no use to you. The morning of the day, or the evening before, leaves time to take the table back.
- **Wording.** “See you tonight!” invites no answer. “Confirm or cancel” invites one. Ask a question and you get an answer; make a statement and you get nothing.
- **A tap, not a phone call.** If cancelling means telephoning in the middle of the rush, nobody cancels — not turning up is simpler. A link, a button, two seconds.

## What to check yourself

- **Your rate and its distribution**, over a month of your own bookings. Everything else follows from it.
- **How your terms are drafted**: arrhes or acompte, amount, cancellation window. Have them read once rather than copying a template found online.
- **Where card data lives** with your provider, and what you get to see of it.
- **Your commercial situation** before imposing a guarantee: it is paid for in lost bookings, and that price is not the same for everyone.
`,
};
