# NotebookLM platform constraints

Validate the current product and connector at execution time:

- Gemini Notebook Enterprise provides a preview API for notebooks and sources under Google Cloud
  project and location resource names. It uses Google Cloud OAuth/IAM, not a generic NotebookLM API key.
- The source API supports batch-created raw text, Google Drive content, web content and YouTube content,
  plus individual supported file uploads. Supported types and limits can change.
- Adding a source creates an external static copy. Source processing has its own returned status.
- Consumer NotebookLM and Gemini Notebook Enterprise are different products. Enterprise API support
  must not be inferred for a consumer account.
- Source synchronisation and notebook sharing are separate actions. This skill does not make notebooks
  public or grant collaborators access.
- A completed Why Hire Me portfolio exposes its complete disclosure-safe display projection as
  `portfolio.json`. HTML, a website scrape, and the printable résumé are presentation subsets and are
  not equivalent source material for grounded career exploration.
- When a connector rejects `application/json`, a `.txt` file may carry the exact same bytes. Record the
  shared digest so the extension change cannot be mistaken for a transformed or summarised source.

Primary references:

- [Add and manage data sources in a notebook (API)](https://docs.cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs/api-notebooks-sources)
- [Gemini Notebook Enterprise overview](https://docs.cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs/overview)
- [NotebookLM API reference](https://docs.cloud.google.com/gemini/enterprise/docs/reference/rpc/google.cloud.notebooklm.v1alpha)

Treat preview status, endpoints, supported types, quotas, and permissions as connector-discovered
capabilities rather than permanent domain rules.
