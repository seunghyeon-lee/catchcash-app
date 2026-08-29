-- Allow authenticated clients to issue admin CMS write requests.
-- Existing RLS policies still restrict writes to active super_admin or operator users.

grant insert, update on public.treasure_boxes to authenticated;
grant insert, update on public.gift_products to authenticated;
grant insert, update on public.treasure_rewards to authenticated;
