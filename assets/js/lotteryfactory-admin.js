/**
 * Admin Scripts
 */
(function( $ ){
	"use strict";

  const getUnixTimeStamp = () => Math.floor(new Date().getTime() / 1000);

  var deployButton    = document.getElementById('lotteryfactory_deploy_button');
  var fetchButton     = document.getElementById('lotteryfactory_fetchcontract_button');
  var fetchStatus     = document.getElementById('lotteryfactory_fetchstatus');
	var loaderOverlay   = document.getElementById('lotteryfactory_loaderOverlay');
  var tokenAddress    = document.getElementById('lottery_token');
  var fetchToken      = document.getElementById('lotteryfactory_fetchtoken_button');
  var lotteryAddress  = document.getElementById('lottery_address');
  var startLottery    = document.getElementById('lotteryfactory_startlottery');
  var closeAndGoDraw  = document.getElementById('lottery_current_close_goto_draw');
  var drawNumbers     = document.getElementById('lotteryfactory_draw_numbers');
  var selectedChain    = document.getElementById('lottery_blockchain');
  var saveWinningPercents = document.getElementById('lottery-winning-percent-save');

  var loaderStatusText = document.getElementById('lotteryfactory_loaderStatus')

  const postId        = document.getElementById('lotteryfactory_post_id').value;

  var numbersCountChange = document.getElementById('lottery_numbers_count_change');

  var getValue = (id) => { return document.getElementById(id).value }
  var setValue = (id, value) => { document.getElementById(id).value = value }
  var setHtml = (id, value) => { document.getElementById(id).innerHTML = value }
  var showBlock = (id) => { document.getElementById(id).style.display = '' }
  var hideBlock = (id) => { document.getElementById(id).style.display = 'none' }
  var showLoader = () => {
    loaderStatusText.innerText = ''
    loaderOverlay.classList.add('visible')
  }
  var setLoaderStatus = (message) => {
    loaderStatusText.innerText = message
  }
  var hideLoader = () => { loaderOverlay.classList.remove('visible') }

  var genSalt = () => {
    var result           = ''
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    for ( var i = 0; i < 128; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
  }

  const langMsg = (msg) => { return msg }

  var getDateDiffText = (dateStart, dateEnd) => {
    var diff = dateEnd - dateStart
 
    var d = Number(diff)
    var h = Math.floor(d / 3600)
    var m = Math.floor(d % 3600 / 60)
    var s = Math.floor(d % 3600 % 60)

    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : ""
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : ""
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : ""
    return hDisplay + mDisplay + sDisplay
  }

  var errMessage = (message) => { alert(message) }
  var getFloat = (id) => {
    var val = document.getElementById(id).value
    try {
      val = parseFloat(val,10)
      return val
    } catch (e) {
      return false
    }
  }
  var getNumber = (id) => {
    var val = document.getElementById(id).value
    try {
      val = parseInt(val,10)
      return val
    } catch (e) {
      return false
    }
  }

  const ajaxSendData = (options) => {
    return new Promise((resolve, reject) => {
      const {
        action,
        data
      } = options

      const ajaxData = {
        action,
        nonce: lotteryfactory.nonce,
        data
      }
      $.post( lotteryfactory.ajaxurl, ajaxData, function(response) {
        if( response.success) {
          resolve(response)
        } else {
          reject(response)
        }
      })
    })
  }

  var setTokenInfo = function (tokenInfo) {
    setHtml('lottery_token_name_view', tokenInfo.name)
    setValue('lottery_token_name', tokenInfo.name)
    setHtml('lottery_token_decimals_view', tokenInfo.decimals)
    setValue('lottery_token_decimals', tokenInfo.decimals)
    setHtml('lottery_token_symbol_view', tokenInfo.symbol)
    setValue('lottery_token_symbol', tokenInfo.symbol)
    showBlock('lottery_token_info')
  }

  lotteryDeployer.init({
		onStartLoading: () => {
			// show loader
			deployButton.disabled = true;
      fetchButton.disabled = true;
      fetchToken.disabled = true;
		},
		onFinishLoading: () => {
			// hide loader
			deployButton.disabled = false;
      fetchButton.disabled = false;
      fetchToken.disabled = false;
		},
		onError: (err) => {
			console.error(err);
			deployButton.disabled = true;
      fetchButton.disabled = true;
      fetchToken.disabled = true;
			alert(err);
		}
	});

  lotteryDeployer
    .setSelectedChain(selectedChain.value)

  const fetchStatusFunc = () => {
    if (fetchStatus.disabled) return
    if (!lotteryAddress.value) return errMessage('No lottery address!')

    fetchStatus.disabled = true
    showLoader()
    setLoaderStatus( langMsg( 'Fetch lottery status' ) )
    lotteryDeployer
      .fetchLotteryInfo(lotteryAddress.value)
      .then( (lotteryInfo) => {
        console.log('>>>> lotteryInfo', lotteryInfo)
        setHtml('lottery_owner', lotteryInfo.owner)
        setHtml('lottery_operator', lotteryInfo.operator)
        setHtml('lottery_treasury', lotteryInfo.treasury)
        setHtml('lottery_current', lotteryInfo.currentLotteryNumber)
        showBlock('lottery_info')
        hideLoader()
        hideBlock('lottery_start')
        hideBlock('lottery_round')
        hideBlock('lottery_draw')
        hideBlock('lottery_settings')
        $('INPUT.lottery-winning-percent-input').attr('type', 'hidden')

        const current = lotteryInfo.currentLotteryInfo

        // Время
        const lotteryStart = new Date(parseInt( current.startTime, 10) * 1000)
        const lotteryEnd = new Date(parseInt( current.endTime, 10) * 1000)
        setHtml('lottery_current_starttime', lotteryStart)
        setHtml('lottery_current_endtime', lotteryEnd)
        setHtml('lottery_current_timeleft', getDateDiffText(getUnixTimeStamp(), parseInt( current.endTime, 10) + 1 * 60))
        // Лотерея открыта, время вышло, нужен расчет
        if (current.status === "1"
          && (parseInt(current.endTime, 10) - getUnixTimeStamp() < 0)
        ) {
          showBlock('lottery_current_close_goto_draw')
          hideBlock('lottery_current_timeleft')
        } else {
          showBlock('lottery_current_timeleft')
          hideBlock('lottery_current_close_goto_draw')
        }
        // Текущий банк
        const tokenDecimals = getNumber('lottery_token_decimals')
        const bankAmount = new BigNumber(current.amountCollectedInCake)
          .div(new BigNumber(10).pow(tokenDecimals))
          .toNumber()
        setHtml('lottery_current_bank', bankAmount)

        if ((lotteryInfo.currentLotteryNumber !== "1") && (lotteryInfo.currentLotteryInfo.status === "1")) {
          showBlock('lottery_round')
        }
        if (current.status === "2") {
          showBlock('lottery_draw')
        }
        if (current.status === "3") {
          showBlock('lottery_start')
        }

        showBlock('lottery_settings')
        reinit_winningPercents()
        fetchStatus.disabled = false
      })
      .catch((e) => {
        console.log(e)
        hideLoader()
        $('INPUT.lottery-winning-percent-input').attr('type', 'hidden')
        hideBlock('lottery_start')
        hideBlock('lottery_round')
        hideBlock('lottery_draw')
        hideBlock('lottery_settings')
        fetchStatus.disabled = false
        alert('Fail fetch contract info')
      })
  }

  const calcWinningPercentsIsCorrect = () => {
    const numbersCount = parseInt( $('#lottery_numbers_count').val(), 10)
    const inputs = $('INPUT[data-winning-number]')
    let totalPercents = 0
    inputs.each((i, input) => {
      const $input = $(input)
      const inputNumber = parseInt($input.data('winning-number'), 10)
      
      if (numbersCount >= inputNumber) {
        const inputPercent = parseFloat($input.val())
        totalPercents = totalPercents + inputPercent
      }
    })
    return totalPercents
  }

  const checkWinningPercentsState = () => {
    const totalPercents = calcWinningPercentsIsCorrect()
    $('#lotteryfactory-winning-percent-total').html(totalPercents.toFixed(2))
    if (totalPercents != 100) {
      $('#lotteryfactory-winning-percent-error').removeClass('-hidden')
    } else {
      $('#lotteryfactory-winning-percent-error').addClass('-hidden')
    }
    return (totalPercents == 100)
  }

  $( 'INPUT.lottery-winning-percent-input[data-winning-number]' ).on('keyup', function (e) {
    checkWinningPercentsState()
  })

  $( saveWinningPercents ).on('click', function (e) {
    e.preventDefault()
    if (saveWinningPercents.disabled) return
    if (checkWinningPercentsState()) {
      showLoader()
      setLoaderStatus( langMsg( 'Saving changes... Plase wait.' ) )
      saveWinningPercents.disabled = true
      const unlockButton = () => {
        saveWinningPercents.disabled = false
        hideLoader()
      }
      ajaxSendData({
        action: 'lotteryfactory_update_options',
        data: {
          postId,
          options: {
            'winning_1': parseFloat($('INPUT.lottery-winning-percent-input[data-winning-number="1"]').val()),
            'winning_2': parseFloat($('INPUT.lottery-winning-percent-input[data-winning-number="2"]').val()),
            'winning_3': parseFloat($('INPUT.lottery-winning-percent-input[data-winning-number="3"]').val()),
            'winning_4': parseFloat($('INPUT.lottery-winning-percent-input[data-winning-number="4"]').val()),
            'winning_5': parseFloat($('INPUT.lottery-winning-percent-input[data-winning-number="5"]').val()),
            'winning_6': parseFloat($('INPUT.lottery-winning-percent-input[data-winning-number="6"]').val()),
          }
        }
      }).then((ajaxAnswer) => {
        console.log('>> save result', ajaxAnswer)
        unlockButton()
      }).catch((isFail) => { unlockButton() })
    } else {
      errMessage( langMsg( 'The sum must be equal to 100%' ) )
    }
  })

  $( 'A[data-lottery-action="fix-winning-percents"]').on('click', function (e) {
    const $button = $(e.target)
    const winningNumber = parseInt( $button.data('winning-number'), 10)
    const $percentInput = $('INPUT.lottery-winning-percent-input[data-winning-number="' + winningNumber + '"]')
    const totalPercents = calcWinningPercentsIsCorrect()
    const percentDelta = 100 - totalPercents
    const ballPercent = parseFloat( $percentInput.val() )
    $percentInput.val( parseFloat(ballPercent + percentDelta).toFixed(2) )
    checkWinningPercentsState()
  })
  $( 'INPUT.lottery-winning-percent-input[data-winning-number]' ).on('change', function (e) {
    checkWinningPercentsState()
  })

  const reinit_winningPercents = () => {
    const numbersCount = parseInt( $('#lottery_numbers_count').val(), 10)
    const winningPercentsHolders = $('.lotteryfactory-winning-percent')
    winningPercentsHolders.each((i, holder) => {
      const holderNumber = parseInt($(holder).data('winning-number'), 10)
      if (holderNumber > numbersCount ) {
        $(holder).addClass('-hidden')
        $($(holder).find('INPUT.lottery-winning-percent-input')).attr('type', 'hidden')
      } else {
        $(holder).removeClass('-hidden')
        $($(holder).find('INPUT.lottery-winning-percent-input')).attr('type', 'number')
      }
    })
    checkWinningPercentsState()
  }
  $( '#lottery_numbers_count' ).on('change', function (e) {
    const numbersCount = parseInt( $('#lottery_numbers_count').val(), 10)
    const winningPercentsHolders = $('.lotteryfactory-winning-percent')
    winningPercentsHolders.each((i, holder) => {
      const holderNumber = parseInt($(holder).data('winning-number'), 10)
      if (holderNumber > numbersCount ) {
        $(holder).addClass('-hidden')
        $($(holder).find('INPUT.lottery-winning-percent-input')).attr('type', 'hidden')
      } else {
        $(holder).removeClass('-hidden')
        $($(holder).find('INPUT.lottery-winning-percent-input')).attr('type', 'number')
      }
    })
    checkWinningPercentsState()
  })


  $( numbersCountChange ).on('click', function (e) {
    e.preventDefault();
    if (numbersCountChange.disabled) return

    showLoader()
    numbersCountChange.disabled = true
    const unlockButton = () => {
      numbersCountChange.disabled = false
      hideLoader()
    }

    setLoaderStatus( langMsg( 'Fetch lottery status' ) )
    lotteryDeployer
      .fetchLotteryInfo(lotteryAddress.value)
      .then( (lotteryInfo) => {
        const current = lotteryInfo.currentLotteryInfo
        const numbersCount = parseInt( $('#lottery_numbers_count').val(), 10)
        if ((current.status !== "3") && (lotteryInfo.currentLotteryNumber !== "1")) {
          errMessage( langMsg( 'You can change the number of balls only when the lottery is stopped') )
          unlockButton()
          return
        }
        setLoaderStatus( langMsg( 'Save information abount numbers counts to contract' ) )
        lotteryDeployer.setNumbersCount(lotteryAddress.value, numbersCount)
          .then((isOk) => {
            // call ajax save
            setLoaderStatus( langMsg( 'Save local WP configuration' ) )
            ajaxSendData({
              action: 'lotteryfactory_update_options',
              data: {
                postId,
                options: {
                  'numbers_count': numbersCount,
                }
              }
            }).then((ajaxAnswer) => {
              unlockButton()
            }).catch((isFail) => { unlockButton() })
          })
          .catch((errMsg) => {
            errMessage(errMsg)
            unlockButton()
          })
      })
      .catch((err) => {
        numbersCountChange.disabled = false
        hideLoader()
      })
  })

  $( 'A[data-lottery-action="save-ajax-param"]' ).on('click', function (e) {
    e.preventDefault()
    const $button = $(e.target);
    if ($button[0].disabled) return
    const postTarget = $button.data('lottery-target')
    const postValue = $($button.data('lottery-source')).val()
    const unlockButton = () => {
      $button[0].disabled = false
      hideLoader()
    }
    $button[0].disabled = true
    showLoader()
    setLoaderStatus( langMsg( 'Saving chainges' ) )
    const options = {}
    options[postTarget] = postValue
    
    ajaxSendData({
      action: 'lotteryfactory_update_options',
      data: {
        postId,
        options
      }
    }).then((ajaxAnswer) => {
      console.log('>> save result', ajaxAnswer)
      unlockButton()
    }).catch((isFail) => { unlockButton() })
  })

  $( startLottery ).on( 'click', function(e) {
    e.preventDefault()
    if (startLottery.disabled) return
    if (!checkWinningPercentsState()) {
      return errMessage( langMsg( 'Adjust the win percentage to be 100%') )
    }
    const endDate = getValue('lottery_enddate')
    const endTime = getValue('lottery_endtime')
    let ticketPrice = getFloat('lottery_ticket_price')
    let treasuryFee = getNumber('lottery_treasury_fee')
    const tokenDecimals = getNumber('lottery_token_decimals')
    const lotteryContract = getValue('lottery_address')

    if (tokenDecimals === false)
      return errMessage( langMsg( 'Could not determine token dicimals. Inquire about teken and try again') )
    if (ticketPrice === false)
      return errMessage( langMsg( 'Enter the ticket price') )
    if (treasuryFee === false)
      return errMessage( langMsg( 'Specify treasury fee') )
    if (ticketPrice <= 0)
      return errMessage( langMsg( 'Ticket price must be greater than zero') )
    if (!(treasuryFee >= 0 && treasuryFee <= 30))
      return errMessage( langMsg( 'The treasury tax must be between 0% and 30%') )
    if (!endDate || endDate === '')
      return errMessage( langMsg( 'Enter date of lottery end') )
    if (!endTime || endTime === '')
      return errMessage( langMsg( 'Enter time of lottery end') )
    if (!lotteryContract)
      return errMessage( langMsg( 'Lottery contract not specified') )


    const lotteryEnd = new Date(endDate + ' ' + endTime).getTime() / 1000

    // winningPercents
    const numbersCount = parseInt( $('#lottery_numbers_count').val(), 10)
    const winningPercents = [
      (numbersCount >= 1) ? parseInt(parseFloat($('INPUT.lottery-winning-percent-input[data-winning-number="1"]').val()) * 100, 10) : 0,
      (numbersCount >= 2) ? parseInt(parseFloat($('INPUT.lottery-winning-percent-input[data-winning-number="2"]').val()) * 100, 10) : 0,
      (numbersCount >= 3) ? parseInt(parseFloat($('INPUT.lottery-winning-percent-input[data-winning-number="3"]').val()) * 100, 10) : 0,
      (numbersCount >= 4) ? parseInt(parseFloat($('INPUT.lottery-winning-percent-input[data-winning-number="4"]').val()) * 100, 10) : 0,
      (numbersCount >= 5) ? parseInt(parseFloat($('INPUT.lottery-winning-percent-input[data-winning-number="5"]').val()) * 100, 10) : 0,
      (numbersCount >= 6) ? parseInt(parseFloat($('INPUT.lottery-winning-percent-input[data-winning-number="6"]').val()) * 100, 10) : 0,
    ]

    ticketPrice = new BigNumber(ticketPrice).multipliedBy(10 ** tokenDecimals).toFixed()
    treasuryFee = parseInt(treasuryFee*100, 10)
    startLottery.disabled = true
    showLoader()
    setLoaderStatus( langMsg( 'Starting lottery. Confirm trasaction...' ) )
    lotteryDeployer.startLottery({
      lotteryContract,
      lotteryEnd,
      ticketPrice,
      treasuryFee,
      winningPercents,
    })
      .then((res) => {
        fetchStatusFunc()
      })
      .catch((err) => {
        console.log('>> fail', err)
        startLottery.disabled = false
        hideLoader()
      })
  })

  $( drawNumbers ).on( 'click', function(e) {
    e.preventDefault()
    if (drawNumbers.disabled) return

    const lotteryAddress = getValue('lottery_address')
    const lotterySalt = getValue('lottery_draw_salt')
    if (!lotteryAddress)
      return errMessage('Lottery contract not specified')
    if (!lotterySalt || lotterySalt.length < 128) {
      // Не корректная соль. Соль должна быть 128 или больше символов. Нажмите Сгенерировать чтобы получить новую
      return errMessage('Incorrect draw salt. Salt must be 128 chars or bigger length. Press Generate new salt')
    }

    drawNumbers.disabled = true
    showLoader()
    setLoaderStatus( langMsg( 'Drawing final numbers... confirm trasaction' ) )
    lotteryDeployer
      .drawNumbers(lotteryAddress, lotterySalt)
      .then((res) => {
        console.log('>>> ok', res)
        hideBlock('lottery_draw')
        showBlock('lottery_start')
        hideLoader()
      })
      .catch((err) => {
        console.log('>> fail', err)
        drawNumbers.disabled = false
        hideLoader()
      })
  })

  $( '#lotteryfactory_gen_drawsalt' ).on( 'click', function(e) {
    e.preventDefault()
    setValue('lottery_draw_salt', genSalt())
  })

  $( closeAndGoDraw ).on( 'click', function(e) {
    e.preventDefault()
    if (closeAndGoDraw.disabled) return

    const lotteryContract = getValue('lottery_address')
    if (!lotteryContract)
      return errMessage('Lottery contract not specified')

    setLoaderStatus( langMsg( 'Closing lottery round. Confirm trasaction') )
    lotteryDeployer
      .closeLottery(lotteryContract)
      .then((res) => {
        console.log('>>> ok', res)
        hideBlock('lottery_round')
        showBlock('lottery_draw')
      })
      .catch((err) => {
        console.log('>> fail', err)
      })
  })

  $( fetchStatus ).on( 'click', function(e) {
    e.preventDefault()
    fetchStatusFunc()
  })

  const fillLotteryData = (lotteryInfo) => {
    const breakDowns = lotteryInfo.currentLotteryInfo.rewardsBreakdown
    $('INPUT[data-winning-number="1"]').val(breakDowns[0]/ 100)
    $('INPUT[data-winning-number="2"]').val(breakDowns[1]/ 100)
    $('INPUT[data-winning-number="3"]').val(breakDowns[2]/ 100)
    $('INPUT[data-winning-number="4"]').val(breakDowns[3]/ 100)
    $('INPUT[data-winning-number="5"]').val(breakDowns[4]/ 100)
    $('#lottery_numbers_count').val(lotteryInfo.numbersCount)
  }
  $( fetchButton ).on( 'click', function(e) {
    e.preventDefault();
    if (fetchButton.disabled) return
    if (!lotteryAddress.value) return errMessage('Enter contract address')

    hideBlock('lottery_token_info')
    hideBlock('lottery_info')
    showLoader()
    fetchButton.disabled = true
    setLoaderStatus( langMsg( 'Fetching current lottery status from contract' ) )
    lotteryDeployer
      .fetchLotteryInfo(lotteryAddress.value)
      .then( (lotteryInfo) => {
        console.log('>>>> lotteryInfo', lotteryInfo)
        setTokenInfo(lotteryInfo.token)
        tokenAddress.value = lotteryInfo.token.tokenAddress
        setHtml('lottery_owner', lotteryInfo.owner)
        setHtml('lottery_operator', lotteryInfo.operator)
        setHtml('lottery_treasury', lotteryInfo.treasury)
        setHtml('lottery_current', lotteryInfo.currentLotteryNumber)
        // fill break downs
        if (lotteryInfo.currentLotteryInfo
          && lotteryInfo.currentLotteryNumber !== "1"
        ) {
          fillLotteryData(lotteryInfo)
        }
        showBlock('lottery_info')
        hideLoader()
        fetchButton.disabled = false
      })
      .catch((e) => {
        console.log(e)
        hideLoader()
        fetchButton.disabled = false
        alert('Fail fetch contract info')
      })
  })

  $( fetchToken ).on( 'click', function(e) {
		e.preventDefault();
    if (fetchToken.disabled) return
    hideBlock('lottery_token_info')

    if (!tokenAddress.value) return errMessage('Enter token address')

    showLoader()
    setLoaderStatus( langMsg( 'Fetching information about token' ) )
    fetchToken.disabled = true
    lotteryDeployer
      .fetchTokenInfo(tokenAddress.value)
      .then((tokenInfo) => {
        setTokenInfo(tokenInfo)
        hideLoader()
        fetchToken.disabled = false
      })
      .catch((e) => {
        console.log(e)
        hideLoader()
        fetchToken.disabled = false
        alert('Fail fetch token info')
      })
  })

	$( deployButton ).on( 'click', function(e) {
		e.preventDefault();


    if (deployButton.disabled) {
      return
    }
    if (!tokenAddress.value) return errMessage('Enter token address')

    deployButton.disabled = true;
    showLoader()
    setLoaderStatus( langMsg( 'Deploying lottery contract to blockchain. Confirm transaction' ) )
    lotteryDeployer
      .fetchTokenInfo(tokenAddress.value)
      .then((tokenInfo) => {
        setTokenInfo(tokenInfo)
        lotteryDeployer.deploy({
          tokenAddress: tokenAddress.value,
          onTrx: (trxHash) => {
            alert(`Transaction hash: ${trxHash}. Send this hash to the support if you have a problem with deploy.`)
          },
          onSuccess: (address) => {
            console.log('Contract address:', address);
            deployButton.disabled = false;
            hideLoader()
            lotteryAddress.value = address;
          },
          onError: (err) => {
            console.error(err);
            deployButton.disabled = false;
            hideLoader()
            alert(err);
          }
        });
      })
      .catch((e) => {
        console.log(e)
        hideLoader()
        deployButton.disabled = false
        alert('Fail fetch token info')
      })
	});

  $( selectedChain ).on( 'change', function(e) {
		e.preventDefault();

    lotteryDeployer
      .setSelectedChain(e.target.value)
  });

})( jQuery );
