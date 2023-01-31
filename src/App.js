import { useEffect } from "react";
import "./App.css";
import useHBARStore from "./hbarStore";

function App() {
  const hbarWalletState = useHBARStore((state) => state.hbarWalletState);
  const hbarWalletConnect = useHBARStore((state) => state.getHABRWalletConnect);
  const createHbarToken = useHBARStore((state) => state.hbarCreateToken);
  const associateHbarToken = useHBARStore((state) => state.associateHbarToken);
  const sendHbarToken = useHBARStore((state) => state.sendHbarToken);

// console.log('Trand id;', hbarWalletState.get.success.data)


// console.log(hbarWalletState.get.success.data === 'null' ? hbarWalletState.get.success.data?.accountId : hbarWalletState.get.success.data?.accountId);
  const connectWallet = () => {
    hbarWalletConnect();
  };

  console.log(hbarWalletState.get)

  const createToken = async () => {
    const network = hbarWalletState.get.success.data.network;
    const accountId = hbarWalletState.get.success.data.accountId;
    const topic = hbarWalletState.get.success.data.topic;
  
    await createHbarToken({ topic, accountId, network });
  }

  const associateTokenId = async() => {
    const network = hbarWalletState.get.success.data.network;
    const accountId = hbarWalletState.get.success.data.accountId;
    const topic = hbarWalletState.get.success.data.topic;
    const transId = hbarWalletState.get.success.data.transId
    await associateHbarToken({ topic, accountId, network, transId })
  }

  const sendToken = async () => {
    const network = hbarWalletState.get.success.data.network;
    const accountId = hbarWalletState.get.success.data.accountId;
    const topic = hbarWalletState.get.success.data.topic;

    const generatedId = hbarWalletState.get.success.data.generatedId
    console.log(network, accountId, topic, generatedId);
    await sendHbarToken({ topic, accountId, network, generatedId })
    console.log('send Token');
  }

  return (
    <div className="App">
      <header className="App-header">
        <button className="App-btn-connect" onClick={() => connectWallet()}>
          Connect to wallet
        </button>
        <button className="App-btn-create" onClick={() => createToken()}>
          Create Token
        </button>
        <button className="App-btn-associate" onClick={() => associateTokenId()}>
          Associate Token
        </button>
        <button className="App-btn-send" onClick={() => sendToken()}>
            Send Token
        </button>
      </header>
    </div>
  );
}

export default App;
