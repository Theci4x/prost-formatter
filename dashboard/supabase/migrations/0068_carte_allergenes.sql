-- Les allergènes, plat par plat.
--
-- Obligation, pas option : pour des plats non préemballés, l'information
-- doit être écrite et consultable sans que le client ait à la demander
-- (règlement UE 1169/2011 annexe II, décret 2015-447). Jusqu'ici Klarr
-- publiait des cartes sans un mot là-dessus — on donnait au restaurateur
-- un support propre et on le laissait en infraction dessus.
--
-- Trois états, et le troisième est le seul qui vaille cette colonne :
--
--   NULL  → le restaurateur n'a rien dit. On ne sait pas.
--   '{}'  → il a regardé et déclaré qu'il n'y en a aucun.
--   {...} → la liste.
--
-- Confondre les deux premiers coûterait cher : afficher « aucun allergène »
-- sous un plat que personne n'a examiné, c'est exactement le message qui
-- fait manger quelqu'un qui n'aurait pas dû. Un tableau non nul par défaut
-- aurait rendu cette distinction impossible, et le défaut aurait été le
-- mensonge.
alter table public.restaurant_menu_items
  add column if not exists allergenes text[];

-- La liste est fermée : c'est l'annexe II, elle ne s'étend pas. Un code
-- fantaisiste passerait sinon jusqu'à l'affichage, où il se lirait tel
-- quel sous un plat.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'restaurant_menu_items_allergenes_connus'
  ) then
    alter table public.restaurant_menu_items
      add constraint restaurant_menu_items_allergenes_connus
      check (
        allergenes is null
        or allergenes <@ array[
          'gluten', 'crustaces', 'oeufs', 'poissons', 'arachides',
          'soja', 'lait', 'fruits-a-coque', 'celeri', 'moutarde',
          'sesame', 'sulfites', 'lupin', 'mollusques'
        ]::text[]
      );
  end if;
end $$;
