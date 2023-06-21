import smartpy as sp

FA2 = sp.io.import_template("fa2_lib.py")

class Fa2Cert(FA2.Admin, FA2.Fa2Nft):
    def __init__(self, admin, **kwargs):
        FA2.Fa2Nft.__init__(
            self, 
            sp.big_map({
                "name": sp.utils.bytes_of_string("ProCertify NFT"),
                "author": sp.utils.bytes_of_string("Louie Gallos"),
                "description": sp.utils.bytes_of_string("An app for creating and verifying certificates as NFT on the Tezos blockchain."),
            }), 
            policy=FA2.NoTransfer(), 
            **kwargs
        )
        FA2.Admin.__init__(self, admin)
        # Store minters
        self.update_initial_storage(
            minter=sp.big_map(tkey=sp.TNat, tvalue=sp.TAddress)
        )

    @sp.entry_point
    def mint(self, batch):
        """ Anyone can mint tokens. Cannot mint for themselves. """
        sp.set_type(
            batch,
            sp.TList(
                sp.TRecord(
                    to_=sp.TAddress,
                    metadata=sp.TMap(sp.TString, sp.TBytes),
                ).layout(("to_", "metadata"))
            ),
        )
        with sp.for_("action", batch) as action:
            sp.verify(sp.sender != action.to_, "FA2_NO_SELF_MINTING")
            token_id = sp.compute(self.data.last_token_id)
            metadata = sp.record(token_id=token_id, token_info=action.metadata)
            self.data.token_metadata[token_id] = metadata
            self.data.ledger[token_id] = action.to_
            self.data.last_token_id += 1
            self.data.minter[token_id] = sp.sender

    @sp.entry_point
    def burn(self, batch):
        """ 
            Holders can burn their tokens.
            Minters can burn tokens they minted from holders.
            Admin can burn any token.
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

        with sp.for_("action", batch) as action:
            sp.verify(self.is_defined(action.token_id), "FA2_TOKEN_UNDEFINED")
            sp.verify(
                (self.data.ledger[action.token_id] == sp.sender) |
                (self.is_administrator(sp.sender)) |
                (self.data.minter[action.token_id] == sp.sender),
                "FA2_NOT_OWNER_MINTER_ADMIN")
            with sp.if_(action.amount > 0):
                sp.verify(
                    (action.amount == sp.nat(1))
                    & (self.data.ledger[action.token_id] == action.from_),
                    message="FA2_INSUFFICIENT_BALANCE",
                )
                # Burn the token
                del self.data.ledger[action.token_id]
                del self.data.token_metadata[action.token_id]
                del self.data.minter[action.token_id]
                
    @sp.entry_point
    def set_metadata(self, metadata):
        """ Admin can set new metadata """
        sp.verify(self.is_administrator(sp.sender), "FA2_NOT_ADMIN")
        self.data.metadata = metadata

    

@sp.add_test(name = "Non Fungible Token")
def test():
    scenario = sp.test_scenario()
    admin = sp.test_account("admin")
    org = sp.test_account("org")
    user1 = sp.test_account("user1")
    user2 = sp.test_account("user2")

    scenario.h1("ProCertify NFT Contract")
    contract = Fa2Cert(admin.address)
    scenario += contract

    scenario.h2("Org mints a token for user1")
    scenario += contract.mint(sp.list([
        sp.record(
            to_=user1.address,
            metadata=sp.map({sp.string("name"): sp.utils.bytes_of_string("token1")}),
        )])
    ).run(sender=org)

    scenario.h2("User1 tries to transfer token to user2")
    scenario += contract.transfer(sp.list([sp.record(from_=user1.address, txs=sp.list([
        sp.record(to_=user2.address, token_id=sp.nat(0), amount=sp.nat(1))
    ]))])).run(sender=user1, valid=False)

    scenario.h2("User2 tries to burn token from user1")
    scenario += contract.burn(sp.list([
        sp.record(from_=user1.address, token_id=sp.nat(0), amount=sp.nat(1))
    ])).run(sender=user2, valid=False)

    scenario.h2("User1 burns their token")
    scenario += contract.burn(sp.list([
        sp.record(from_=user1.address, token_id=sp.nat(0), amount=sp.nat(1))
    ])).run(sender=user1)

    scenario.h2("Org mints another token for user1")
    scenario += contract.mint(sp.list([
        sp.record(
            to_=user1.address,
            metadata=sp.map({sp.string("name"): sp.utils.bytes_of_string("token1")}),
        )])
    ).run(sender=org)

    scenario.h2("Org burns token from user1")
    scenario += contract.burn(sp.list([
        sp.record(from_=user1.address, token_id=sp.nat(1), amount=sp.nat(1))
    ])).run(sender=org)

    scenario.h2(" User1 mints for user2")
    scenario += contract.mint(sp.list([
        sp.record(
            to_=user2.address,
            metadata=sp.map({sp.string("name"): sp.utils.bytes_of_string("token1")}),
        )])
    ).run(sender=user1)

    scenario.h2("Admin burns token from user2")
    scenario += contract.burn(sp.list([
        sp.record(from_=user2.address, token_id=sp.nat(2), amount=sp.nat(1))
    ])).run(sender=admin)
