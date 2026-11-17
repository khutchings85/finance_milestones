# Our Next Chapter — Family Financial Milestones

A lightweight GitHub Pages dashboard for tracking our family's financial milestones and celebration rewards.

## Deploying to GitHub Pages
Open **Settings → Pages** for this repository, choose **Deploy from a branch**, select `main` and `/(root)`, then save.

Expected site URL: https://khutchings85.github.io/finance_milestones/

## Saving progress
Progress saves to your current browser using localStorage. Click **Export JSON** to download a `milestones.json` snapshot. Commit that file to the root of this repository to make it the starting progress on other browsers. Existing local browser changes are never silently overwritten by the published snapshot.

To manually load a newer snapshot into an existing browser, click **Import JSON**. This replaces that browser's saved progress after confirmation.

## Important
GitHub Pages and `milestones.json` are public. Do not add financial account numbers, sensitive balances, credentials, or access tokens. The site doesn't connect to banks or YNAB.

No build dependencies are required.
