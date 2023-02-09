export default function StorageStyles(options) {
  const { getDesign } = options;
  const _d = getDesign
  
  const getBodyBgImage = () => {
    const bgImage = getDesign('backgroundImage', 'uri')
    if (bgImage) {
      return `
        background-image: url(${bgImage});
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
      `
    } else return ``
  }
  return (
    <style>
      {`
        BODY {
          background: ${getDesign('backgroundColor', 'color')};
        }
        .lotteryHeader {
          background: linear-gradient(
            180deg,
            ${getDesign('headerBgColor1', 'color')} 0%,
            ${getDesign('headerBgColor2', 'color')} 100%
          );
        }
        .lotteryHeader H2 {
          color: ${getDesign('headerTitleColor', 'color')};
        }
        .lotteryHeader DIV[color="text"],
        .lotteryHeader H2[color="text"] {
          color: ${getDesign('baseTextColor', 'color')};
        }
        .lotteryHeader DIV[color="secondary"],
        .lotteryHeader H2[color="secondary"] {
          color: ${getDesign('baseSecondaryColor', 'color')};
        }
        .lotteryHeader DIV[color="textSubtle"],
        .lotteryHeader H2[color="textSubtle"] {
          color: ${getDesign('baseSubTitleColor', 'color')};
        }
        
        .buyTicketHolder {
          background: linear-gradient(
            180deg,
            ${getDesign('buyTicketBgColor1', 'color')} 0%,
            ${getDesign('buyTicketBgColor2', 'color')} 100%
          );
        }
        .buyTicketHolder H2 {
          color: ${getDesign('buyTicketTitleColor', 'color')}
        }
        .buyTicketHolder DIV[color="text"],
        .buyTicketHolder H2[color="text"] {
          color: ${getDesign('baseTextColor', 'color')};
        }
        .buyTicketHolder DIV[color="secondary"],
        .buyTicketHolder H2[color="secondary"] {
          color: ${getDesign('baseSecondaryColor', 'color')};
        }
        .buyTicketHolder DIV[color="textSubtle"],
        .buyTicketHolder H2[color="textSubtle"] {
          color: ${getDesign('baseSubTitleColor', 'color')};
        }
        
        .pricesSection {
          background: linear-gradient(
            139.73deg,
            ${getDesign('priceSectionBgColor1', 'color')} 0%,
            ${getDesign('priceSectionBgColor2', 'color')} 100%
          );
        }
        .pricesSection H2 {
          color: ${getDesign('priceSectionTitleColor', 'color')};
        }
        .pricesSection DIV[color="text"],
        .pricesSection H2[color="text"] {
          color: ${getDesign('baseTextColor', 'color')};
        }
        .pricesSection DIV[color="secondary"],
        .pricesSection H2[color="secondary"] {
          color: ${getDesign('baseSecondaryColor', 'color')};
        }
        .pricesSection DIV[color="textSubtle"],
        .pricesSection H2[color="textSubtle"] {
          color: ${getDesign('baseSubTitleColor', 'color')};
        }
        
        .roundsHistory {
          background: linear-gradient(
            180deg,
            ${getDesign('roundsHistoryBgColor1', 'color')} 0%,
            ${getDesign('roundsHistoryBgColor2', 'color')} 100%
          );
        }
        .roundsHistory H2 {
          color: ${getDesign('roundsHistoryTitleColor', 'color')};
        }
        .roundsHistory DIV[color="text"],
        .roundsHistory H2[color="text"] {
          color: ${getDesign('baseTextColor', 'color')};
        }
        .roundsHistory DIV[color="secondary"],
        .roundsHistory H2[color="secondary"] {
          color: ${getDesign('baseSecondaryColor', 'color')};
        }
        .roundsHistory DIV[color="textSubtle"],
        .roundsHistory H2[color="textSubtle"] {
          color: ${getDesign('baseSubTitleColor', 'color')};
        }
        
        .howToPlay {
          background: ${getDesign('howToPlayBgColor', 'color')};
        }
        .howToPlay H2 {
          color: ${getDesign('howToPlayTitleColor', 'color')};
        }
        .howToPlay DIV[color="text"],
        .howToPlay H2[color="text"] {
          color: ${getDesign('baseTextColor', 'color')};
        }
        .howToPlay DIV[color="secondary"],
        .howToPlay H2[color="secondary"] {
          color: ${getDesign('baseSecondaryColor', 'color')};
        }
        .howToPlay DIV[color="textSubtle"],
        .howToPlay H2[color="textSubtle"] {
          color: ${getDesign('baseSubTitleColor', 'color')};
        }
        
        DIV[color="text"],
        H2[color="text"] {
          color: ${getDesign('baseTextColor', 'color')};
        }
        DIV[color="secondary"],
        H2[color="secondary"] {
          color: ${getDesign('baseSecondaryColor', 'color')};
        }
        DIV[color="textSubtle"],
        H2[color="textSubtle"] {
          color: ${getDesign('baseSubTitleColor', 'color')};
        }
      `}
    </style>
  )
}