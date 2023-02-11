const PRICE_ENDPOINT = "https://noxon.wpmix.net/cursAll.php";

export const getPrice = async ({
  symbol,
  vsCurrency,
}: {
  symbol: string;
  vsCurrency: string;
}) => {
  try {
    const data = await fetch(
      `${PRICE_ENDPOINT}?fiat=${vsCurrency}&tokens=${symbol}`
    ).then((response) => response.json());

    const currencyData = data?.data?.find?.((currencyData: { symbol: string; }) => currencyData?.symbol === symbol);

    return currencyData.quote[vsCurrency].price;
  } catch (error) {
    console.group("%c getPrice", "color: red;");
    console.error(error);
    console.groupEnd();
    return false;
  }
};
