-- Les numéros de téléphone, sous une seule forme.
--
-- `normaliserTelephone()` existait depuis longtemps et était juste, mais
-- il n'était branché que sur le formulaire prospect. Le carnet de
-- réservations, lui, enregistrait ce que le client avait tapé :
-- « 06 12 34 56 78 », « 0612345678 », « +33 6 12 34 56 78 »,
-- « 06.12.34.56.78 » — quatre écritures du même numéro, et autant de
-- façons de ne pas le reconnaître d'une réservation à l'autre.
--
-- Le code range désormais à la saisie. Reste l'existant, et c'est l'objet
-- de cette migration.
--
-- **Ce qui ne se lit pas n'est pas effacé.** Un « 06 12 34 56 » tronqué
-- reste tel quel : une machine l'ignorera (elle ne compose que la forme
-- internationale), mais le restaurateur y voit qu'il manque un chiffre et
-- retrouve l'appel. Effacer lui retirerait l'indice sans rien apporter.
--
-- La fonction ci-dessous recopie exactement `src/lib/contact/telephone.ts`
-- et **se supprime à la fin**. Une copie qui resterait en base finirait
-- par diverger de celle du code, et on ne saurait plus laquelle fait foi.

create or replace function public.klarr_normaliser_telephone_reprise(saisie text)
returns text
language plpgsql
immutable
as $$
declare
  brut text := btrim(coalesce(saisie, ''));
  numero text;
begin
  if brut = '' then
    return null;
  end if;

  -- Ne garder que les chiffres, et le « + » s'il ouvre le numéro.
  if left(brut, 1) = '+' then
    numero := '+' || regexp_replace(brut, '[^0-9]', '', 'g');
  else
    numero := regexp_replace(brut, '[^0-9]', '', 'g');
  end if;

  if numero = '' or numero = '+' then
    return null;
  end if;

  -- 0033… s'écrit aussi +33…
  if left(numero, 2) = '00' then
    numero := '+' || substr(numero, 3);
  end if;

  -- France, écrit à la française : 0 puis neuf chiffres, le premier de 1 à 9.
  if numero ~ '^0[1-9][0-9]{8}$' then
    return '+33' || substr(numero, 2);
  end if;

  -- Un 0 en tête sans faire dix chiffres : un français mal saisi.
  if left(numero, 1) = '0' then
    return null;
  end if;

  -- L'indicatif français en clair doit tenir sa longueur, et non retomber
  -- sur la règle internationale ci-dessous, bien plus large.
  if left(numero, 3) = '+33' then
    if numero ~ '^\+33[1-9][0-9]{8}$' then
      return numero;
    end if;
    return null;
  end if;

  -- Ailleurs, on s'en tient aux bornes de la norme internationale.
  if numero ~ '^\+[0-9]{8,15}$' then
    return numero;
  end if;

  return null;
end;
$$;

-- Les trois colonnes qui portent le numéro d'un convive. On ne touche
-- qu'aux lignes que la fonction sait lire *et* qu'elle change : pas de
-- réécriture inutile, et rien d'illisible n'est perdu.
update public.restaurant_reservations
   set client_telephone = public.klarr_normaliser_telephone_reprise(client_telephone)
 where client_telephone is not null
   and public.klarr_normaliser_telephone_reprise(client_telephone) is not null
   and public.klarr_normaliser_telephone_reprise(client_telephone) <> client_telephone;

update public.restaurant_experience_reservations
   set client_telephone = public.klarr_normaliser_telephone_reprise(client_telephone)
 where client_telephone is not null
   and public.klarr_normaliser_telephone_reprise(client_telephone) is not null
   and public.klarr_normaliser_telephone_reprise(client_telephone) <> client_telephone;

update public.restaurant_contacts
   set telephone = public.klarr_normaliser_telephone_reprise(telephone),
       updated_at = now()
 where telephone is not null
   and public.klarr_normaliser_telephone_reprise(telephone) is not null
   and public.klarr_normaliser_telephone_reprise(telephone) <> telephone;

-- Le numéro de l'établissement lui-même n'est pas touché : il s'affiche
-- sur la vitrine et sur la fiche Google, où « 06 12 34 56 78 » se lit
-- mieux que « +33612345678 ». C'est un autre sujet, et une autre décision.

drop function public.klarr_normaliser_telephone_reprise(text);
