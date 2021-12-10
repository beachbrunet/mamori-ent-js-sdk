import { MamoriService } from '../../dist/api';
import * as https from 'https';
import { PolicyPermission, TIME_UNIT } from '../../dist/permission';

const host = process.env.MAMORI_SERVER || '';
const username = process.env.MAMORI_USERNAME || '';
const password = process.env.MAMORI_PASSWORD || '';
const INSECURE = new https.Agent({ rejectUnauthorized: false });

describe("policy permission tests", () => {

    let api: MamoriService;
    let policy = "policy2";
    let grantee = "apiuser1";

    beforeAll(async () => {
        console.log("login %s %s", host, username);
        api = new MamoriService(host, INSECURE);
        await api.login(username, password);
    });

    afterAll(async () => {
        await api.logout();
    });

    test.skip('grant 01', async done => {
        try {

            let obj = new PolicyPermission()
                .policy(policy)
                .grantee(grantee);

            //make sure no exist
            await obj.revoke(api);

            let filter = {
                "0": ["permissiontype", "equals", "POLICY"],
                "1": ["grantee", "equals", grantee],
                "3": ["policy", "equals", policy]
            };
            let res = await new PolicyPermission().grantee(grantee).list(api, filter);
            console.log("**** %o", res);
            expect(res.totalCount).toBe(0);

            let resp = await obj.grant(api);
            expect(resp.errors).toBe(false);

            res = await new PolicyPermission().grantee(grantee).list(api, filter);
            expect(res.totalCount).toBe(1);

            let resp2 = await obj.grant(api);
            expect(resp2.errors).toBe(true);

            resp = await obj.all(false).revoke(api);
            expect(resp.errors).toBe(false);

            resp = await obj.grant(api);
            expect(resp.errors).toBe(false);

            resp = await obj.all(false).revoke(api);
            expect(resp.errors).toBe(false);

            done();
        } catch (e) {
            done(e);
        }
    });

    test('grant 02', async done => {
        try {
            let resp = await new PolicyPermission()
                .policy(policy)
                .grantee(grantee)
                .withValidFor(60, TIME_UNIT.MINUTES)
                .grant(api);
            expect(resp.errors).toBe(false);

            let filter = [["permissiontype", "equals", "POLICY"],
            ["grantee", "equals", grantee],
            ["policy", "equals", policy],
            ["time_left", ">", 3500]
            ];
            let res = await new PolicyPermission().grantee(grantee).list(api, filter);
            expect(res.totalCount).toBe(1);
            let id = res.data[0].id;
            let r2 = await new PolicyPermission().revokeByID(api, id);
            expect(r2.error).toBe(false);

            res = await new PolicyPermission().grantee(grantee).list(api, filter);
            expect(res.totalCount).toBe(0);

            done();
        } catch (e) {
            done(e);
        }
    });

    test('grant 03', async done => {
        try {
            let obj = await new PolicyPermission()
                .policy(policy)
                .grantee(grantee)
                .withValidBetween("2022-01-01 00:00", "2022-01-15 00:00");

            await obj.revoke(api);

            let resp = await obj.grant(api);
            expect(resp.errors).toBe(false);

            let filter = [["permissiontype", "equals", "POLICY"],
            ["grantee", "equals", grantee],
            ["policy", "equals", policy],
            ["valid_until", "=", '2022-01-14 13:00:00'],
            ["valid_from", "=", '2021-12-31 13:00:00'],
            ];
            let res = await new PolicyPermission().grantee(grantee).list(api, filter);
            expect(res.totalCount).toBe(1);

            let resp2 = await obj.grant(api);
            expect(resp2.errors).toBe(true);

            resp = await obj.all(false).revoke(api);
            expect(resp.errors).toBe(false);

            resp = await obj.grant(api);
            expect(resp.errors).toBe(false);

            resp = await obj.all(false).revoke(api);
            expect(resp.errors).toBe(false);
            done();
        } catch (e) {
            done(e);
        }
    });

});