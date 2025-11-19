<h1 align="center">nf-neuro Documentation</h1>

<p align="center">
<img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/nf-neuro/website/deploy.yml?style=for-the-badge&labelColor=363a4f&color=8aadf4">
</p>

## How to contribute to the `nf-neuro` documentation.

### Using the VSCode devcontainer.

First, clone the repository:
```bash
git clone https://github.com/nf-neuro/website.git
```
Then, open the repository in VS Code and select open in container. VS Code will open a `Simple Browser` tab previewing your local changes. You are all set!

### From source.

To build the website locally, you need to install the `npm` package manager and `Node.js`. If you do not have it installed, follow the instructions on the official website: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm.
Once installed, git clone the `nf-neuro-documentation` repo and `cd` into it:
```bash
git clone https://github.com/nf-neuro/website.git
cd nf-neuro-documentation/
```
Use `npm` to install the required dependencies:
```bash
npm install
```
Then, to preview the changes on the website in real-time, run:
```bash
npm run dev
```
Open the `localhost` link that appeared in your terminal, it should open a browser with a preview of the website. Each time you save a file, the website will update according to your changes.

### GitHub API Authentication

The `PipelineCard` component fetches data from the GitHub API (repository information, README content, logos, and topics). **Without authentication, you'll quickly hit GitHub's rate limit (60 requests/hour).**

To avoid rate limiting, you need to set up a GitHub Personal Access Token:

#### 1. Create a GitHub Personal Access Token

1. Go to GitHub Settings → [Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "nf-neuro-docs-local")
4. Select scopes: **Only `public_repo` is needed** (read access to public repositories)
5. Click "Generate token" and copy the token (you won't see it again!)

#### 2. Configure Your Environment

**For local development (VSCode devcontainer or from source):**

Create a `.env` file in the root of the project:

```bash
GITHUB_TOKEN=your_github_token_here
```

**Important:** The `.env` file is gitignored, so your token won't be committed.

**For GitHub Actions deployment:**

The token is already configured as a repository secret. No action needed.

#### 3. Rate Limits

- **Without token:** 60 requests/hour per IP
- **With token:** 5,000 requests/hour

The authenticated rate limit is more than sufficient for local development and builds.

## Github pages deployment

The documentation website is deployed on [nf-neuro.github.io](https://nf-neuro.github.io). To do so, the `github workflow` must run on the [main nf-neuro repository](https://github.com/nf-neuro/modules). It is achieved using the `deploy.yml` **callable workflow** located in this repository and calling it in workflows located in the nf-neuro main repository. This way, the workflow runs in the correct context and can deploy correctly to the prescribed endpoint.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
