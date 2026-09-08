# Showcase Custom Domain

The UI Design Agent Kit workflow showcase uses `https://agent.kcos.club/`.
Individual demos stay under `/demos/`; the domain represents the agent workflow,
not a standalone brick-workshop product.

## Configuration

- GitHub repository: `muzimu217/ui-design-agent-kit`.
- Pages publishing source: GitHub Actions, `.github/workflows/product-pages.yml`.
- Pages custom domain: `agent.kcos.club`.
- Cloudflare zone: `kcos.club`.
- DNS record: `CNAME agent -> muzimu217.github.io`, automatic TTL, DNS only.
- Repository variable `PAGES_BASE_PATH`: `/`.
- Repository variable `SHOWCASE_SITE_ORIGIN`: `https://agent.kcos.club`.
- Existing repository variable `PAGES_DEPLOY_ENABLED`: `true`.

The build reads the base path and origin from repository variables. Without those
variables, it retains the standard GitHub Pages repository-path defaults. Origin
validation requires HTTPS and excludes credentials, paths, queries, and fragments.
The root path applies to the showcase, demo mounts, canonical URL, and social image.

The apex domain and other DNS records are outside this site's configuration.
Cloudflare credentials stay local; do not commit them or add them to the static
artifact. A `CNAME` file is not required for GitHub Actions Pages deployments.

## Verification

```sh
gh api repos/muzimu217/ui-design-agent-kit/pages
gh variable list --repo muzimu217/ui-design-agent-kit
dig +short CNAME agent.kcos.club
curl --fail --head https://agent.kcos.club/
curl --fail https://agent.kcos.club/build-manifest.json
```

Check DNS resolution, certificate issuance, HTTPS enforcement, and the actual
deployed release separately. A saved Pages setting does not prove HTTPS is ready.
The published manifest must have `basePath: "/"` and match the deployed commit.
Open the showcase and both `/demos/brick-workshop/` and
`/demos/inventory-console/` in a browser to verify assets and navigation.

## Domain Changes

Claim a replacement domain in GitHub Pages before pointing its DNS at GitHub.
Change the Pages domain and both build variables together, then redeploy and
verify HTTPS. Before disabling Pages or removing its domain, remove or repoint
the matching DNS record so it cannot become a dangling GitHub Pages CNAME.
Never remove or overwrite unrelated DNS records.

References: [GitHub custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
and [Cloudflare DNS records](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/).
