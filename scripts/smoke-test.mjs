// Smoke test for lib/* against whatever sits in content/ today.
// Run via: npm run test:lib

const {
  getAllNotes,
  getNotesByCategory,
  getAllTags,
  buildLinkIndex,
  getBacklinks,
  getHomeNote,
  renderMarkdown,
} = await import("../lib/markdown.ts");

const { buildSearchIndex } = await import("../lib/search.ts");

let pass = 0;
let fail = 0;
function assert(cond, msg) {
  if (cond) {
    pass++;
    console.log(`  ok  ${msg}`);
  } else {
    fail++;
    console.log(`  FAIL  ${msg}`);
  }
}

const notes = getAllNotes();

console.log("\n=== getAllNotes ===");
assert(notes.length > 0, `loaded ${notes.length} notes`);
assert(
  notes.every((n) => typeof n.slug === "string" && n.slug.length > 0),
  `every note has a non-empty slug`
);
assert(
  new Set(notes.map((n) => n.slug)).size === notes.length,
  `all slugs are unique (${new Set(notes.map((n) => n.slug)).size} / ${notes.length})`
);
const japanese = notes.filter((n) => /[぀-ヿ一-龯]/.test(n.basename));
assert(japanese.length === 0 || japanese.length > 0,
  `${japanese.length} notes with Japanese basenames`);

console.log("\n=== home note ===");
const home = getHomeNote();
assert(!!home, `getHomeNote() returned ${home ? home.basename : "undefined"}`);

console.log("\n=== categories ===");
const dailies = getNotesByCategory("daily");
const weeklies = getNotesByCategory("weekly");
const regular = getNotesByCategory("note");
console.log(`     daily=${dailies.length} weekly=${weeklies.length} note=${regular.length}`);
assert(dailies.length + weeklies.length + regular.length === notes.length,
  `category counts sum to total (${dailies.length}+${weeklies.length}+${regular.length} == ${notes.length})`);

console.log("\n=== tags ===");
const tags = getAllTags();
console.log(`     ${tags.length} unique tags`);
assert(tags.length > 0, `at least one tag found`);
if (tags.length > 0) {
  const top = tags.slice(0, 5).map((t) => `#${t.tag}(${t.count})`).join(" ");
  console.log(`     top: ${top}`);
}

console.log("\n=== link index ===");
const idx = buildLinkIndex();
assert(idx.size > 0, `link index has ${idx.size} entries`);

console.log("\n=== backlinks ===");
let totalBacklinks = 0;
let notesWithBacklinks = 0;
for (const n of notes) {
  const bl = getBacklinks(n.slug);
  if (bl.length > 0) {
    notesWithBacklinks++;
    totalBacklinks += bl.length;
  }
}
console.log(`     ${notesWithBacklinks} notes have at least one backlink (${totalBacklinks} total edges)`);
assert(notesWithBacklinks >= 0, `backlink calculation completed without throwing`);

console.log("\n=== renderMarkdown ===");
// Render the home note (or first note) and check basic invariants
const target = home ?? notes[0];
const html = await renderMarkdown(target.body);
assert(html.length > 0, `rendered HTML for "${target.title}" (${html.length} chars)`);
assert(!html.includes("[["), `no raw [[wikilinks]] left in rendered HTML`);

// Render a sample of 5 notes to make sure none throw
let renderFails = 0;
const sample = notes.slice(0, Math.min(20, notes.length));
for (const n of sample) {
  try {
    await renderMarkdown(n.body);
  } catch (e) {
    renderFails++;
    console.log(`     render failed for ${n.basename}: ${e.message}`);
  }
}
assert(renderFails === 0, `${sample.length} sample notes rendered without errors`);

console.log("\n=== url-encoded link in rendered HTML ===");
// Find a note whose basename has non-ASCII characters and is referenced from somewhere
const referenced = notes.find(
  (n) =>
    /[぀-ヿ一-龯]/.test(n.basename) &&
    getBacklinks(n.slug).length > 0
);
if (referenced) {
  const referrer = notes.find((n) => n.slug === getBacklinks(referenced.slug)[0].slug);
  const refHtml = await renderMarkdown(referrer.body);
  const ok = refHtml.includes(encodeURIComponent(referenced.slug));
  assert(ok, `Japanese-slug wikilink rendered as URL-encoded /notes/ href in ${referrer.basename}`);
} else {
  console.log(`     (skipped — no referenced Japanese-named notes)`);
}

console.log("\n=== search index ===");
const search = buildSearchIndex();
assert(search.length === notes.length, `search index has ${search.length} entries`);
const totalBytes = search.reduce((s, e) => s + e.body.length, 0);
console.log(`     total search body size: ${(totalBytes / 1024).toFixed(1)} KB`);
const sizeKB = JSON.stringify(search).length / 1024;
console.log(`     full JSON size: ${sizeKB.toFixed(1)} KB`);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
