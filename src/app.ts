#!/usr/bin/env node
// The above line is needed to be able to run in npx and CI.

import yargs from 'yargs';

import { createSignature } from './create';
import { deleteSignature } from './delete';
import { updateSignature } from './update';
import { log, logWarn, green, red, orange } from './utils/log';

log(`${red('                __')}
${red('               | _]')}
${red('            .--||---------.')}
${red('            |  ||         |')}
${red('            |  ||         |')}
${red('        ____|__||_________|')}
                     ${orange('\\  |')}
 __________________   ${orange('\\ |')}
| ^^^^           []|   ${orange('||')}
| ^^^              |   ${orange('||')}
|                  |   ${orange('||')}
| ${green('a-mail-signature')} |   ${orange('||')}
'------------------'   ${orange('||')}
                       ${orange('||')}
                       ${orange('||')}
${green('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^')}
`);
logWarn(`Be sure Apple Mail is closed to prevent re-writing issues.
You can start Apple Mail once you finished modifying your signatures.
`);

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
