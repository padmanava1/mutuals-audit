# Mutuals Audit

A 100% client-side, privacy-first web application that audits social media accounts you follow that do not follow you back. 

Runs entirely in browser memory from your official platform data export—with **zero server costs**, **zero network calls**, and **zero automated unfollowing**.

---

## 🌟 Key Features

- **100% Local Processing:** Uses in-browser `JSZip` to decompress `.zip` archives directly in memory. Your data never touches an external server or API.
- **🛡️ Safe Daily Pacing Engine (Anti-Ban):** 
  - Tracks daily review counts against recommended safe platform limits (30, 50, 100, or 150/day).
  - Protects your account from Meta's action velocity filters and prevents temporary action blocks or bans.
  - Persists daily progress across sessions in `localStorage`.
- **⚡ Speed Review Queue (Focus Mode):**
  - Distraction-free review card with full keyboard shortcut navigation:
    - `Spacebar` / `Enter`: Opens profile in new tab, marks as Reviewed, increments daily progress, and advances to the next account.
    - `K`: Whitelists / Keeps the user (friends/creators) and advances.
    - `S` or `→`: Skips to next.
    - `←`: Returns to previous.
  - Cuts manual review time by 80% (under 2 seconds per account).
- **🚀 Open Batch of 5:** Opens the next 5 unreviewed profiles in background tabs at once. Unfollow across tabs and close them rapidly with `Ctrl + W`.
- **📱 Mobile App Deep Linking:** Toggle between opening profiles on the web or directly inside the native Instagram mobile app (`instagram://user?username=...`) for 1-tap mobile unfollowing.
- **Smart Schema Parser:**
  - Recursively navigates nested `string_list_data` schemas.
  - Automatically merges multi-part follower files (`followers_1.json`, `followers_2.json`, etc.).
  - Safely ignores unrelated files like `following_hashtags.json`, `pending_follow_requests.json`, and `recently_unfollowed_profiles.json`.
- **Export Guardrails:**
  - Detects accidental `.html` format exports and displays clear guidance to re-export as `JSON`.
  - Warns if archive exceeds 50 MB (preventing users from waiting on massive video/media exports).
- **Persistent Whitelist / Keep Memory:** Star/keep intentional follows saved in your browser's `localStorage` so future audits stay clean.
- **Export Options:** Download a clean `.csv` report or copy non-mutual usernames directly to your clipboard.

---

## 🛡️ Account Safety & Rate Limits Compliance (Why Bots Get Banned)

Using automated third-party "1-click bulk unfollow" apps or Chrome extensions is the primary cause of Instagram action blocks and permanent bans. Meta’s anti-abuse heuristics detect automated non-official API calls and foreign device signatures immediately.

### The Golden Safety Rules:
- **Hourly Safe Velocity:** Keep actions under **40–60 unfollows per hour**.
- **Daily Safe Cap:** Keep total actions under **120–180 unfollows per day** (recommended: 50–100/day).
- **The 1,000 Account Plan:** Spread 1,000 unfollows over **7 to 10 days** using Mutuals Audit’s **Safe Daily Pacing Engine**. Two short 5-minute sessions of 50 accounts per day keeps your account 100% safe.

