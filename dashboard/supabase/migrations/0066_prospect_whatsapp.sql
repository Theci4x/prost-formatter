-- L'accord de réponse sur WhatsApp, coché par le prospect lui-même.
--
-- Un numéro laissé dans un formulaire n'autorise pas à écrire sur
-- WhatsApp : la politique de messagerie de Meta demande un opt-in qui
-- **nomme WhatsApp et nomme l'entreprise**, et un message envoyé sans lui
-- fait fermer le compte — celui-là même qui porte la vérification
-- d'entreprise et la publication Facebook et Instagram.
--
-- Ce n'est pas pour autant une case marketing. Le motif ne change pas :
-- c'est le même test de présence, et la même suite donnée à ce test. Ce
-- que la case ajoute, c'est le canal. La mention d'information du
-- formulaire couvre donc déjà le traitement, et n'a pas à être réécrite.
--
-- `false` par défaut, et sans reprise de l'existant : les prospects déjà
-- en base n'ont jamais vu cette case, donc ils n'ont rien accordé. Un
-- consentement ne se déduit pas d'un numéro qu'on possède, et présumer
-- l'inverse serait exactement l'erreur que la colonne existe pour éviter.
alter table public.prospects
  add column if not exists whatsapp boolean not null default false;

comment on column public.prospects.whatsapp is
  'Le prospect a coché, au formulaire, que Klarr peut lui répondre sur WhatsApp au sujet de son test. Faux tant qu''il ne l''a pas fait.';
