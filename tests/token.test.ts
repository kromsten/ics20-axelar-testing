import { test, describe, beforeAll, assert } from 'vitest';
import { loadContractConfig, loadIbcConfig } from '../src/config';
import { getConsumerClient, getConsumerWallet, secretClient, secretWallet } from '../src/clients';
import { SigningStargateClient } from "@cosmjs/stargate"
import { toBinary } from '@cosmjs/cosmwasm-stargate';


describe('IBC Token transfering tests', () => {
    
    let consumerAddress : string;
    let consumerClient : SigningStargateClient;

    const ibcConfig = loadIbcConfig();
    const contractConfig = loadContractConfig();

    const ics20 = contractConfig.ics20!;
    const snip20 = contractConfig.snip20!;


    beforeAll(async () => {
        const wallet = await getConsumerWallet();
        consumerClient = await getConsumerClient();
        
        const accounts = await wallet.getAccounts();
        consumerAddress = accounts[0].address;
        //consumerAddress = "axelar1d9atnamjjhtc46zmzyc202llqs0rhtxnphs6mkjurekath3mkgtq7hsk93"
    });


    test('Sending message with memo', async () => {

        console.log("Consumer Address: ", consumerAddress);

        const transferMsg = {
            channel: ibcConfig.secret_channel_id,
            remote_address: consumerAddress,
            timeout: 150
        }
        const memo ='{"destination_chain": "avalanche", "destination_address": "0x68B93045fe7D8794a7cAF327e7f855CD6Cd03BB8", "payload":null, "type":3}'

        const sendMsg = {
            send: {
                recipient: ics20.address,
                recipient_code_hash: ics20.hash,
                amount: "2",
                msg: toBinary(transferMsg),
                // memo
            }
        }

        const balanceBefore = await consumerClient.getAllBalances(consumerAddress);
        console.log("Consumer balance Before ibc: ", balanceBefore);

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

        const res = await consumerClient.getAllBalances(consumerAddress);
        console.log("Consumer balance After ibc: ", res);
        // Tomimeout due to no relayers
        // await sleep(10000);

    });


});
