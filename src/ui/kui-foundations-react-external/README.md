# Kaizen UI React

React implementation of the Kaizen UI Design System. Styles provided by `@kui/foundations-css`.

## Scripts

| Script                   | Description                                           |
| ------------------------ | ----------------------------------------------------- |
| `pnpm run dev`           | Start development storybook server                    |
| `pnpm run build`         | Build package and storybook                           |
| `pnpm run test`          | Run tests in all browsers (Chromium, Firefox, WebKit) |
| `pnpm run test:chromium` | Run tests in Chromium only                            |
| `pnpm run test:firefox`  | Run tests in Firefox only                             |
| `pnpm run test:webkit`   | Run tests in WebKit/Safari only                       |

All tests are automatically executed in parallel for maximum performance via Jest configuration.

## Visual Testing

KUI React includes comprehensive visual testing capabilities with multi-browser support. For detailed information, see [Visual Testing Documentation](./docs/VISUAL_TESTING.md).

## Component Guidelines

### Prop Naming

For props conflicting with HTML attributes:

- If type and behavior match HTML attribute: Use HTML name (e.g., `disabled`)
- Otherwise: Use different name (e.g., `onValueChange` instead of `onChange`)

### Component Structure

Standard composition pattern:

```tsx
<Root>
	<Content>
		<Header>
			<Heading />
			<Subheading />
		</Header>
		<Main />
		<Footer />
	</Content>
</Root>
```

For Radix components requiring a trigger:

```tsx
<Root>
	<Trigger />
	<Portal>
		<Content>
			<Header>
				<Heading />
				<Subheading />
			</Header>
			<Main />
			<Footer />
		</Content>
	</Portal>
</Root>
```

### Best Practices

1. Match component names to props (e.g., `Heading` → `slotHeading`)
2. Use consistent terminology across components
3. Maintain consistent prop naming patterns

### Example Implementation

```typescript
const Banner = (props) => (
  <BannerRoot kind={props.kind} status={props.status}>
    <BannerContent>
      {props.icon && (
        <BannerIcon>
          {createElement(props.icon, { variant: "fill" })}
        </BannerIcon>
      )}
      <BannerHeader>
        {props.heading && <BannerHeading>{props.heading}</BannerHeading>}
        {props.kind === "header" && props.subheading && (
          <BannerSubheading>{props.subheading}</BannerSubheading>
        )}
      </BannerHeader>
    </BannerContent>
    {props.actions && <BannerActions>{props.actions}</BannerActions>}
    {props.onClose && <BannerCloseButton onClick={props.onClose} />}
  </BannerRoot>
)
```
