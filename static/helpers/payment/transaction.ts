import { utils } from "ethers";

type TxParameters = {
  provider: any;
  from: string;
  to: string;
  amount: number;
  onHash: (hash: string) => void;
  data?: any;
};



export const send = async ({
  provider,
  from,
  to,
  amount,
  onHash = () => {},
  data,
}: TxParameters) => {

  const tx = {
    from,
    to,
    value: utils.parseUnits(String(amount), "ether").toHexString(),
    data,
  };

  try {
    return await provider.eth.sendTransaction(tx).on("transactionHash", (hash: string) => onHash(hash));
  } catch (error) {
    console.group("%c send", "color: red;");
    console.error(error);
    console.groupEnd();
    throw error;
  }
};
