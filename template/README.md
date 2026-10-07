# Template

Blank `content/` and `public/` for a fork. The app does not read this folder. It builds `content/` and `public/` at the repo root. `content/` there is the Open Bio Page demo.

On your fork:

```bash
cp template/content/site.json content/site.json
rm -rf content/bios
cp -R template/content/bios content/bios
cp template/public/CNAME public/CNAME
```

Replace the placeholder names, the hostname in `public/CNAME`, and `content/bios/you.json`. Photos go in `public/media/`. An empty `avatar` draws a letter.

`nameSuffix` is optional. Set it on `site.json` to a shared surname, including the leading space, when the home grid should drop that suffix.
