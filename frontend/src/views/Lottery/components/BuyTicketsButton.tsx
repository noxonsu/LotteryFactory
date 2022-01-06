import React from 'react'
import { Button, useModal, WaitIcon, ButtonProps } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { useLottery } from 'state/lottery/hooks'
import { LotteryStatus } from 'config/constants/types'
import BuyTicketsModal from './BuyTicketsModal/BuyTicketsModal'
import styled from 'styled-components'


interface BuyTicketsButtonProps extends ButtonProps {
  disabled?: boolean
}

const StyledBuyButton = styled(Button)`
  margin-left: 10px;
  margin-right: 10px;
`

const BuyTicketsButton: React.FC<BuyTicketsButtonProps> = ({ disabled, ...props }) => {
  const { t } = useTranslation()
  const [onPresentBuyTicketsModal] = useModal(<BuyTicketsModal />)
  const {
    currentRound: { status },
  } = useLottery()

  const getBuyButtonText = () => {
    if (status === LotteryStatus.OPEN) {
      return t('Buy Tickets')
    }
    return (
      <>
        <WaitIcon mr="4px" color="textDisabled" /> {t('On sale soon!')}
      </>
    )
  }

  return (
    // @ts-ignore
    <StyledBuyButton className='primaryButton' {...props} disabled={disabled} onClick={onPresentBuyTicketsModal}>
      {getBuyButtonText()}
    </StyledBuyButton>
  )
}

export default BuyTicketsButton
