import type { TraductionBillet } from "@/types/blog";

export const traduction: TraductionBillet = {
  slug: "your-google-listing-line-by-line",
  titre: "Your Google listing, line by line",
  resume:
    "Three fields filled in ten minutes are worth as much as your rating. Fifteen photos are worth more than everything else. Here is the scorecard we use to grade a listing, published as it stands, points and all.",
  essentiel: [
    "Phone, website and opening hours are worth 45 points out of 100. Three fields, ten minutes, and nobody fills in all three.",
    "Photos are worth 25 points and cost nothing. Best effort-to-result ratio on the whole listing, and the most often neglected.",
    "On reviews, freshness counts: the share of your reviews less than six months old is worth a fifth of that pillar's score.",
    "This scorecard is ours, not Google's. Nobody knows Google's. But what it measures is what a customer looks at before walking in.",
  ],
  markdown: `
**Let us say it up front: we are not neutral.** Klarr sells a tool that grades Google listings. And the scorecard below is **ours** — not Google's.

Nobody knows Google's algorithm, and anyone who claims otherwise is selling hot air. What we publish here is our way of counting, drawn from local-search practice. Its only justification: it measures what a customer looks at before walking through your door. We publish it with its points so that you can argue with it.

## What is at stake on a listing

A customer looking for somewhere to eat does not go to your website. They see a panel on the right of their screen, or a pin on a map, and they decide in about ten seconds: is it open, is it any good, does it look like what I want tonight.

The whole article rests on that idea: **your listing is not a directory entry, it is your shopfront.** And a half-dressed shopfront turns people away before they read the menu.

## The listing, line by line

Here is what we count, out of a hundred.

| What we look at | Points |
|---|---|
| A phone number | 15 |
| A declared website | 15 |
| Opening hours filled in | 15 |
| Photos (up to fifteen) | 25 |
| The rating shown | 15 |
| The number of reviews | 15 |

**Phone, website and hours: 45 points for ten minutes' work.** It is the most frequent finding in our audits, and the most frustrating. Three fields to fill in once and for all, and one of the three is almost always missing. No opening hours means a customer who will not risk the journey. No website means the whole third section below scores zero.

**Photos: twenty-five points, and they cost nothing.** The best effort-to-result ratio on the entire listing. We count proportionally up to fifteen photos; beyond that the gain stops. Below five, your listing looks empty next to your neighbour's, and the customer feels it before they can put it into words. Fifteen photos taken properly one weekday lunchtime — the room, three dishes, the shopfront, the terrace, the bar — are worth more points than your rating.

**The rating: fifteen points from 4 out of 5**, eight from 3.5. The threshold of 4 is not arbitrary: it is the one below which a customer starts comparing you with the restaurant next door.

**The number of reviews: fifteen points from a hundred**, eight from twenty. Below twenty, a rating stays fragile — a single unhappy customer moves it half a point.

## Reviews, counted separately

Reviews weigh enough to deserve their own score, also out of a hundred:

- **the rating itself**, for a little over half;
- **the number**, up to two hundred reviews, for a quarter;
- **freshness**, for a fifth: the share of your reviews less than six months old.

That third line is the one nobody sees coming, and it is the most telling. Twenty reviews whose most recent is two years old describe a place that may have closed. Ten reviews of which three are from this month describe a place that is running. Customers read it that way, and so do machines.

The practical consequence: **asking for reviews is not something you do once.** A restaurant that collected a hundred reviews three years ago and nothing since degrades on its own, without its rating moving a point.

One clarification belongs here: what you are allowed to do to obtain those reviews is regulated, and the shortcuts are expensive. We have devoted a whole article to it.

## Your website, as a machine sees it

The third section is not played out on the listing but on the website it declares. And it starts with a brutal condition: **if your site does not respond, or there is none, this section scores zero.** Not little: zero.

If it responds, we count four things:

| What we look at | Points |
|---|---|
| The site responds | 25 |
| It carries structured data | 30 |
| That data declares a restaurant | 25 |
| It cites your social accounts | 20 |

The last three lines need explaining, because they are invisible to your customers.

Your site can display your address, your hours and your menu in plain words without any machine understanding that they are an address, opening hours and a menu. To a machine, it is text. **Structured data** is a small block, invisible on screen, that says explicitly: this is a restaurant, here is its cuisine, its address, its price range, its hours, its rating.

That is the difference between a page that talks about you and a page that **declares itself** to be you. And it is what allows Google to show something other than a blue link — and AI assistants to name you.

The last line, declared social accounts, stitches things together: without it, your site, your Google listing and your Instagram account are treated as three different businesses that happen to share a name.

## How the three combine

The final score weights the three sections: the listing and the reviews count for a little over a third each, the website for a little less.

That is not an accident. The listing and the reviews are what a customer actually looks at before walking in — they deserve the same weight. The website weighs slightly less because it is built **on** the first two: perfect markup on a site nobody finds fills no tables.

## Where to start tonight

In this order, because it follows points gained per minute spent:

1. **The three fields.** Phone, website, hours. Ten minutes, forty-five points.
2. **Fifteen photos.** One lunchtime, a decent phone, done. Twenty-five points more.
3. **Your category.** It earns no points with us but [decides which searches you show up in](/blog/pourquoi-je-sors-derriere-mon-voisin-google-maps): “cocktail bar” and “restaurant” do not answer the same questions.
4. **Reply to reviews**, all of them, the bad ones included. It does not change the rating, it changes what the next person reads.
5. **Ask for reviews, continuously.** Not a campaign: a habit.
6. **The site's markup**, last, because it is the only item on this list that needs someone technical — or a tool that puts it there for you.

A last word on the scorecard itself. It is worth what its thresholds are worth, and they are arguable: why fifteen photos and not twenty, why 4 out of 5 and not 4.2. We chose them, we stand by them, and we publish them for exactly that reason — **a score you cannot explain is a score you cannot defend.**
`,
};
