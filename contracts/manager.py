import smartpy as sp

class Manager(sp.Contract):
    """
        This contract handles minting and managing ProCertify NFTs
    """
    def __init__(self, token, metadata, admin):
        self.init(
            token=token,
            metadata=metadata,
            admin=admin,
            data=sp.big_map(
                tkey=sp.TNat, 
                tvalue=sp.TRecord(
                    holder=sp.TAddress, 
                    author=sp.TAddress,
                    token_id=sp.TNat
                )
            ),
            token_id=0,
        )

    @sp.entry_point
    def mint(self, params):
        mint_params = sp.TList(
            sp.TRecord(
                to_=sp.TAddress,
                metadata=sp.TMap(sp.TString, sp.TBytes),
            ).layout(("to_", "metadata"))
        )

        token_contract = sp.contract(
            mint_params,
            self.data.token,
            entry_point="mint"
        ).open_some()

        args = [
            sp.record(
                to_=params.to_,
                metadata={ '' : params.metadata }
            )
        ]

        sp.transfer(args, sp.mutez(0), token_contract)

        sp.data.data[self.data.token_id] = sp.record(
            holder=sp.self_address,
            author=params.to_,
            token_id=self.data.token_id
        )

        self.data.token_id += 1

    @sp.entry_point
    def update_admin(self, admin):
        sp.verify(sp.sender == self.data.admin, "NOT_ADMIN")
        self.data.admin = admin

@sp.add_test(name = "Manager")
def test():
    scenario = sp.test_scenario()
    admin = sp.test_account("admin")
    org = sp.test_account("org")