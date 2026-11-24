const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

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

async function runZipVerification() {
  console.log('Testing test_export.zip loading with JSZip...');
  const zipBuffer = fs.readFileSync(path.join(__dirname, 'test_export.zip'));
  
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(zipBuffer);

  let hasHtml = false;
  let followingFile = null;
  const followerFiles = [];

  loadedZip.forEach((relativePath, fileObj) => {
    if (fileObj.dir) return;
    const lower = relativePath.replace(/\\/g, '/').toLowerCase();
    const fileName = lower.split('/').pop();

    if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
      if (fileName.includes('follower') || fileName.includes('following')) {
        hasHtml = true;
      }
    }

    if (
      fileName.includes('hashtag') || 
      fileName.includes('pending_follow_requests') || 
      fileName.includes('recently_unfollowed')
    ) {
      return;
    }

    if (fileName === 'following.json' || fileName === 'following') {
      followingFile = fileObj;
    }

    if (fileName.startsWith('followers') && fileName.endsWith('.json')) {
      followerFiles.push(fileObj);
    }
  });

  if (hasHtml) {
    throw new Error('Detected unexpected HTML file in ZIP');
  }

  if (!followingFile) {
    throw new Error('following.json was NOT found in ZIP!');
  }

  if (followerFiles.length !== 2) {
    throw new Error(`Expected 2 follower files (followers_1.json and followers_2.json), found ${followerFiles.length}`);
  }

  console.log(`✓ Located followingFile: ${followingFile.name}`);
  console.log(`✓ Located ${followerFiles.length} follower files: ${followerFiles.map(f => f.name).join(', ')}`);

  // Parse following
  const followingText = await followingFile.async('text');
  const followingJson = JSON.parse(followingText);
  const followingUsers = extractUserEntries(followingJson);
  console.log(`✓ Parsed following users: ${followingUsers.length} (Expected 15)`);

  // Parse followers
  const followerSet = new Set();
  for (const fFile of followerFiles) {
    const text = await fFile.async('text');
    const json = JSON.parse(text);
    const entries = extractUserEntries(json);
    entries.forEach(e => followerSet.add(e.username));
  }
  console.log(`✓ Parsed unique followers: ${followerSet.size} (Expected 10)`);

  // Compute non-mutuals
  const nonMutuals = followingUsers.filter(u => !followerSet.has(u.username));
  console.log(`✓ Computed non-mutuals: ${nonMutuals.length} (Expected 7)`);

  if (followingUsers.length !== 15 || followerSet.size !== 10 || nonMutuals.length !== 7) {
    throw new Error('Assertion failed on expected counts');
  }

  console.log('--- ZIP VERIFICATION PASSED PERFECTLY ---');
}

runZipVerification().catch(err => {
  console.error('ZIP verification failed:', err);
  process.exit(1);
});
