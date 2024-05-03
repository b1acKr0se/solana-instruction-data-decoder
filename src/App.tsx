import { useEffect, useState } from "react";
import "./App.css";
import defaultIdl from "./default-idl.json";
import * as anchor from "@coral-xyz/anchor";
import { ReadOnlyWallet } from "./wallet";
window.Buffer = window.Buffer || require("buffer").Buffer;

(anchor.BN.prototype as any).toJSON = function () {
  return this.toString();
};

function App() {
  const [idl, setIdl] = useState(JSON.stringify(defaultIdl, null, 2));
  const [data, setData] = useState("");
  const [decoded, setDecoded] = useState("");

  const handleIdlChange = (event: any) => {
    setIdl(event.target.value);
  };

  const handleDataChange = (event: any) => {
    setData(event.target.value);
  };

  const tryDecode = (idl: any, data: any) => {
    try {
      const coder = new anchor.BorshCoder(JSON.parse(idl) as anchor.Idl);
      const ixResult = coder.instruction.decode(data);

      if (ixResult) {
        return ixResult;
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const coder = new anchor.BorshCoder(JSON.parse(idl) as anchor.Idl);
      const ixResult = coder.instruction.decode(data.slice(8));

      if (ixResult) {
        return ixResult;
      }
    } catch (e) {
      console.error(e);
    }

    const program = new anchor.Program(
      JSON.parse(idl) as anchor.Idl,
      "11111111111111111111111111111111",
      new anchor.AnchorProvider(
       new anchor.web3.Connection("https://api.devnet.solana.com"),
        new ReadOnlyWallet(),
        {}
      )
    );
    try {
      const eventResult = program.coder.events.decode(data);
      if (eventResult) {
        return eventResult;
      }
    } catch (e) {
      console.error(e);
    }
    throw new Error(`Cannot decode data`);
  };

  useEffect(() => {
    try {
      if (!idl || !data) return;
      const result = tryDecode(idl, data);
      if (result) {
        setDecoded(
          JSON.stringify(
            {
              name: result.name,
              data: result.data,
            },
            null,
            2
          )
        );
      } else {
        throw new Error(`Cannot decode data`);
      }
    } catch (e) {
      console.error(e);
      setDecoded(`Error parsing data`);
    }
  }, [idl, data]);

  return (
    <div className="container">
      <div className="row">
        <label htmlFor="idl">IDL</label>
        <textarea id="idl" value={idl} onChange={handleIdlChange}></textarea>
      </div>
      <div className="row">
        <label htmlFor="data">Data</label>
        <textarea id="data" value={data} onChange={handleDataChange} />
      </div>
      <div className="row">
        <label htmlFor="decoded">Decoded</label>
        <textarea id="decoded" value={decoded} readOnly />
      </div>
    </div>
  );
}

export default App;
