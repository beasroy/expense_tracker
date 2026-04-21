-- Merge categories that only differ by case/spacing: keep one row per lower(trim(name)).
WITH agg AS (
  SELECT lower(trim("name")) AS norm, MIN("id") AS keep_id
  FROM "Category"
  GROUP BY lower(trim("name"))
)
UPDATE "Expense" e
SET "categoryId" = a.keep_id
FROM "Category" c
JOIN agg a ON a.norm = lower(trim(c."name"))
WHERE e."categoryId" = c."id" AND c."id" <> a.keep_id;

DELETE FROM "Category" c
WHERE c."id" NOT IN (
  SELECT MIN("id") FROM "Category" GROUP BY lower(trim("name"))
);

UPDATE "Category" SET "name" = lower(trim("name"));

-- DropCategory
ALTER TABLE "Category" DROP COLUMN "createdAt";
