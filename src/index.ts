import { prompt } from 'enquirer';
import { newKeystore } from './commands/newKeystore';
import { viewKeystore } from './commands/viewKeystore';

import yargs from 'yargs';
import { Config } from './Config';
import { restoreKeystore } from './commands/restoreKeystore';
import { sendFile } from './commands/sendFile';
import { TonClient } from 'ton';
import { newMnemonics } from './commands/newMnemonics';
import { newPassphrase } from './commands/newPassphrase';
import { writeRawWallet } from './commands/writeRawWallet';
import { downloadTransactions } from './commands/downloadTransactions';
import { openLedger } from './commands/openLedger';

(async () => {
    try {

        // Resolve config
        let parsed = await yargs
            .scriptName("ton-cli")
            .usage('$0 ton-cli [args]')
            .boolean('test')
            .boolean('offline')
            .parseAsync();
        let testnet = parsed.test ? true : false;
        let offline = parsed.offline ? true : false;
        if (process.env.TON_CLI_OFFLINE === 'true') {
            offline = true;
        }
        let client = offline
            ? new TonClient({ endpoint: '' })
            : new TonClient({ endpoint: testnet ? 'https://sandbox.tonhubapi.com/jsonRPC' : 'https://mainnet.tonhubapi.com/jsonRPC' });
        const config: Config = {
            testnet: testnet,
            offline,
            client
        }
        if (config.offline) {
            console.warn('Running in OFFLINE mode');
        }
        if (config.testnet) {
            console.warn('Running in TEST mode');
        }

        let res = await prompt<{ command: string }>([{
            type: 'select',
            name: 'command',
            message: 'Pick command',
            initial: 0,
            choices: [
                { message: 'Open keystore', name: 'open-keystore' },
                { message: 'Create keystore', name: 'new-keystore' },
                { message: 'Restore keystore', name: 'restore-keystore' },
                { message: 'Open Ledger', name: 'open-ledger' },
                { message: 'Send file', name: 'send-file', hint: 'Send BOC file to network' },
                { message: 'Generate secure mnemonics', name: 'new-mnemonics' },
                { message: 'Generate secure passphrase', name: 'new-passphrase' },
                { message: 'Write raw wallet for TON node', name: 'write-wallet' },
                { message: 'Download address history', name: 'download' }
            ]
        }]);
        if (res.command === 'new-keystore') {
            await newKeystore(config);
        }
        if (res.command === 'open-keystore') {
            await viewKeystore(config);
        }
        if (res.command === 'restore-keystore') {
            await restoreKeystore(config);
        }
        if (res.command === 'send-file') {
            await sendFile(config);
        }
        if (res.command === 'new-mnemonics') {
            await newMnemonics(config);
        }
        if (res.command === 'new-passphrase') {
            await newPassphrase(config);
        }
        if (res.command === 'write-wallet') {
            await writeRawWallet(config);
        }
        if (res.command === 'download') {
            await downloadTransactions(config);
        }
        if (res.command === 'open-ledger') {
            await openLedger(config);
        }
    } catch (e) {
        console.warn(e);
    }
})();