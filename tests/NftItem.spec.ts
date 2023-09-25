import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano, Dictionary, beginCell } from 'ton-core';
import { NftItem } from '../wrappers/NftItem';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import { randomAddress } from '@ton-community/test-utils';
import { buildCollectionContentCell, setItemContentCell, toSha256, toTextCell } from '../scripts/collectionContent/onChain';

describe('NftItem', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('NftItem');
    });

    let blockchain: Blockchain;
    let nftItem: SandboxContract<NftItem>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        nftItem = blockchain.openContract(NftItem.createFromConfig({
            index: 0, 
            collectionAddress: randomAddress(),
            ownerAddress: randomAddress(),
            nextonAddress: randomAddress(),
            itemContent: beginCell()
            .storeUint(0,8)  // onchain prefix
            .storeDict(Dictionary.empty(Dictionary.Keys.BigUint(256), Dictionary.Values.Cell())
            .set(toSha256("name"), toTextCell("Item name"))
            .set(toSha256("description"), toTextCell("Item description"))
            .set(toSha256("image"), toTextCell(" ")))
            .endCell()
        }, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await nftItem.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: nftItem.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and nftItem are ready to use
    });
});
