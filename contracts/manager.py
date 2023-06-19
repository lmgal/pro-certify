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
                    amount=sp.TMutez, 
                    token_id=sp.TNat, 
                    collectable=sp.TBool
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
        ]
