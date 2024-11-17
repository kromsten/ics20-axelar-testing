import { test, describe, beforeAll, assert } from 'vitest';
import { loadContractConfig, loadIbcConfig } from '../src/config';
import { getConsumerWallet, secretClient, secretWallet } from '../src/clients';
import { toBinary } from '@cosmjs/cosmwasm-stargate';


describe('Token transfeting tests', () => {
    
    let consumerAddress : string;

    const ibcConfig = loadIbcConfig();
    const contractConfig = loadContractConfig();

    const ics20 = contractConfig.ics20!;
    const snip20 = contractConfig.snip20!;


    beforeAll(async () => {
        const wallet = await getConsumerWallet();
        const accounts = await wallet.getAccounts();
        consumerAddress = accounts[0].address;
    });


    test('Sending message no memo', async () => {

        console.log("Consumer Address: ", consumerAddress);

        const transferMsg = {
            channel: ibcConfig.secret_channel_id,
            remote_address: consumerAddress,
            timeout: 150
        }
        const sendMsg = {
            send: {
                recipient: ics20.address,
                recipient_code_hash: ics20.hash,
                amount: "2",
                msg: toBinary(transferMsg),
                // no memo
            }
        }

        const response = await secretClient.tx.compute.executeContract({
            contract_address: snip20.address,
            code_hash: snip20.hash,
            sender: secretWallet.address,
            msg: sendMsg
        }, { gasLimit: 250000 });

        console.log("Res: ", response);

        assert(response.ibcResponses.length > 0, "No IBC response. Error before reaching IBC module");
        const ibcPromise = response.ibcResponses[0]

        console.log("Awaiting for IBC response");
        const ibcRes = await ibcPromise;

        console.log("IBC Response: ", ibcRes);

        // Tomimeout due to no relayers
        // await sleep(10000);

    });


});
