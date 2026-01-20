# Kaizen UI - Foundations Design Tokens

This package contains the design tokens for the Kaizen UI Foundations library.

## Updating Tokens

To update the design tokens, run the following command:

```bash
pnpm run update-tokens
```

This will fetch the latest design tokens from Figma and save them to the `cache` directory, build the design tokens, and update the documentation. Note that you will need to configure a `.env` file with the following variables:

```bash
FIGMA_ACCESS_TOKEN=
```

See the `.env.example` file.

## Rebuilding Tokens

If you don't need to fetch the latest tokens from Figma, and only need to rebuild the tokens, you can run the following command:

```bash
pnpm run build-tokens
# or
pnpm run build
```

This will build the tokens, generate design token dependent components, and update relevant documentation.
