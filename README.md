# a-mail-signature

Generate and modify Apple Mail E-Mail signatures

## Usage

simply execte the `a-mail-signature` CLI by using `npx`:

```cli
npx a-mail-signature <option>
```

You can also install the CLI globally and execute `a-mail-signature` after that:

```cli
npm i -g a-mail-signature
a-mail-signature <option>
```

E-Mail signatures will be defined as HTML.

> Note: all CSS styles must be either inlined or provided inside the `<style></style>` tag.
> An external reference to a stylesheet using `<style href="style.css">` is not supported.

### Options

All options are described in the help prompt:

```cli
npx a-mail-signature --help
```

## Development

To run an test the app locally, simply run `npm start`.

## Building

You can build the app by running: `npm build`.
To clean the build directory run `npm run clean`
