# LotteryFactory

Start your own lottery on blockchain and earn 0-30% comission from selling tickets.

User can buy tikect and earn x1-x100 from his bet.

<https://screenshots.wpmix.net/chrome_8l9oTRCivcQbog0WcCTZRhJeD2jiLxzr.png>

## Admin can

1. Deploy lottery contracts
2. Start/Stop lottery
3. Set fee and address for fee
4. Set number of balls (from 2 to 6) and distribution of prizes by each ball in %

## Supported blockchains (token standards)

1. Ethereum
2. Binance Smart Chain
3. Polygon (Matic)
4. Gnosis (xDai)
5. Arbitrum
6. Testnet blockchains for the above

**Supported tokens**: Any ERC20 (BEP20) tokens from supported blockchains.

## Videos

1. Intall plugin - <https://drive.google.com/file/d/1_1LdHXkkKE-syIit6DZzHZdoysBV011j/view>
2. Create and set up lottery - <https://drive.google.com/file/d/1YUrKxZhgfrH3-j91d5BklyflVffGD5S4/view>
3. Generate winning combination, calculate winning nubmers on admin side and check tikets and claim reward on user side - <https://watch.screencastify.com/v/Rgvtvd2BLAyU8aBvePdY>

## How it works?

1. users buy ticket(s)
<https://screenshots.wpmix.net/chrome_NCdFvlJ69uxi477VGyAHE9B0wC36neSv.png>

2. in the end of period the random winners picked by random generator
<https://screenshots.wpmix.net/chrome_TbvwLd0hT5f8ih8YNbS6o8gZ0D9npiEi.png>

3. users check his ticket and wiinenrs got x1-x10
<https://screenshots.wpmix.net/chrome_5mhvpPYI9UCc8TjMxR4lFnIbTU0flurZ.png>

    <https://screenshots.wpmix.net/chrome_VnF0dqgpx7EvK4ind1vJZpUAGqFVgubp.png>

## FAQ

Q: Does it work with my custom token?
A: yes!

Q: Does it work with Bep20 tokens (BSC)
A: yes!

Q: Is there a case when nobody wins?
A: Yes, if no one has the winner ticket the bank stay on the contract. Admin can regenerate random numbers (?)  or use the bank in the next draw (?).

Q: How many tickets can buy one user?
A: unlimited, but it takes gas (?).

Q: How to hide service link?
A: In WP Admin Panel go to All Lotteries and select one, then in "Main settings and lottery control" and turn on Hide checkbox in "Service Link" option and click on the "Update" button.

## How to update frontend

1. Go to ``./frontend`` folder
2. Install depencies ``npm i``
3. Make build ``npm run build_clean``
4. Copy content from 
  ``./frontend/build/images``,
  ``./frontend/build/locales``,
  ``./frontend/build/static``
  to ./vendor_source with replace files
5. Make version level-up in
  ``./package.json``
  ``./lotteryfactory.php``
  