# QuocVo Media — warm minimal portfolio

This is a static GitHub Pages portfolio with projects managed through Pages CMS. The redesign keeps the existing CMS configuration and project data file, while refreshing the visual layer with warm ivory, charcoal, and mustard accents.

## Files to publish
- `index.html`, `style.css`, `script.js`: website interface and behavior.
- `content/projects.json`: project records managed by Pages CMS. Keep your existing file if it already contains your projects.
- `.pages.yml`: Pages CMS configuration. Keep your existing file if it is already working.
- `admin/index.html`: shortcut to Pages CMS.
- `uploads/`: media uploaded through CMS, if present in your repository.

## Safe deployment (recommended)
1. Download a backup of your current GitHub repository first.
2. Unzip this package on your computer.
3. In GitHub, replace only `index.html`, `style.css`, and `script.js` with the versions in this package.
4. **Do not overwrite `content/projects.json`, `.pages.yml`, or `uploads/`** if these already contain your CMS records/configuration/media. This package includes the initial versions only as a reference.
5. Commit the changes to the same branch used by GitHub Pages.
6. Wait for Pages to publish, then hard refresh `https://quocvo209.github.io/` (Ctrl+F5).

## How the project data is read
The site fetches `content/projects.json` and renders all entries where `published` is not `false`. Expected fields: `title`, `category`, `description`, `thumbnail`, `video_url`, `year`, and optional `published`. Category labels should match `MV/TVC`, `Ads`, `Social`, or `Reel/TikTok` to work with the category filters.

The hero uses the first published project as its feature, or a project with `featured: true` if you add that field manually. If it has a thumbnail, it appears in the hero. If it has an embeddable video URL, clicking the hero opens the video player.

## Test before publishing
- Open the site and confirm the warm ivory / charcoal / mustard design is visible.
- Confirm the project count matches the number of published entries in `content/projects.json`.
- Add or edit one test project through Pages CMS and save/commit it; after GitHub Pages publishes, confirm its title and thumbnail appear.
- If the project does not appear, verify that CMS saves to `content/projects.json` in the same branch used by Pages.

Prefer YouTube or Vimeo links for video. Avoid uploading large MP4 files to GitHub.
