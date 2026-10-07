# De Luisa Bio instance snapshot

Content and media for restoring [deluisa.bio](https://deluisa.bio) **after** you create the instance repo with **GitHub → Fork** on the Open Bio Page upstream.

This folder is **not** a manual fork. Do not copy the whole project into a new empty repo — use GitHub’s Fork button, then restore this snapshot on the fork.

See docs: [GitHub Fork → instance](../../docs/deploy/fork-instance.md)

```bash
# on the GitHub-forked de-luisa-bio clone:
cp instances/deluisa-bio/content/site.json content/site.json
rm -rf content/bios && cp -R instances/deluisa-bio/content/bios content/bios
cp instances/deluisa-bio/public/CNAME public/CNAME
rm -rf public/media && cp -R instances/deluisa-bio/public/media public/media
```
