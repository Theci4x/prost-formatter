import type { TraductionBillet } from "@/types/blog";

export const traduction: TraductionBillet = {
  slug: "why-chatgpt-never-mentions-your-restaurant",
  titre: "Why ChatGPT never mentions your restaurant",
  resume:
    "When a customer asks an AI where to eat in your neighbourhood, it names two or three places. There is no second page. Here is what decides who gets named, what nobody can promise you, and how to find out where you stand.",
  essentiel: [
    "An assistant's answer names two or three places and stops. There is no second page, so there is no consolation tenth place.",
    "The assistant does not know your restaurant: it knows what its sources say about it. Your Google listing, reviews, mentions elsewhere, the structured data on your site.",
    "Nobody can guarantee you a place in those answers, and be wary of anyone who promises one. There is no ranking to consult and no direct lever.",
    "You can measure it, though: ask the question, read the answer, date it, do it again. That is the only way to know whether what you change is doing anything.",
  ],
  markdown: `
**Let us say it up front: we are not neutral.** Klarr sells a tool that measures what AI assistants say about a restaurant. So we have a direct interest in making you worry about this.

Here, then, is the article written the other way round from the ones you read elsewhere: first what nobody can promise you, then what actually counts, and finally how to check for yourself without us.

## What happens when a customer asks

Someone types, into ChatGPT or Gemini: “where can six of us eat in the 11th on Saturday”. The assistant does not return a list of results. It answers in a sentence, and it names **two or three places**.

That is the whole difference with Google. On a results page, tenth place exists: it earns little, but it exists. In an assistant's answer, **there is no second page**. You are in it or you are not, and whoever is not appears nowhere — not further down, nowhere.

That is what makes this different from ordinary search optimisation, and it is also what makes it hard to work on: there is no position to climb, there is a presence to obtain.

## Why your restaurant is not there

An assistant does not know your restaurant. It knows **what its sources say about it**.

A model answers this kind of question in two ways, often mixed: from what it retained during training, and from what it goes and fetches on the web at the moment you ask. Either way the mechanism is the same: if your place does not exist, or exists badly, in the places it looks, it cannot name you. It is not forgetting you — it has never met you.

The places it looks are the ones you already know: your Google listing, reviews, sites that write about restaurants in your city, guides, directories, and your own site when that site says clearly what it is.

Hence the most useful conclusion in this article, and it is a reassuring one: **the work to do is not new.** It is the same work as for Google, with one extra demand on consistency.

## The five things that decide

**1. [A complete, living Google listing](/blog/fiche-google-restaurant-ce-qui-compte-vraiment).** Exact hours, the right category — “cocktail bar” and not "restaurant" if that is what you are — recent photos, a description that says what people eat. A half-filled listing is a half-mute source.

**2. Reviews, and above all recent ones.** Twenty reviews whose most recent is two years old say “this place may have closed”. Ten reviews of which three are from this month say “this place is running”. Freshness counts at least as much as quantity.

**3. Mentions somewhere other than your own site.** An assistant cross-checks. A restaurant that is only talked about on its own website is a restaurant with one voice speaking for it. The local press, a neighbourhood blog, a guide, a “best places in” list: each of those mentions is one more voice.

**4. A site that declares itself a restaurant.** This is the most technical point and the most often missed. Your site can display your address and your hours in plain words without any machine understanding that they are an address and opening hours. Structured data exists for exactly that: to declare, in a format built for it, “this is a restaurant, here is its cuisine, its address, its price range, its hours”. It is markup invisible to your customers and decisive for machines.

**5. The same information everywhere.** An address that differs by a line between your listing and your site, an opening time left on a directory three years ago, an out-of-date phone number: every discrepancy weakens the whole. A machine that finds three versions of a fact keeps none of them with confidence.

## What nobody can promise you

This needs saying plainly, because a market has grown up around the subject.

**There is no direct lever.** You cannot register with ChatGPT. You cannot buy a slot in it. Nobody has a button that makes your name appear in an answer, and anyone selling you one is selling you something else.

**There is no ranking to consult.** No average position, no official dashboard, nothing resembling what Google publishes.

**Answers vary.** Ask the same question twice and you will not always get the same names. Change assistant and you certainly will not. A single measurement proves nothing: only repetition over time says anything.

That instability is not a flaw in the measurement, it is the nature of the thing. And it is precisely why you should measure rather than guess.

## How to find out where you stand

You can do it yourself, tonight, for nothing. The method comes down to four points.

**Ask the customer's question, not yours.** “Best Italian restaurant near République” is a real question. “What do you think of Chez Marcel” is not: you are feeding it the answer. The test is only worth something if you never say your own name.

**Ask several assistants.** They do not read the same sources and do not answer alike. Being named by one and not the other is information in itself.

**Write down the whole answer, with the date.** Not just “I’m in” or “I’m not”, but which names come out, and in what order. The competitors named in your place are the real lesson: they are the ones your customers are discovering, and you know them.

**Do it again in a month.** After completing your listing, replying to your reviews, adding photos. It is the comparison that will tell you whether it works, not the first measurement.

Do it by hand: it works, it costs nothing, and you will understand the subject better than from any report. If you would rather not repeat it every month, that is what our Visibility module automates — it asks your questions, keeps the answers dated, and draws the curve. But start by doing it yourself once.

## What it changes, in practice

A restaurateur who discovers that the AI names three places on their street and not theirs rarely reacts by buying software. They react by going to look at their Google listing, and they almost always find something to do there: a wrong category, four photos from the opening, summer hours still in place since September, and twenty reviews without a single reply.

That is the real effect of this measurement: it does not teach you a new technique, **it makes urgent what you had been putting off.** And what you fix for the assistants, you fix in the same movement for Google Maps and for the customer looking up your number on a Sunday evening.
`,
};
