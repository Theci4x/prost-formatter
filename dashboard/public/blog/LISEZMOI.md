# Les photos du journal

Déposez ici les images d'en-tête des articles, puis déclarez-les sur le
billet correspondant dans `src/contenu/blog/` :

```ts
image: {
  fichier: "/blog/nom-du-fichier.jpg",
  alt: "Ce que la photo montre, pour qui ne la voit pas.",
  credit: "Facultatif",
},
```

Sans ce champ, l'article reçoit une couverture dessinée (voir
`src/components/blog/Couverture.tsx`). C'est un repli correct, pas un
équivalent : une photo prise sur place dit au lecteur que l'article vient
de quelqu'un qui y était.

Format : JPEG ou WebP, 1600 px de large suffisent, sous 400 Ko. Au-delà,
c'est la page qui rame sur le téléphone de quelqu'un dans le métro.
