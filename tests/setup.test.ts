import * as env from '../src/env';
import { expect, test, describe, it } from 'vitest';
import { codeConfigExists, ibcConfigExists, loadCodeConfig } from '../src/config';
import { getConsumerClient, getConsumerWallet, secretClient } from '../src/clients';


describe('Env, IBC and Contract setup', () => {

    test('Checking environment variables', async () => {
        Object.entries(env).forEach(([key, value]) => {
            expect(value, key + ` in .env file must be specified`).not.toBeUndefined();
            expect(typeof value).toBe('string');
        });
    });

    describe("IBC setup", async () => {
        it("should be configured", async () => {
            expect(ibcConfigExists()).toBe(true);
        })
    })


    describe("Contracts", async () => {   
        expect(codeConfigExists()).toBe(true)
        const codeConfig  = loadCodeConfig();
        
        it("should have consumer client inited", async () => {
            const wallet = await getConsumerWallet();
            const client = await getConsumerClient(wallet);
            expect(client).toBeDefined();
        })
            

        it("should be deployed", async () => {
            const codes = (await secretClient.query.compute.codes({})).code_infos!;
            expect(codes.length).toBeGreaterThan(0);
            const gatewayCode = codes.find(c => 
                Number(c.code_id!) == codeConfig.ics20?.code_id &&
                c.code_hash == codeConfig.ics20.code_hash 
            );
            expect(gatewayCode).toBeDefined();
        })
    })

});
