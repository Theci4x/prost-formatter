-- La case « répondez-moi sur WhatsApp » n'existe plus.
--
-- Le canal a été abandonné : ouvrir un compte WhatsApp Business demande
-- une vérification d'entreprise et un numéro dédié à chaque établissement,
-- et les messages partis de chez nous se facturent au message. La
-- prospection passe désormais par l'assistant du site, qui propose un
-- rappel et prévient l'équipe — sans rien enregistrer ici.
--
-- La colonne est donc sans lecteur ni écrivain. Aucune ligne ne la portait
-- à vrai : la case n'a jamais été cochée entre sa mise en ligne et son
-- retrait, si bien qu'on n'efface aucun consentement en la supprimant.
--
-- Par prudence tout de même, on refuse de la supprimer s'il s'en trouvait
-- une : mieux vaut une migration qui échoue et qu'on relit qu'un accord
-- effacé sans que personne ne l'ait su.
do $$
declare
  restants integer;
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'prospects'
      and column_name = 'whatsapp'
  ) then
    execute 'select count(*) from public.prospects where whatsapp' into restants;
    if restants > 0 then
      raise exception
        'Migration interrompue : % prospect(s) avaient accepté WhatsApp. Traitez-les avant de supprimer la colonne.',
        restants;
    end if;
    alter table public.prospects drop column whatsapp;
  end if;
end
$$;
