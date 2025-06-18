document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById('myChart').getContext('2d')
  
  fetch("/broker/market?market=0&yearsCount=5").then(r => r.json()).then(r => {

    if(r["success"]){
      new Chart(ctx, {
          type: 'line',
          data: r["graphData"],
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        })
    }

  })
})

function moneyDrop () {
    const totalEmojis = 100
    const waveDelay = 10

    for (let i = 0; i < totalEmojis; i++) {
        setTimeout(() => {
            const emoji = document.createElement('span')
            emoji.textContent = '💸'
            emoji.style.position = 'fixed'
            emoji.style.left = Math.random() * 95 + 'vw'
            emoji.style.top = '0'
            emoji.style.transform = 'translateY(0)'
            emoji.style.fontSize = (1.5 + Math.random() * 1.5) + 'rem'
            emoji.style.pointerEvents = 'none'
            emoji.style.zIndex = 9999
            emoji.style.transition = 'transform 1.5s linear'
            document.body.appendChild(emoji)

            setTimeout(() => {
                emoji.style.transform = `translateY(${window.innerHeight - 40}px) rotate(${Math.random() * 360}deg)`
            }, 20)

            setTimeout(() => {
                emoji.remove()
            }, 3000)
        }, i * waveDelay + Math.random() * 300)
    }
}