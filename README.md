# QuocVo Portfolio — Minimal refresh

This is a static GitHub Pages portfolio with project content managed through Pages CMS.

## Files
- `index.html`, `style.css`, `script.js`: portfolio interface.
- `content/projects.json`: project records rendered by the site.
- `.pages.yml`: Pages CMS configuration.
- `admin/index.html`: helper page linking to the hosted CMS.
- `uploads/`: image upload destination for CMS.

## Publish to GitHub Pages
1. Download and unzip this package.
2. In your existing `quocvo209.github.io` GitHub repository, upload/replace the files from this package in the repository root. Keep the `.pages.yml` file (GitHub's web uploader may hide dotfiles; if so, add it separately using Add file → Create new file and name it `.pages.yml`).
3. Commit changes to the same branch that currently publishes the site.
4. Wait for GitHub Pages to deploy, then check `https://quocvo209.github.io`.

**Important:** Make a backup or download the current repository before replacing files. Do not upload the ZIP itself as a replacement for the website.

## Connect Pages CMS
1. Open https://app.pagescms.org/ and sign in with GitHub.
2. Install the Pages CMS GitHub App and grant access only to your portfolio repository.
3. Open the `quocvo209.github.io` repository and choose the publishing branch (usually `main`).
4. Pages CMS reads `.pages.yml`. Open **Portfolio projects** to edit the project list.
5. Add a project with title, category, description, cover image, video URL, and year. Set **Show on website** to true, then save/commit.
6. Visit `https://quocvo209.github.io/admin/` for the CMS shortcut.

The CMS requires a one-time GitHub App permission setup. This package does not contain or require GitHub passwords or access tokens.

## Add a video project
- Category should be exactly `MV/TVC`, `Ads`, `Social`, or `Reel/TikTok` so the filters work.
- Prefer YouTube or Vimeo URLs for video. Do not upload large MP4 files into GitHub.
- Add an image under Cover image; the CMS stores uploaded media under `uploads/`.
- If you don't want a project public, set **Show on website** to false.
- Avoid adding projects with a demo/fake video URL; add only work you are allowed to display publicly.

## Notes
- The project list starts empty to avoid publishing placeholder/fake work. The portfolio will show a prompt to add your first project until you add entries in CMS.
- Contact email currently retained from the original project: `quoctuanvo209@gmail.com`.
- This is a static site. Contact email opens the visitor's email app; no backend contact form is included.
