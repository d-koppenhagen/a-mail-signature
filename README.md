# a-mail-signature

[![npm](https://img.shields.io/npm/v/a-mail-signature.svg)](https://www.npmjs.com/package/a-mail-signature)
[![Dependency Status](https://david-dm.org/d-koppenhagen/a-mail-signature.svg)](https://david-dm.org/d-koppenhagen/a-mail-signature)
[![devDependency Status](https://david-dm.org/d-koppenhagen/a-mail-signature/dev-status.svg)](https://david-dm.org/d-koppenhagen/a-mail-signature?type=dev)

[![npm](https://img.shields.io/npm/l/a-mail-signature.svg)](https://www.npmjs.com/package/a-mail-signature)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=102)](https://github.com/ellerbrock/open-source-badge/)

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)

Generate and modify Apple Mail E-Mail signatures via `npx`.

![a-mail-signature](https://raw.githubusercontent.com/d-koppenhagen/a-mail-signature/master/assets/a-mail-signature.png)

> IMPORTANT NOTE: Currently this tool works just if your Apple Mail base directory is located in `~/Library/Mail`.
> However Apple started to containerize the App and on some machines Apple Mail is now part of an app container located in `~/Library/Containers/com.apple.mail` and cannot be modified (at least I don't know how yet).
> I am working on finding out a way to achive modifying the signatures even in the containerized installation..

## Usage

> Be sure Apple Mail is closed before updateing the signatures

simply execte the `a-mail-signature` CLI by using `npx`:

```bash
npx a-mail-signature <option>
```

For example:

```bash
npx a-mail-signature create "My Default Signature" template.html
npx a-mail-signature modify "My Default Signature" template2.html
npx a-mail-signature delete "My Default Signature"
```

You can also install the CLI globally and execute `a-mail-signature` after that:

```bash
npm i -g a-mail-signature
a-mail-signature <option>
```

E-Mail signatures will be defined as HTML.

> Note: all CSS styles must be either inlined or provided inside the `<style></style>` tag.
> An external reference to a stylesheet using `<style href="style.css">` is not supported.

To check if the template has been added successfully, just open Apple Mail and go to _Mail_ > _Preferences..._ > _Signatures_.

### Options

All options are described in the help prompt:

```bash
npx a-mail-signature --help
```

## Development

To run an test the app locally, simply run `npm start`.

## Building

You can build the app by running: `npm build`.
To clean the build directory run `npm run clean`
