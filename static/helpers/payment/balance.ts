import axios from "./axios";

export const getUserUSDValueOfAddress = async (address: string) => {
  try {
    if (!address) throw new Error("Can't fetch empty address");

    const result = await axios.get('/debank', {
      params: {
        address
      }
    });
    return result?.data?.total_usd;
  } catch (error) {
    throw error;
  }
};

const defaulExport = {
    getUserUSDValueOfAddress,
}

export default defaulExport;
