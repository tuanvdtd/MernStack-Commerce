# Migrations notes

## Known checksum mismatch on `20260609000000_user_single_role`

`20260609000000_user_single_role/migration.sql` was edited **after** it had
already been applied to shared dev databases (commit `7838284`, which
rewrote the backfill logic in place instead of adding a new migration).
That means its checksum no longer matches what's recorded in
`_prisma_migrations` on any dev DB that had it applied before that edit.

**Symptom:** running `npx prisma migrate dev` reports something like:

```
The migration `20260609000000_user_single_role` was modified after it was applied.
We need to reset the MySQL database "commerce" at "localhost:3306"
```

**Do NOT run `prisma migrate reset`** — it drops the entire database, not
just the tables your change touches.

**Safe resolution — apply your new migration by hand instead:**

1. Compute the real diff between the live DB and your target schema:
   ```bash
   npx prisma migrate diff \
     --from-config-datasource \
     --to-schema ./prisma/schema.prisma \
     --script
   ```
2. Review the output and trim it down to only the statements your schema
   change actually intends. The diff will also include unrelated noise from
   this same pre-existing drift (e.g. `VARCHAR(36)` → `VARCHAR(191)` column
   widenings on `User`/`Role`/`Otp`/`Cart`/`DiscountUserUse`/`ProductReview`/
   `Address.id`/`Address.userId`, plus their FK drop/recreate) — leave those
   alone, they are not part of your change.
3. Save the trimmed SQL as `prisma/migrations/<timestamp>_<name>/migration.sql`
   (same layout Prisma itself would generate) and apply it:
   ```bash
   npx prisma db execute --file prisma/migrations/<timestamp>_<name>/migration.sql
   ```
4. Reconcile Prisma's migration ledger so `prisma migrate status`/`dev` see
   it as applied going forward:
   ```bash
   npx prisma migrate resolve --applied <timestamp>_<name>
   ```
5. Verify with `npx prisma migrate status` (should report "up to date") and
   `npx prisma generate`.

This was first hit (and worked around this way) while implementing checkout
Phase 1 Task 4 (`checkout_phase1_core`).
