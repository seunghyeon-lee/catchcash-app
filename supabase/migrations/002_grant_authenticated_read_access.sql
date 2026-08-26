-- Allow authenticated app users to read the public tables used by the
-- inventory / hunt reward flows. Row-level security remains enabled, so
-- existing RLS policies still determine which rows each user may access.

grant select on public.inventory_items to authenticated;
grant select on public.treasure_claims to authenticated;
grant select on public.treasure_boxes to authenticated;
grant select on public.treasure_rewards to authenticated;
grant select on public.gift_products to authenticated;
