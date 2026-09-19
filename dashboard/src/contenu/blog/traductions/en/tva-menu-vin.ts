import type { TraductionBillet } from "@/types/blog";

export const traduction: TraductionBillet = {
  slug: "vat-a-set-menu-with-wine-is-not-taxed-at-10-percent",
  titre: "VAT: a set menu with a glass of wine is not taxed at 10%",
  resume:
    "As soon as a fixed price includes alcohol, it has to be split between two rates — and the split has to be justified. Failing that, the tax authorities apply 20% to the whole menu.",
  essentiel: [
    "Alcoholic drinks are at 20%, eat-in and takeaway alike. Food served on the premises is at 10%. A menu mixing the two has to be split.",
    "The split is yours to make: the authorities expect an economically rational method that you can justify. Failing that, the whole price is taxed at the higher rate.",
    "On a €32 menu including a glass of wine, the gap between a correct split and the full rate is €2.10 — and the authorities can go back three years.",
    "Arrhes kept after a no-show are compensation, so outside the scope of VAT. An acompte is within it. The word you write decides.",
  ],
  markdown: `
“Restaurants are 10%.”

True for food. Not true for alcohol, and the difficulty begins exactly where the two meet: in a fixed-price menu that includes a glass of wine.

## The three rates, in the order you meet them

- **10%** — sales for consumption on the premises: food and non-alcoholic drinks. And, since 2012, takeaway or [delivery](/blog/livraison-uber-eats-deliveroo-calcul-marge) of food prepared **for immediate consumption**.
- **20%** — **all** alcoholic drinks, no exception and no distinction: on the premises, takeaway, delivered. A glass of wine at the bar and a bottle sold to take away fall under the same rate.
- **5.5%** — food intended for **deferred consumption**, that is, packaged in containers allowing it to be kept. Bread, a terrine in a jar, a vacuum-packed dish to reheat at home.

So the dividing line between 10% and 5.5% is not “eat in or take away”: it is **immediate or deferred**.

## The trap: the fixed-price menu

You sell a €32 menu with a starter, a main, a dessert and a glass of wine. The customer pays a single price. But that price covers two operations taxed differently.

**So it has to be split.** And the burden of that split is yours: the authorities expect an **economically rational** method that you are able to **justify**.

::: attention With no split, everything goes to 20%
This is the rule that costs money, and it is simple: where the fixed price is not correctly split, it is taxed **in its entirety** at the rate applicable to the most heavily taxed operation.

In other words, without a justifiable method, it is not the glass of wine that goes to 20% — it is the whole menu.
:::

## The method, on a €32 menu

The tax administration's own guidance gives an acceptable method where the items in the menu are also sold à la carte: you work out the share of the à la carte price that falls under the reduced rate, and apply that ratio to the menu price.

Take this carte:

| Item | Price incl. VAT à la carte | Rate | Price excl. VAT |
|---|---|---|---|
| Starter | €9.00 | 10% | €8.18 |
| Main | €22.00 | 10% | €20.00 |
| Dessert | €8.00 | 10% | €7.27 |
| Glass of wine | €6.00 | 20% | €5.00 |
| **Total à la carte** | | | **€40.45** |

The reduced-rate share is €35.45 out of €40.45, that is **87.64%**. The 20% share is therefore **12.36%**.

Apply those proportions to the menu:

> Menu price incl. VAT: €32.00
>
> Base at 10%: €25.21 → VAT **€2.52**
> Base at 20%: €3.56 → VAT **€0.71**
>
> Total VAT: **€3.23**

::: chiffre €2.10 per menu
VAT due with no split would be €5.33 (€32 at the full rate), against €3.23 correctly split.

**Gap: €2.10 on every menu sold.** Twenty menus a day, six days out of seven, is about **€1,100 a month** — and the authorities can go back **three years**.
:::

**Two points on the method:**

- The split is assessed **menu by menu**. A single flat method for all menus containing alcohol is accepted, **provided the proportion of alcohol is similar from one to the next**.
- If your items are not sold separately à la carte, the method above does not apply as it stands. You have to build another one — and be able to explain it.

::: exemple What actually gets inspected
Nobody will ask you to have found the exact figure. They will ask you to show **how you arrived at your figure**.

A one-page note, written once, setting out the method, the à la carte prices used and the date of the calculation, is worth more than a correct percentage nobody can trace. Redo it at every menu change.
:::

## The other places it comes up

- **Coffee.** A non-alcoholic drink: 10% on the premises, and 10% takeaway since it is for immediate consumption.
- **A bottle sold to take away.** 20%, as by the glass. Alcohol knows no reduced rate.
- **Bread, jars, vacuum-packed dishes** sold for later: 5.5%, because consumption is deferred.
- **The same hot dish to take away**: 10%, because it is not.
- **Lunch deals with a drink**: the same trap as the evening menu, only more often.

## The link with no-shows that nobody makes

Here is a point worth a meeting with your accountant, and it follows directly from what you write in your terms.

- **Arrhes kept** after a customer backs out are in the nature of **flat-rate compensation for withdrawal**: they make good a loss, they pay for no service. As such they are **outside the scope of VAT**.
- **An acompte** is a first payment against the price of a future operation. It is **within the scope**, and VAT becomes chargeable as soon as it is received.

::: attention The word you write decides the regime
Two restaurants debiting exactly the same amount for exactly the same absence can end up in two different VAT regimes — depending on whether their terms say arrhes or acompte.

One more reason to write it clearly, and to write it before you need it.
:::

→ [No-shows: what they cost, and what actually reduces them](/blog/no-show-restaurant-cout-empreinte-bancaire)

## What to check yourself

- **Your current splitting method.** Does it exist? Can anyone explain it? If the answer is no twice, that is this week's job.
- **Your deals and set menus** that include an alcoholic drink, lunch offers and group deals included.
- **How your cancellation terms are drafted**: arrhes or acompte.
- **And above all, your accountant.** This article gives the framework and the order of magnitude; it does not replace someone with your invoices in front of them. That is an hour's appointment against several thousand euros of possible reassessment.
`,
};
