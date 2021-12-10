const open = (message: string) => {
  const html = `
    <div class="farmfactory-overlay" id="">
      <div class="farmfactory-modal">
        <button class="farmfactory-closeButton">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 32 32">
            <path stroke="currentColor" stroke-width="2" d="M9 9l7 6.99L23 9l-6.99 7L23 23l-7-6.99L9 23l6.99-7L9 9z" opacity=".9"/>
          </svg>
        </button>
        <div class="farmfactory-inner">
          <div>${message}</div>
        </div>
        <div class="farmfactory-footer">
          <button class="farmfactory-button gray">Close</button>
        </div>
      </div>
    </div>
  `

  const node = document.createElement('div')

  node.innerHTML = html

  document.body.appendChild(node)

  node.querySelector('.farmfactory-closeButton').addEventListener('click', () => {
    node.remove()
  })

  node.querySelector('.farmfactory-button').addEventListener('click', () => {
    node.remove()
  })
}


export default {
  open,
}
