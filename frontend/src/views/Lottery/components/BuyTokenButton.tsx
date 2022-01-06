import React from 'react'
import { Button, ButtonProps } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import styled from 'styled-components'


interface BuyTokenButtonProps extends ButtonProps {
  disabled?: boolean
}
const StyledBuyButton = styled(Button)`
  margin-top: 5px;
  margin-bottom: 5px;
`

const BuyTokenButton: React.FC<BuyTokenButtonProps> = ({ disabled, ...props }) => {
  const { t } = useTranslation()
  // @ts-ignore
  const buyTokenLink = window?.SO_LotteryConfig?.buyTokenLink
  // @ts-ignore
  const tokenTitle = window?.SO_LotteryConfig?.token?.symbol
  const onPress = (e) => {
    e.preventDefault()
    window.open(buyTokenLink)
  }


  const getBuyButtonText = () => {
    return t(`Buy ${tokenTitle}`)
  }

  if (!buyTokenLink) return null

  return (
    // @ts-ignore
    <StyledBuyButton className='primaryButton' {...props} disabled={disabled} onClick={onPress}>
      {getBuyButtonText()}
    </StyledBuyButton>
  )
}

export default BuyTokenButton
