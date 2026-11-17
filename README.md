# Our Next Chapter — family financial milestones

Live website: https://khutchings85.github.io/finance_milestones/

GitHub Pages hosts the static site. It can optionally sync the six milestone records through **Firebase Firestore**. Without Firebase configuration, the original browser-only progress controls still work.

## One-time Firebase setup

1. In [Firebase Console](https://console.firebase.google.com/), open your **finance-milestones** project.
2. In **Project settings → Your apps**, register a **Web app** and copy the `firebaseConfig` values.
3. In this repository, edit `firebase-config.js`: replace `null` with the copied JavaScript object.
4. In Firebase Console, open **Build → Firestore Database**, create a database (free/Spark tier is sufficient at this scale).
5. Open **Firestore Database → Rules**, replace the rules with the contents of `firestore.rules`, and **Publish**. **Do not** leave the test-mode permissive rules in place.
6. In **Build → Authentication → Sign-in method**, enable **Google**.
7. In **Authentication → Settings → Authorized domains**, add `khutchings85.github.io`.
8. Open the live site and sign in once with each adult's Google account. Their **Firebase Authentication UIDs** will be displayed on the page. These UIDs are not secrets.
9. Replace the two `REPLACE_WITH_..._UID` values in the rules with those UIDs, and **Publish** the rules again.
10. Add the same UIDs to `editorUids` in `firebase-config.js` and commit the file. Signed-in approved accounts can now edit progress. Others can read it.
11. If you already updated milestones on your computer, sign in and click **Import this browser's progress** once. This publishes all six milestone values. Other devices synchronize automatically.

**Security:** The Firebase web app config can be public; it is not an admin key. Write access is controlled by your deployed Firestore rules (and the optional client allowlist improves the interface). This site and data are publicly readable. Do not store private financial details.

**Progress:** When Firebase is not configured, the site saves to `localStorage`. When Firebase is configured, it uses Firestore as the source of truth and disables local editing for unauthorized users. Previously saved local data is never uploaded automatically. Use the explicit import button if desired.

**Troubleshooting:** If you can sign in but can't edit, check the UID in the site and both allowlists. If updates fail with "Permission denied," check that Firestore rules were published. If Google sign-in fails, check the authorized domain.

The **Export JSON** button is still available for backups. GitHub's `milestones.json` remains a historical starter snapshot; Firestore is used for live syncing after setup.
