# Dossier Meta — obtenir le droit de publier

À quoi sert ce document : rassembler tout ce que la revue Meta va
demander, pour que le dépôt tienne en une soirée plutôt qu'en trois
allers-retours. Il ne remplace pas leur formulaire — leurs écrans
changent souvent. **Vérifie chaque intitulé sur place** ; ce qui est ici
est le fond, pas la forme.

## Ce qu'on demande, et pourquoi

Klarr lit aujourd'hui, il ne publie pas. La connexion existe déjà avec
quatre autorisations de lecture, obtenues et fonctionnelles :

| Autorisation actuelle   | Ce que le code en fait                                          |
| ----------------------- | --------------------------------------------------------------- |
| `pages_show_list`       | lister les Pages du restaurateur pour qu'il choisisse la sienne |
| `pages_read_engagement` | nombre d'abonnés, cinq dernières publications                   |
| `business_management`   | retrouver les Pages détenues via un portefeuille Business       |
| `instagram_basic`       | rattacher le compte Instagram professionnel de la Page          |

Deux autorisations manquent pour publier, et ce sont elles qui passent en
revue :

| À demander                  | Ce qu'elle autorise                            |
| --------------------------- | ---------------------------------------------- |
| `pages_manage_posts`        | publier sur la Page Facebook du restaurateur   |
| `instagram_content_publish` | publier sur son compte Instagram professionnel |

## Avant de déposer

- [ ] **Vérification d'entreprise** (Business Verification) au nom
      d'EDIREF. Documents officiels, RCS Paris 503 428 369, siège 10 rue
      de Penthièvre, 75008 Paris. **C'est Thomas qui la fait** — c'est le
      plus long, à lancer en premier.
- [ ] **Politique de confidentialité** accessible publiquement :
      `https://www.klarr.net/confidentialite` — déjà en ligne.
- [ ] **Suppression des données** : `https://www.klarr.net/suppression-donnees`
      — déjà en ligne, Meta le réclame systématiquement.
- [ ] **Conditions d'utilisation** : `https://www.klarr.net/cgu`.
- [ ] **Icône et nom d'application** cohérents avec la marque.
- [ ] **Reprendre `/confidentialite`** : la ligne Facebook / Instagram
      annonce « lecture seule », ce qui ne sera plus vrai. À reformuler
      avant le dépôt (voir plus bas).
- [ ] **Un compte de test** qu'un relecteur de Meta peut utiliser :
      identifiants à fournir, avec un établissement de démonstration déjà
      connecté et une publication prête à programmer.

## Le texte de justification

Meta demande, pour chaque autorisation, à quoi elle sert dans le produit.
Écrire ce que le code fait, pas ce qu'on aimerait vendre : une
justification qui ne correspond pas à la démonstration est le premier
motif de refus.

**`pages_manage_posts`**

> Klarr est un outil de gestion pour restaurants indépendants. Le
> restaurateur y rédige à l'avance ses publications — un plat de sa
> carte, une salle privatisable — et choisit la date de parution. À la
> date choisie, Klarr publie le message sur la Page Facebook de son
> propre établissement, qu'il a lui-même connectée. Klarr ne publie que
> sur les Pages dont l'utilisateur est administrateur, jamais sur
> d'autres, et uniquement le contenu qu'il a saisi et daté lui-même.

**`instagram_content_publish`**

> Le même message, publié sur le compte Instagram professionnel rattaché
> à cette Page, lorsque le restaurateur le demande. Aucune publication
> n'est générée automatiquement : chaque message est écrit et programmé
> par l'utilisateur depuis son tableau de bord.

## La vidéo de parcours

Meta veut voir le trajet complet, sans coupure, depuis un compte neuf.
Enregistre l'écran, sans montage, environ deux minutes, en anglais ou
sous-titré.

1. Arriver sur `klarr.net`, se connecter avec le compte de test.
2. Ouvrir **Connexions**, cliquer **Connecter via Facebook**.
3. Montrer l'écran d'autorisation de Meta **en entier**, y compris les
   deux nouvelles autorisations, et accepter.
4. Choisir la Page de l'établissement de démonstration.
5. Ouvrir **Publications**, cliquer une suggestion tirée de la carte —
   le texte se remplit — choisir une date, enregistrer.
6. Montrer la publication parue sur la Page Facebook, puis sur Instagram.
7. Terminer en montrant **où l'on déconnecte** le compte : ils le
   demandent, et son absence fait refuser des dossiers.

## Ce qui fait refuser, d'expérience

- Une vidéo qui saute l'écran d'autorisation, ou le montre coupé.
- Un compte de test qui ne fonctionne pas le jour où ils l'essaient.
- Une justification qui promet plus que ce que la vidéo montre.
- Une politique de confidentialité qui contredit la demande. **C'est
  notre cas aujourd'hui** : `/confidentialite` décrit bien les données
  Facebook et Instagram, mais la colonne « Publication » indique « Non —
  lecture seule ». Demander le droit de publier en affichant l'inverse
  sur son propre site est le type d'incohérence qui fait refuser un
  dossier. **À reprendre avant de déposer**, pas après.
- L'absence de moyen de déconnexion ou de suppression des données.

## Après l'accord

Poser la variable, redéployer, et les deux écrans reviennent seuls :

| Variable                  | Valeur | Type   | Environnements       |
| ------------------------- | ------ | ------ | -------------------- |
| `META_PUBLICATION_ACTIVE` | `1`    | Config | Production + Preview |

Et ajouter `pages_manage_posts` et `instagram_content_publish` à
`SCOPES_CLASSIQUES`, dans `src/components/connections/FacebookConnectButton.tsx` —
les restaurateurs déjà connectés devront réautoriser une fois.
