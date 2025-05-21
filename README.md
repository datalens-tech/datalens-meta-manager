# DataLens Meta Manager

DataLens Meta Manager is a service responsible for executing long-running tasks within the DataLens ecosystem. It uses [Temporal](https://temporal.io/) workflows to manage and orchestrate operations that may take significant time to complete, such as workbook imports and exports.

## Development

### Setup

1. Clone the repository:
```bash
git clone git@github.com:datalens-tech/datalens-meta-manager.git
cd datalens-meta-manager
```

2. Install dependencies:
```bash
npm ci
```

3. Set up environment variables in `.env.development`.

4. Run in development mode:
```bash
npm run dev
```
