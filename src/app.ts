#!/usr/bin/env node
// The above line is needed to be able to run in npx and CI.

import yargs from 'yargs';

import { createSignature } from './create';
import { deleteSignature } from './delete';
import { updateSignature } from './update';

yargs
  .scriptName('a-mail-signature')
  .command({
    command: 'create [path] [name]',
    aliases: ['c', 'add', 'a'],
    describe: 'Create a signature from an HTML file',
    handler: (args: { path: string; name: string }) => {
      createSignature(args.path, args.name);
    },
  })
  .command({
    command: 'update [path] [name]',
    aliases: ['u', 'modify', 'm'],
    describe: 'Update a signature from an HTML file',
    handler: (args: { path: string; name: string }) => {
      updateSignature(args.path, args.name);
    },
  })
  .command({
    command: 'delete [name]',
    aliases: ['d', 'remove', 'rm', 'r'],
    describe: 'Delete an existing mail signature',
    handler: (args: { name: string }) => {
      deleteSignature(args.name);
    },
  })
  .wrap(100)
  .demandCommand(2)
  .help().argv;
