/**
 * Admin Scripts
 */
(function( $ ){
	"use strict";

  const getUnixTimeStamp = () => Math.floor(new Date().getTime() / 1000)

  var deployButton    = document.getElementById('lotteryfactory_deploy_button');
  var fetchButton     = document.getElementById('lotteryfactory_fetchcontract_button');
  var fetchStatus     = document.getElementById('lotteryfactory_fetchstatus');
	var loaderOverlay   = document.getElementById('lotteryfactory_loaderOverlay');
  var tokenAddress    = document.getElementById('lottery_token');
  var fetchToken      = document.getElementById('lotteryfactory_fetchtoken_button');
  var lotteryAddress  = document.getElementById('lottery_address');
  var startLottery    = document.getElementById('lotteryfactory_startlottery')
  var closeAndGoDraw  = document.getElementById('lottery_current_close_goto_draw')
  var drawNumbers     = document.getElementById('lotteryfactory_draw_numbers')

  var getValue = (id) => { return document.getElementById(id).value }
  var setValue = (id, value) => { document.getElementById(id).value = value }
  var setHtml = (id, value) => { document.getElementById(id).innerHTML = value }
  var showBlock = (id) => { document.getElementById(id).style.display = '' }
  var hideBlock = (id) => { document.getElementById(id).style.display = 'none' }
  var showLoader = () => { loaderOverlay.classList.add('visible') }
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

  const fetchStatusFunc = () => {
    if (fetchStatus.disabled) return
    if (!lotteryAddress.value) return errMessage('No lottery address!')

    fetchStatus.disabled = true
    showLoader()
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

        
        fetchStatus.disabled = false
      })
      .catch((e) => {
        console.log(e)
        hideLoader()
        hideBlock('lottery_start')
        hideBlock('lottery_round')
        hideBlock('lottery_draw')
        fetchStatus.disabled = false
        alert('Fail fetch contract info')
      })
  }
  $( startLottery ).on( 'click', function(e) {
    e.preventDefault()
    if (startLottery.disabled) return
    const endDate = getValue('lottery_enddate')
    const endTime = getValue('lottery_endtime')
    let ticketPrice = getFloat('lottery_ticket_price')
    let treasuryFee = getNumber('lottery_treasury_fee')
    const tokenDecimals = getNumber('lottery_token_decimals')
    const lotteryContract = getValue('lottery_address')

    if (tokenDecimals === false)
      return errMessage('Не удалось определить dicimals токена. Запросите информую о текене и попробуйте еще раз')
    if (ticketPrice === false)
      return errMessage('Укажите цену билета')
    if (treasuryFee === false)
      return errMessage('Укажите козначейский сбор')
    if (ticketPrice <= 0)
      return errMessage('Цена била должна быть больше нуля')
    if (!(treasuryFee >= 0 && treasuryFee <= 30))
      return errMessage('Козначейский сбор должен быть от 0% до 30%')
    if (!endDate || endDate === '')
      return errMessage('Enter date of lottery end')
    if (!endTime || endTime === '')
      return errMessage('Enter time of lottery end')
    if (!lotteryContract)
      return errMessage('Lottery contract not specified')


    const lotteryEnd = new Date(endDate + ' ' + endTime).getTime() / 1000

    ticketPrice = new BigNumber(ticketPrice).multipliedBy(10 ** tokenDecimals).toFixed()
    treasuryFee = parseInt(treasuryFee*100, 10)
    startLottery.disabled = true
    lotteryDeployer.startLottery({
      lotteryContract,
      lotteryEnd,
      ticketPrice,
      treasuryFee,
    })
      .then((res) => {
        console.log('>>> ok', res)
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

  $( fetchButton ).on( 'click', function(e) {
    e.preventDefault();
    if (fetchButton.disabled) return
    if (!lotteryAddress.value) return errMessage('Enter contract address')

    hideBlock('lottery_token_info')
    hideBlock('lottery_info')
    showLoader()
    fetchButton.disabled = true
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

    loaderOverlay.classList.add('visible');
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
})( jQuery );
