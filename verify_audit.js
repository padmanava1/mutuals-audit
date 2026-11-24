const fs = require('fs');
const path = require('path');

// Extract function directly mirrored from index.html
function extractUserEntries(data) {
  const entries = [];
  const seen = new Set();

  function traverse(obj) {
    if (!obj || typeof obj !== 'object') return;

    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        traverse(obj[i]);
      }
      return;
    }

    if (Array.isArray(obj.string_list_data) && obj.string_list_data.length > 0) {
      for (const sld of obj.string_list_data) {
        const username = sld.value || obj.title || obj.value;
        if (username && typeof username === 'string') {
          const clean = username.trim();
          const lower = clean.toLowerCase();
          if (!seen.has(lower) && !clean.startsWith('#')) {
            seen.add(lower);
            const validHref = (typeof sld.href === 'string' && sld.href.startsWith('https://'))
              ? sld.href
              : `https://www.instagram.com/${encodeURIComponent(clean)}`;
            const ts = typeof sld.timestamp === 'number' ? sld.timestamp : (typeof obj.timestamp === 'number' ? obj.timestamp : 0);
            entries.push({
              username: lower,
              displayUsername: clean,
              href: validHref,
              timestamp: ts
            });
          }
        }
      }
    } else if (obj.value && typeof obj.value === 'string' && (obj.href || obj.timestamp !== undefined)) {
      const clean = obj.value.trim();
      const lower = clean.toLowerCase();
      if (!seen.has(lower) && !clean.startsWith('#')) {
        seen.add(lower);
        const validHref = (typeof obj.href === 'string' && obj.href.startsWith('https://'))
          ? obj.href
          : `https://www.instagram.com/${encodeURIComponent(clean)}`;
        entries.push({
          username: lower,
          displayUsername: clean,
          href: validHref,
          timestamp: typeof obj.timestamp === 'number' ? obj.timestamp : 0
        });
      }
    }

    for (const key of Object.keys(obj)) {
      if (key !== 'string_list_data') {
        traverse(obj[key]);
      }
    }
  }

  traverse(data);
  return entries;
}

console.log('--- STARTING VERIFICATION TEST SUITE ---');

// 1. Test following.json extraction
const followingJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'mock_data', 'following.json'), 'utf8'));
const followingEntries = extractUserEntries(followingJson);
console.log(`Following count extracted: ${followingEntries.length} (Expected: 15)`);
if (followingEntries.length !== 15) {
  throw new Error(`Expected 15 following, got ${followingEntries.length}`);
}

// 2. Test followers_1.json extraction
const followers1Json = JSON.parse(fs.readFileSync(path.join(__dirname, 'mock_data', 'followers_1.json'), 'utf8'));
const followers1Entries = extractUserEntries(followers1Json);
console.log(`Followers_1 count extracted: ${followers1Entries.length} (Expected: 8)`);
if (followers1Entries.length !== 8) {
  throw new Error(`Expected 8 followers in file 1, got ${followers1Entries.length}`);
}

// 3. Test followers_2.json extraction
const followers2Json = JSON.parse(fs.readFileSync(path.join(__dirname, 'mock_data', 'followers_2.json'), 'utf8'));
const followers2Entries = extractUserEntries(followers2Json);
console.log(`Followers_2 count extracted: ${followers2Entries.length} (Expected: 2)`);
if (followers2Entries.length !== 2) {
  throw new Error(`Expected 2 followers in file 2, got ${followers2Entries.length}`);
}

// 4. Test following_hashtags.json (Must ignore hashtags starting with #)
const hashtagsJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'mock_data', 'following_hashtags.json'), 'utf8'));
const hashtagEntries = extractUserEntries(hashtagsJson);
console.log(`Hashtag entries extracted: ${hashtagEntries.length} (Expected: 0)`);
if (hashtagEntries.length !== 0) {
  throw new Error(`Hashtags should be ignored, but extracted ${hashtagEntries.length}`);
}

// 5. Aggregate followers across multi-part files
const followerSet = new Set();
followers1Entries.forEach(u => followerSet.add(u.username));
followers2Entries.forEach(u => followerSet.add(u.username));
console.log(`Total unique followers: ${followerSet.size} (Expected: 10)`);
if (followerSet.size !== 10) {
  throw new Error(`Expected 10 total unique followers, got ${followerSet.size}`);
}

// 6. Compute non-mutuals
const nonMutuals = followingEntries.filter(u => !followerSet.has(u.username));
console.log(`Not following back count: ${nonMutuals.length} (Expected: 7)`);
if (nonMutuals.length !== 7) {
  throw new Error(`Expected 7 non-mutuals, got ${nonMutuals.length}`);
}

console.log('Non-mutual accounts identified:');
nonMutuals.forEach((u, i) => {
  console.log(`  ${i + 1}. @${u.displayUsername} (Followed: ${new Date(u.timestamp * 1000).toISOString().split('T')[0]})`);
});

// 7. Verify URL protocol safety
for (const u of nonMutuals) {
  if (!u.href.startsWith('https://')) {
    throw new Error(`Unsafe URL detected: ${u.href}`);
  }
}
console.log('✓ All profile URLs verified strictly HTTPS');

console.log('--- ALL TESTS PASSED SUCCESSFULLY! ---');
