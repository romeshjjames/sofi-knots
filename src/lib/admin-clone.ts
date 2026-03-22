export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function buildCopyLabel(source: string, existing: Set<string>) {
  let attempt = `${source} Copy`;
  let counter = 2;
  while (existing.has(attempt.toLowerCase())) {
    attempt = `${source} Copy ${counter}`;
    counter += 1;
  }
  return attempt;
}

export function buildCopySlug(sourceSlug: string, existing: Set<string>) {
  let attempt = `${sourceSlug}-copy`;
  let counter = 2;
  while (existing.has(attempt.toLowerCase())) {
    attempt = `${sourceSlug}-copy-${counter}`;
    counter += 1;
  }
  return attempt;
}

export function buildCopySku(sourceSku: string | null | undefined, suffix: string) {
  if (!sourceSku) return null;
  return `${sourceSku}-${suffix}`.slice(0, 120);
}
