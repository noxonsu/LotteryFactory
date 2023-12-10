import React, { useEffect, useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import {
  Modal,
  Text,
  Flex,
  HelpIcon,
  BalanceInput,
  Ticket,
  useTooltip,
  Skeleton,
  Button,
  ArrowForwardIcon,
} from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { useWeb3React } from '@web3-react/core'
import tokens from 'config/constants/tokens.lottery'
import * as token from 'config/constants/tokens.lottery'
import { getDecimalAmount, getFullDisplayBalance } from 'utils/formatBalance'
import { BIG_ZERO, ethersToBigNumber } from 'utils/bigNumber'
import { useAppDispatch } from 'state'
import { useLottery } from 'state/lottery/hooks'
import { fetchUserTicketsAndLotteries } from 'state/lottery'
import useTheme from 'hooks/useTheme'
import useTokenBalance, { FetchStatus } from 'hooks/useTokenBalance'
import useApproveConfirmTransaction from 'hooks/useApproveConfirmTransaction'
import { useCake, useLotteryV2Contract } from 'hooks/useContract'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import { estimateGas } from 'utils/calls'
import useToast from 'hooks/useToast'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { ToastDescriptionWithTx } from 'components/Toast'
import ApproveConfirmButtons, { ButtonArrangement } from 'components/ApproveConfirmButtons'
import NumTicketsToBuyButton from './NumTicketsToBuyButton'
import EditNumbersModal from './EditNumbersModal'
import { useTicketsReducer } from './useTicketsReducer'
import BuyTokenButton from '../BuyTokenButton'

const StyledModal = styled(Modal)`
  min-width: 280px;
  max-width: 320px;
`

const ShortcutButtonsWrapper = styled(Flex)<{ isVisible: boolean }>`
  justify-content: space-between;
  margin-top: 8px;
  margin-bottom: 24px;
  display: ${({ isVisible }) => (isVisible ? 'flex' : 'none')};
`

interface BuyTicketsModalProps {
  onDismiss?: () => void
}

enum BuyingStage {
  BUY = 'Buy',
  EDIT = 'Edit',
}

const BuyTicketsModal: React.FC<BuyTicketsModalProps> = ({ onDismiss }) => {
  const { account } = useWeb3React()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const {
    maxNumberTicketsPerBuyOrClaim,
    currentLotteryId,
    currentRound: {
      priceTicketInCake,
      discountDivisor,
      userTickets: { tickets: userCurrentTickets },
    },
  } = useLottery()
  const { callWithGasPrice } = useCallWithGasPrice()
  const [ticketsToBuy, setTicketsToBuy] = useState('')
  const [discountValue, setDiscountValue] = useState('')
  const [totalCost, setTotalCost] = useState('')
  const [ticketCostBeforeDiscount, setTicketCostBeforeDiscount] = useState('')
  const [buyingStage, setBuyingStage] = useState<BuyingStage>(BuyingStage.BUY)
  const [maxPossibleTicketPurchase, setMaxPossibleTicketPurchase] = useState(BIG_ZERO)
  const [maxTicketPurchaseExceeded, setMaxTicketPurchaseExceeded] = useState(false)
  const [userNotEnoughCake, setUserNotEnoughCake] = useState(false)
  const lotteryContract = useLotteryV2Contract()
  const cakeContract = useCake()
  const { toastSuccess } = useToast()
  const { balance: userCake, fetchStatus } = useTokenBalance(tokens.cake.address)
  // balance from useTokenBalance causes rerenders in effects as a new BigNumber is instantiated on each render, hence memoising it using the stringified value below.
  const stringifiedUserCake = userCake.toJSON()
  const memoisedUserCake = useMemo(() => new BigNumber(stringifiedUserCake), [stringifiedUserCake])

  const cakePriceBusd = new BigNumber(token.info().price || 0)
  const dispatch = useAppDispatch()
  const hasFetchedBalance = fetchStatus === FetchStatus.SUCCESS
  const userCakeDisplayBalance = getFullDisplayBalance(userCake, token.info().decimals, 3)

  const TooltipComponent = () => (
    <>
      <Text mb="16px">
        {t(
          'Buying multiple tickets in a single transaction gives a discount. The discount increases in a linear way, up to the maximum of 100 tickets:',
        )}
      </Text>
      <Text>{t('2 tickets: 0.05%')}</Text>
      <Text>{t('50 tickets: 2.45%')}</Text>
      <Text>{t('100 tickets: 4.95%')}</Text>
    </>
  )
  const { targetRef, tooltip, tooltipVisible } = useTooltip(<TooltipComponent />, {
    placement: 'bottom-end',
    tooltipOffset: [20, 10],
  })

  const limitNumberByMaxTicketsPerBuy = useCallback(
    (number: BigNumber) => {
      return number.gt(maxNumberTicketsPerBuyOrClaim) ? maxNumberTicketsPerBuyOrClaim : number
    },
    [maxNumberTicketsPerBuyOrClaim],
  )

  const getTicketCostAfterDiscount = useCallback(
    (numberTickets: BigNumber) => {
      const totalAfterDiscount = priceTicketInCake
        .times(numberTickets)
        .times(discountDivisor.plus(1).minus(numberTickets))
        .div(discountDivisor)
      return totalAfterDiscount
    },
    [discountDivisor, priceTicketInCake],
  )

  const getMaxTicketBuyWithDiscount = useCallback(
    (numberTickets: BigNumber) => {
      const costAfterDiscount = getTicketCostAfterDiscount(numberTickets)
      const costBeforeDiscount = priceTicketInCake.times(numberTickets)
      const discountAmount = costBeforeDiscount.minus(costAfterDiscount)
      const ticketsBoughtWithDiscount = discountAmount.div(priceTicketInCake)
      const overallTicketBuy = numberTickets.plus(ticketsBoughtWithDiscount)
      return { overallTicketBuy, ticketsBoughtWithDiscount }
    },
    [getTicketCostAfterDiscount, priceTicketInCake],
  )

  const validateInput = useCallback(
    (inputNumber: BigNumber) => {
      const limitedNumberTickets = limitNumberByMaxTicketsPerBuy(inputNumber)
      const cakeCostAfterDiscount = getTicketCostAfterDiscount(limitedNumberTickets)

      if (cakeCostAfterDiscount.gt(userCake)) {
        setUserNotEnoughCake(true)
      } else if (limitedNumberTickets.eq(maxNumberTicketsPerBuyOrClaim)) {
        setMaxTicketPurchaseExceeded(true)
      } else {
        setUserNotEnoughCake(false)
        setMaxTicketPurchaseExceeded(false)
      }
    },
    [limitNumberByMaxTicketsPerBuy, getTicketCostAfterDiscount, maxNumberTicketsPerBuyOrClaim, userCake],
  )

  useEffect(() => {
    const getMaxPossiblePurchase = () => {
      const maxBalancePurchase = memoisedUserCake.div(priceTicketInCake)
      const limitedMaxPurchase = limitNumberByMaxTicketsPerBuy(maxBalancePurchase)
      let maxPurchase

      // If the users' max CAKE balance purchase is less than the contract limit - factor the discount logic into the max number of tickets they can purchase
      if (limitedMaxPurchase.lt(maxNumberTicketsPerBuyOrClaim)) {
        // Get max tickets purchasable with the users' balance, as well as using the discount to buy tickets
        const { overallTicketBuy: maxPlusDiscountTickets } = getMaxTicketBuyWithDiscount(limitedMaxPurchase)

        // Knowing how many tickets they can buy when counting the discount - plug that total in, and see how much that total will get discounted
        const { ticketsBoughtWithDiscount: secondTicketDiscountBuy } =
          getMaxTicketBuyWithDiscount(maxPlusDiscountTickets)

        // Add the additional tickets that can be bought with the discount, to the original max purchase
        maxPurchase = limitedMaxPurchase.plus(secondTicketDiscountBuy)
      } else {
        maxPurchase = limitedMaxPurchase
      }

      if (hasFetchedBalance && maxPurchase.lt(1)) {
        setUserNotEnoughCake(true)
      } else {
        setUserNotEnoughCake(false)
      }

      setMaxPossibleTicketPurchase(maxPurchase)
    }
    getMaxPossiblePurchase()
  }, [
    maxNumberTicketsPerBuyOrClaim,
    priceTicketInCake,
    memoisedUserCake,
    limitNumberByMaxTicketsPerBuy,
    getTicketCostAfterDiscount,
    getMaxTicketBuyWithDiscount,
    hasFetchedBalance,
  ])

  /* Check KYC */
  const [ isCheckingKYC, setIsCheckingKYC ] = useState(true)
  const [ isHasKYC, setIsHasKYC ] = useState(false)
  const [ isWalletOkKYC, setIsWalletOkKYC ] = useState(false)
  
  // @ts-ignore
  useEffect(async () => {
    setIsCheckingKYC(true)
    if (account && lotteryContract) {
      try {
        const existKyc = await lotteryContract.existKyc()
        if (existKyc) {
          const isKycOk = await lotteryContract.checkWalletKYC(account)
          console.log('>>>> WALLET KYC IS OK', isKycOk)
          setIsHasKYC(true)
          setIsWalletOkKYC(isKycOk)
          setIsCheckingKYC(false)
        } else {
          setIsHasKYC(false)
          setIsWalletOkKYC(true)
          setIsCheckingKYC(false)
        }
      } catch (err) {
        setIsHasKYC(false)
        setIsWalletOkKYC(true)
        setIsCheckingKYC(false)
        console.log('>>> NO KYC', err)
      }
    }
  }, [ account, lotteryContract ])
  
  useEffect(() => {
    const numberOfTicketsToBuy = new BigNumber(ticketsToBuy)
    const costAfterDiscount = new BigNumber(getTicketCostAfterDiscount(numberOfTicketsToBuy).toFixed(0))
    const costBeforeDiscount = new BigNumber(priceTicketInCake.times(numberOfTicketsToBuy).toFixed(0))
    const discountBeingApplied = costBeforeDiscount.minus(costAfterDiscount)
    setTicketCostBeforeDiscount(costBeforeDiscount.gt(0) ? getFullDisplayBalance(costBeforeDiscount, token.info().decimals) : '0')
    setTotalCost(costAfterDiscount.gt(0) ? getFullDisplayBalance(costAfterDiscount) : '0')
    setDiscountValue(discountBeingApplied.gt(0) ? getFullDisplayBalance(discountBeingApplied, token.info().decimals, 5) : '0')
  }, [ticketsToBuy, priceTicketInCake, discountDivisor, getTicketCostAfterDiscount])

  const getNumTicketsByPercentage = (percentage: number): number => {
    const percentageOfMaxTickets = maxPossibleTicketPurchase.gt(0)
      ? maxPossibleTicketPurchase.div(new BigNumber(100)).times(new BigNumber(percentage))
      : BIG_ZERO
    return Math.floor(percentageOfMaxTickets.toNumber())
  }

  const tenPercentOfBalance = getNumTicketsByPercentage(10)
  const twentyFivePercentOfBalance = getNumTicketsByPercentage(25)
  const fiftyPercentOfBalance = getNumTicketsByPercentage(50)
  const oneHundredPercentOfBalance = getNumTicketsByPercentage(100)

  const handleInputChange = (input: string) => {
    // Force input to integer
    const inputAsInt = parseInt(input, 10)
    const inputAsBN = new BigNumber(inputAsInt)
    const limitedNumberTickets = limitNumberByMaxTicketsPerBuy(inputAsBN)
    validateInput(inputAsBN)
    setTicketsToBuy(inputAsInt ? limitedNumberTickets.toString() : '')
  }

  const handleNumberButtonClick = (number: number) => {
    setTicketsToBuy(number.toFixed())
    setUserNotEnoughCake(false)
    setMaxTicketPurchaseExceeded(false)
  }

  const [updateTicket, randomize, tickets, allComplete, getTicketsForPurchase] = useTicketsReducer(
    parseInt(ticketsToBuy, 10),
    userCurrentTickets,
  )

  const onRequiresApproval = useCallback(async () => {
    try {
      const response = await cakeContract.allowance(account, lotteryContract.address)

      const currentAllowance = ethersToBigNumber(response)
      const currentTotalCost = getDecimalAmount(new BigNumber(totalCost), token.info().decimals)

      const isEnoughAllowance = currentAllowance.gte(currentTotalCost)

      return isEnoughAllowance
    } catch (error) {
      return false
    }
  }, [totalCost, account])

  const { isApproving, isApproved, isConfirmed, isConfirming, handleApprove, handleConfirm } =
    useApproveConfirmTransaction({
      onRequiresApproval: useMemo(() => onRequiresApproval, [totalCost, account]),
      onApprove: () => {
        const totalCostEthBN = ethers.BigNumber.from(getDecimalAmount(new BigNumber(totalCost), token.info().decimals).toString())
        return callWithGasPrice(cakeContract, 'approve', [lotteryContract.address, totalCostEthBN])
      },
      onApproveSuccess: async ({ receipt }) => {
        toastSuccess(
          t('Contract enabled - you can now purchase tickets'),
          <ToastDescriptionWithTx txHash={receipt.transactionHash} />,
        )
      },
      onConfirm: async () => {
        const ticketsForPurchase = getTicketsForPurchase()

        let gasLimit

        try {
          gasLimit = await estimateGas(lotteryContract, 'buyTickets', [currentLotteryId, ticketsForPurchase], 1000)
        } catch (error) {
          console.error('Estimate Gas Error: ', error)
          gasLimit = 100_000 + (220_000 * ticketsForPurchase.length)
        }

        return callWithGasPrice(lotteryContract, 'buyTickets', [currentLotteryId, ticketsForPurchase], { gasLimit })
      },
      onSuccess: async ({ receipt }) => {
        onDismiss()
        dispatch(fetchUserTicketsAndLotteries({ account, currentLotteryId }))
        toastSuccess(t('Lottery tickets purchased!'), <ToastDescriptionWithTx txHash={receipt.transactionHash} />)
      },
    })


  /* --- KYC */
  const getErrorMessage = () => {
    if (userNotEnoughCake) return t(`Insufficient ${token.info().symbol} balance`)
    return t('The maximum number of tickets you can buy in one transaction is %maxTickets%', {
      maxTickets: maxNumberTicketsPerBuyOrClaim.toString(),
    })
  }

  const percentageDiscount = () => {
    const percentageAsBn = new BigNumber(discountValue).div(new BigNumber(ticketCostBeforeDiscount)).times(100)
    if (percentageAsBn.isNaN() || percentageAsBn.eq(0)) {
      return 0
    }
    return percentageAsBn.toNumber().toFixed(2)
  }

  const disableBuying =
    !isApproved ||
    isConfirmed ||
    userNotEnoughCake ||
    !ticketsToBuy ||
    new BigNumber(ticketsToBuy).lte(0) ||
    getTicketsForPurchase().length !== parseInt(ticketsToBuy, 10)

  if (buyingStage === BuyingStage.EDIT) {
    return (
      <EditNumbersModal
        totalCost={totalCost}
        updateTicket={updateTicket}
        randomize={randomize}
        tickets={tickets}
        allComplete={allComplete}
        onConfirm={handleConfirm}
        isConfirming={isConfirming}
        isCheckingKYC={isCheckingKYC}
        isWalletOkKYC={isWalletOkKYC}
        onDismiss={() => setBuyingStage(BuyingStage.BUY)}
      />
    )
  }

  return (
    <StyledModal title={t('Buy Tickets')} onDismiss={onDismiss} headerBackground={theme.colors.gradients.cardHeader}>
      {tooltipVisible && tooltip}
      <Flex alignItems="center" justifyContent="space-between" mb="8px">
        <Text color="textSubtle">{t('Buy')}:</Text>
        <Flex alignItems="center" minWidth="70px">
          <Text mr="4px" bold>
            {t('Tickets')}
          </Text>
          <Ticket />
        </Flex>
      </Flex>
      <BalanceInput
        isWarning={account && (userNotEnoughCake || maxTicketPurchaseExceeded)}
        placeholder="0"
        value={ticketsToBuy}
        onUserInput={handleInputChange}
        currencyValue={
          cakePriceBusd.gt(0) &&
          `~${ticketsToBuy ? getFullDisplayBalance(priceTicketInCake.times(new BigNumber(ticketsToBuy)), token.info().decimals) : '0.00'} ${token.info().symbol}`
        }
      />
      <Flex alignItems="center" justifyContent="flex-end" mt="4px" mb="12px">
        <Flex justifyContent="flex-end" flexDirection="column">
          {account && (userNotEnoughCake || maxTicketPurchaseExceeded) && (
            <Text fontSize="12px" color="failure">
              {getErrorMessage()}
            </Text>
          )}
          {account && (
            <Flex justifyContent="flex-end">
              <Text fontSize="12px" color="textSubtle" mr="4px">
                {token.info().symbol} {t('Balance')}:
              </Text>
              {hasFetchedBalance ? (
                <Text fontSize="12px" color="textSubtle">
                  {userCakeDisplayBalance}
                </Text>
              ) : (
                <Skeleton width={50} height={12} />
              )}
            </Flex>
          )}
        </Flex>
      </Flex>

      {account && !hasFetchedBalance ? (
        <Skeleton width="100%" height={20} mt="8px" mb="24px" />
      ) : (
        <ShortcutButtonsWrapper isVisible={account && hasFetchedBalance && oneHundredPercentOfBalance >= 1}>
          {tenPercentOfBalance >= 1 && (
            <NumTicketsToBuyButton onClick={() => handleNumberButtonClick(tenPercentOfBalance)}>
              {hasFetchedBalance ? tenPercentOfBalance : ``}
            </NumTicketsToBuyButton>
          )}
          {twentyFivePercentOfBalance >= 1 && (
            <NumTicketsToBuyButton onClick={() => handleNumberButtonClick(twentyFivePercentOfBalance)}>
              {hasFetchedBalance ? twentyFivePercentOfBalance : ``}
            </NumTicketsToBuyButton>
          )}
          {fiftyPercentOfBalance >= 1 && (
            <NumTicketsToBuyButton onClick={() => handleNumberButtonClick(fiftyPercentOfBalance)}>
              {hasFetchedBalance ? fiftyPercentOfBalance : ``}
            </NumTicketsToBuyButton>
          )}
          {oneHundredPercentOfBalance >= 1 && (
            <NumTicketsToBuyButton onClick={() => handleNumberButtonClick(oneHundredPercentOfBalance)}>
              MAX
            </NumTicketsToBuyButton>
          )}
        </ShortcutButtonsWrapper>
      )}
      <Flex flexDirection="column">
        <Flex mb="8px" justifyContent="space-between">
          <Text color="textSubtle" fontSize="14px">
            {t('Cost')} ({token.info().symbol})
          </Text>
          <Text color="textSubtle" fontSize="14px">
            {priceTicketInCake && getFullDisplayBalance(priceTicketInCake.times(ticketsToBuy || 0), token.info().decimals)} {token.info().symbol}
          </Text>
        </Flex>
        <Flex mb="8px" justifyContent="space-between">
          <Flex>
            <Text display="inline" bold fontSize="14px" mr="4px">
              {discountValue && totalCost ? percentageDiscount() : 0}%
            </Text>
            <Text display="inline" color="textSubtle" fontSize="14px">
              {t('Bulk discount')}
            </Text>
            <Flex alignItems="center" justifyContent="center" ref={targetRef}>
              <HelpIcon ml="4px" width="14px" height="14px" color="textSubtle" />
            </Flex>
          </Flex>
          <Text fontSize="14px" color="textSubtle">
            ~{discountValue} {token.info().symbol}
          </Text>
        </Flex>
        <Flex borderTop={`1px solid ${theme.colors.cardBorder}`} pt="8px" mb="24px" justifyContent="space-between">
          <Text color="textSubtle" fontSize="16px">
            {t('You pay')}
          </Text>
          <Text fontSize="16px" bold>
            ~{totalCost} {token.info().symbol}
          </Text>
        </Flex>
        {account ? (
          <>
            {isCheckingKYC && (
              <Button disabled={true} width="100%">{`Loading`}</Button>
            )}
            {!isCheckingKYC && !isWalletOkKYC && (
              <Button width="100%">{`Need KYC verify`}</Button>
            )}
            {!isCheckingKYC && isWalletOkKYC && (
              <>
                <ApproveConfirmButtons
                  isApproveDisabled={isApproved || isCheckingKYC}
                  isApproving={isApproving}
                  isConfirmDisabled={disableBuying || isCheckingKYC}
                  isConfirming={isConfirming}
                  onApprove={handleApprove}
                  onConfirm={handleConfirm}
                  buttonArrangement={ButtonArrangement.SEQUENTIAL}
                  confirmLabel={t('Buy Instantly')}
                  confirmId="lotteryBuyInstant"
                />
                {isApproved && (
                  <Button
                    variant="secondary"
                    mt="8px"
                    endIcon={
                      <ArrowForwardIcon
                        ml="2px"
                        color={disableBuying || isConfirming ? 'disabled' : 'primary'}
                        height="24px"
                        width="24px"
                      />
                    }
                    disabled={disableBuying || isConfirming || isCheckingKYC}
                    onClick={() => {
                      setBuyingStage(BuyingStage.EDIT)
                    }}
                  >
                    {t('View/Edit Numbers')}
                  </Button>
                )}
                <BuyTokenButton disabled={isCheckingKYC} width="100%" />
              </>
            )}
          </>
        ) : (
          <ConnectWalletButton />
        )}

        <Text mt="24px" fontSize="12px" color="textSubtle">
          {t(
            '"Buy Instantly" chooses random numbers, with no duplicates among your tickets. Prices are set before each round starts, equal to $5 at that time. Purchases are final.',
          )}
        </Text>
      </Flex>
    </StyledModal>
  )
}

export default BuyTicketsModal
