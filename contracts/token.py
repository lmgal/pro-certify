import smartpy as sp

FA2 = sp.io.import_template("fa2_lib.py")

class OrganizationTransfer:
    """
        (Transfer Policy) Only the organization, the first holder, is allowed
        to transfer tokens. Also allow holders to burn their tokens.
    """

    def init_policy(self, contract):
        self.name = 'org-transfer',
        self.supports_transfer = True
        self.supports_operator = False
        contract.update_initial_storage(
            token_organizations=sp.big_map(
                tkey=sp.TNat, tvalue=sp.TAddress
            )
        )

    def check_tx_transfer_permissions(self, contract, from_, to_, token_id):
        sp.verify(
            (contract.data.token_organizations[token_id] == from_) | (from_ == to_),
            "PROCERT_ILLEGAL_TRANSFER",
        )

    def check_operator_update_permissions(self, contract, operator_permission):
        pass

    def is_operator(self, contract, operator_permission):
        return False


class Fa2Cert(FA2.Admin, FA2.Fa2Nft):
    def __init__(self, admin, metadata, **kwargs):
        FA2.Fa2Nft.__init__(self, metadata, policy=OrganizationTransfer(), **kwargs)
        FA2.Admin.__init__(self, admin)

    @sp.entry_point
    def mint(self, batch):
        """ Admin can mint new tokens. Track the first owner """
        sp.set_type(
            batch,
            sp.TList(
                sp.TRecord(
                    to_=sp.TAddress,
                    metadata=sp.TMap(sp.TString, sp.TBytes),
                ).layout(("to_", "metadata"))
            ),
        )
        sp.verify(self.is_administrator(sp.sender), "FA2_NOT_ADMIN")
        with sp.for_("action", batch) as action:
            token_id = sp.compute(self.data.last_token_id)
            metadata = sp.record(token_id=token_id, token_info=action.metadata)
            self.data.token_metadata[token_id] = metadata
            self.data.ledger[token_id] = action.to_
            self.data.last_token_id += 1
            self.data.token_organizations[token_id] = action.to_

    @sp.entry_point
    def burn(self, batch):
        """Users can burn tokens if they have the transfer policy permission.

        Burning an nft destroys its metadata.
        """
        sp.set_type(
            batch,
            sp.TList(
                sp.TRecord(
                    from_=sp.TAddress,
                    token_id=sp.TNat,
                    amount=sp.TNat,
                ).layout(("from_", ("token_id", "amount")))
            ),
        )
        sp.verify(self.policy.supports_transfer, "FA2_TX_DENIED")
        with sp.for_("action", batch) as action:
            sp.verify(self.is_defined(action.token_id), "FA2_TOKEN_UNDEFINED")
            self.policy.check_tx_transfer_permissions(
                self, action.from_, action.from_, action.token_id
            )
            with sp.if_(action.amount > 0):
                sp.verify(
                    (action.amount == sp.nat(1))
                    & (self.data.ledger[action.token_id] == action.from_),
                    message="FA2_INSUFFICIENT_BALANCE",
                )
                # Burn the token
                del self.data.ledger[action.token_id]
                del self.data.token_metadata[action.token_id]
                del self.data.token_organizations[action.token_id]

    

@sp.add_test(name = "Non Fungible Token")
def test():
    scenario = sp.test_scenario()
    admin = sp.test_account("admin")
    org = sp.test_account("org")
    user1 = sp.test_account("user1")
    user2 = sp.test_account("user2")

    scenario.h1("ProCertify NFT Contract")
    contract = Fa2Cert(admin.address, metadata=sp.utils.metadata_of_url("ipfs://QmW8jPMdBmFvsSEoLWPPhaozN6jGQFxxkwuMLtVFqEy6Fb"))
    scenario += contract

    # Org mints a token
    scenario.h2("Mint token")
    scenario += contract.mint(sp.list([
        sp.record(
            to_=org.address,
            metadata=sp.map({sp.string("name"): sp.utils.bytes_of_string("token1")}),
        )])
    ).run(sender=admin)

    # Org transfers token to user1
    scenario.h2("Transfer token from org")
    scenario += contract.transfer(sp.list([sp.record(from_=org.address, txs=sp.list([
        sp.record(to_=user1.address, token_id=sp.nat(0), amount=sp.nat(1))
    ]))])).run(sender=org)

    # User1 tries to transfer token to user2
    scenario.h2("Transfer token from user1")
    scenario += contract.transfer(sp.list([sp.record(from_=user1.address, txs=sp.list([
        sp.record(to_=user2.address, token_id=sp.nat(0), amount=sp.nat(1))
    ]))])).run(sender=user1, valid=False)

    # User1 burns token
    scenario.h2("Burn token from user1")
    scenario += contract.burn(sp.list([
        sp.record(from_=user1.address, token_id=sp.nat(0), amount=sp.nat(1))
    ])).run(sender=user1)