### 📱 Secret Native Mobile Shortcut ("Least Interacted With"):
1. In the Instagram mobile app, go to your **Profile** &rarr; tap **Following**.
2. Tap **Categories** at the top &rarr; select **"Least Interacted With"** (shows ~50 accounts you haven't engaged with in 90 days).
3. Tap the **Following** button directly next to each name to unfollow in 1 tap without loading profiles!

---

## 📋 Verified Step-by-Step Export Guide

Follow these verified steps in your platform's Accounts Center. When you select **only followers**, your export is typically ready in **under 2 to 5 minutes** (instead of hours or days).

### Step 1: Navigate to Accounts Center
1. Open your app or web profile and tap the **Menu (☰)** icon.
2. Select **Settings and privacy** &rarr; **Accounts Center**.
3. Under *Account settings*, tap **Your information and permissions**.
4. Select **Export your information** &rarr; **Download or transfer information**.

<!-- Screenshot Slot 1: Accounts Center navigation -->
> [!NOTE]
> *(Screenshot placeholder: Settings > Accounts Center > Your information and permissions)*

---

### Step 2: Choose Destination & Customization
1. Choose **Export to device**.
2. Select **Customize information**.
   *(⚠️ Do **NOT** choose "All available information"—that will download heavy photo/video archives and take days).*

<!-- Screenshot Slot 2: Choose Customize Information -->
> [!NOTE]
> *(Screenshot placeholder: Select "Customize information")*

---

### Step 3: Select Followers and Following ONLY (Crucial)
1. Tap **Clear all** to uncheck messages, posts, and media.
2. Scroll down and check **ONLY "Followers and following"**.

<!-- Screenshot Slot 3: Followers and following checkbox -->
> [!TIP]
> Selecting *only* followers and following produces a lightweight JSON archive in 2–5 minutes.

---

### Step 4: Configure Format & Date Range
Ensure these settings are selected before submitting:
- **Date range:** Select **All time** (ensures older followed accounts are included).
- **Format:** Select **JSON** *(⚠️ Do NOT select HTML)*.
- **Media quality:** Select **Low** (fastest delivery).
- Tap **Create files**.

<!-- Screenshot Slot 4: Format JSON and All Time settings -->
> [!NOTE]
> *(Screenshot placeholder: Format: JSON, Date Range: All time)*

---

### Step 5: Download & Run Audit
1. You will receive an in-app and email notification when your export file is ready.
2. Download the `.zip` archive.
3. Open **Mutuals Audit** and drop the `.zip` directly into the drop zone!

---

## 🚀 Instant Local Testing

### Method 1: Built-in "Try Sample Data" Button
Open `index.html` in any browser and click the **"Try Sample Data"** button in the upload section. It loads a 15-following / 10-follower dataset instantly so you can test filtering, sorting, whitelisting, Speed Queue, and CSV export.

### Method 2: Test with `test_export.zip`
The repository includes a ready-made [`test_export.zip`](test_export.zip) containing:
- `connections/followers_and_following/following.json` (15 accounts)
- `connections/followers_and_following/followers_1.json` (8 accounts)
- `connections/followers_and_following/followers_2.json` (2 accounts)
- `connections/followers_and_following/following_hashtags.json` (verified to be ignored)

Drag and drop `test_export.zip` into the app drop zone to see realistic multi-part archive decompression in action!

---

## 🌐 Deploying to GitHub Pages (Free Hosting)

Since Mutuals Audit is 100% static client-side code, it requires zero build configuration:

1. **Create a GitHub Repository:**
   - Create a new repository on GitHub (e.g. `mutuals-audit`).
2. **Push the Files:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Mutuals Audit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/mutuals-audit.git
   git push -u origin main
   ```
3. **Enable GitHub Pages:**
   - Go to your repository on GitHub.
   - Click **Settings** &rarr; **Pages** (under Code and automation in the left sidebar).
   - Under **Build and deployment** &rarr; **Source**, select **Deploy from a branch**.
   - Under **Branch**, choose `main` and folder `/(root)`, then click **Save**.
4. **Live URL:**
   - In 1–2 minutes, your site will be live at `https://<your-username>.github.io/mutuals-audit/`!

---

## 🔒 Security & Privacy Architecture

- **Zero Data Ingestion:** No data is stored on any server. All processing is transient in client RAM.
- **XSS Immunity:** Profile usernames and dates are inserted via standard DOM text nodes (`textContent`), strictly avoiding `innerHTML` vulnerabilities.
- **Protocol Validation:** Profile links are checked against explicit `https://` or `instagram://` schemas before attaching to DOM nodes.
- **No Third-Party Trackers:** No Google Analytics, tracking cookies, or external ad scripts.

---

## 📄 License
MIT License. Open source, freely adaptable, and privacy guaranteed.
