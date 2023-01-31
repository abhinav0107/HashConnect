import create from "zustand";
import produce from "immer";
import { HashConnect } from "hashconnect";
import {
  PublicKey,
  TokenAssociateTransaction,
  TokenCreateTransaction,
  TransferTransaction,
} from "@hashgraph/sdk";


const INITIAL_WALLET_STATE = {
  get: {
    loading: false,
    success: {
      ok: false,
      data: null,
    },
    failure: {
      error: false,
      message: "",
    },
  },
};

const INITIAL_TOKEN_STATE = {
  get: {
    loading: false,
    success: {
      ok: false,
      data: null,
    },
    failure: {
      error: false,
      message: "",
    },
  },
};

let hashconnect = new HashConnect();

const useHBARStore = create((set, get) => ({
  hbarWalletState: INITIAL_WALLET_STATE,
  getHABRWalletConnect: async () => {
    set(
      produce((state) => ({
        ...state,
        hbarWalletState: {
          ...state.hbarWalletState,
          get: {
            ...INITIAL_WALLET_STATE.get,
            loading: true,
          },
        },
      }))
    );
    try {
      const appMetaData = {
        name: "Hbar Example",
        description: "An Example Hbar App",
        icon: "https://seeklogo.com/images/H/hedera-hashgraph-hbar-logo-FDAEFE75BB-seeklogo.com.png",
      };

      const initData = await hashconnect.init(appMetaData, "testnet", false);

      hashconnect.foundExtensionEvent.once((walletMetadata) => {
        hashconnect.connectToLocalWallet(
          initData.pairingString,
          walletMetadata
        );
      });
      let walletAccountID = "";
      hashconnect.pairingEvent.once((pairingData) => {
        pairingData.accountIds.forEach((id) => {
          walletAccountID = id;
        });
        console.log("wallet ID: ", walletAccountID);
        set(
          produce((state) => ({
            ...state,
            hbarWalletState: {
              ...state.hbarWalletState,
              get: {
                ...INITIAL_WALLET_STATE.get,
                loading: false,
                success: {
                  data: {
                    topic: pairingData.topic,
                    accountId: walletAccountID,
                    network: pairingData.network,
                  },
                  ok: true,
                },
              },
            },
          }))
        );
      });
    } catch (e) {
      set(
        produce((state) => ({
          ...state,
          hbarWalletState: {
            ...state.hbarWalletState,
            get: {
              ...INITIAL_WALLET_STATE.get,
              loading: false,
              success: {
                ok: false,
              },
              failure: {
                error: false,
                message: "Please check your Hashpack Wallet",
              },
            },
          },
        }))
      );
    }
  },
  hbarTokenState: INITIAL_TOKEN_STATE,
  hbarCreateToken: async ({ topic, accountId, network }) => {
    set(
      produce((state) => ({
        ...state,
        hbarTokenState: {
          ...state.hbarTokenState,
          get: {
            ...INITIAL_TOKEN_STATE.get,
            loading: true,
          },
        },
      }))
    );
    try {
      const provider = hashconnect.getProvider(network, topic, accountId);
      const signer = hashconnect.getSigner(provider);

      let accountInfo = await fetch(
        "https://testnet.mirrornode.hedera.com/api/v1/accounts/" + accountId,
        { method: "GET" }
      );
      let account = await accountInfo.json();
      console.log(account);

      let key = PublicKey.fromString(account.key.key);
      console.log(key);

      const createTokenTx = await new TokenCreateTransaction()
        .setTokenName("Metaverse")
        .setTokenSymbol("META")
        .setDecimals(0)
        .setInitialSupply(100)
        .setTreasuryAccountId(accountId)
        .setAdminKey(key)
        .setSupplyKey(key)
        .setWipeKey(key)
        .setAutoRenewAccountId(accountId)
        .freezeWithSigner(signer);

      const createReceipt = await createTokenTx.executeWithSigner(signer);
      console.log("Created Receipt: ", createReceipt);

      let txId = createReceipt.transactionId;
      let respId = txId.replace(/[^\d+]/g, "-");
      let respid = respId.replace("-", ".");
      let transId = respid.replace("-", ".");

      console.log("Transaction Id: ", transId);


      set(
        produce((state) => ({
          ...state,
          hbarWalletState: {
            ...state.hbarWalletState,
            get: {
              ...INITIAL_WALLET_STATE.get,
              loading: false,
              success: {
                data: {
                  network,
                  topic,
                  accountId,
                  transId,
                },
                ok: true,
              },
            },
          },
        }))
      );
    } catch (error) {
      console.log(error);
    }
  },

  associateHbarToken: async ({ topic, accountId, network, transId }) => {
    const provider = hashconnect.getProvider(network, topic, accountId);
    const signer = hashconnect.getSigner(provider);

    console.log(provider)
    console.log(signer)

    console.log("Token Id to Associate", transId);

    try {
      const transactionResponse = await fetch(
        "https://testnet.mirrornode.hedera.com/api/v1/transactions/" + transId
      );

      const resp = await transactionResponse.json();
      console.log("Transaction Response: ", resp);
      const generatedId = resp.transactions[0].entity_id;
      console.log("Token ID: ", generatedId);


      const associateToken = await new TokenAssociateTransaction()
      .setAccountId('0.0.49126304')
      .setTokenIds([generatedId])
      .freezeWithSigner(signer)

      console.log('asscoiated Token', associateToken);

      const associateResp = await associateToken.executeWithSigner(signer);
      console.log(generatedId);
      set(
        produce((state) => ({
          ...state,
          hbarWalletState: {
            ...state.hbarWalletState,
            get: {
              ...INITIAL_WALLET_STATE.get,
              loading: false,
              success: {
                data: {
                  network,
                  topic,
                  accountId,
                  generatedId,
                },
                ok: true,
              },
            },
          },
        }))
      );

    } catch (e) {
      console.log(e)
    }
  },

  sendHbarToken: async ({ topic, accountId, network, tokenId }) => {
    try {
      const provider = hashconnect.getProvider(network, topic, accountId);
      const signer = hashconnect.getSigner(provider);
      console.log(signer);
      console.log(topic);
      console.log(accountId);
      console.log(tokenId);

      const transferTokenTx = await new TransferTransaction()
        .addTokenTransfer('0.0.49266003', "0.0.49126305", -5)
        .addTokenTransfer('0.0.49266003', "0.0.49126304", 5)
        .freezeWithSigner(signer);

      const resp = await transferTokenTx.executeWithSigner(signer);
      console.log("Finally transfered Token", resp);
    } catch (e) {
      console.log(e.message);
    }
  },
}));

export default useHBARStore;
