function dropsEmojisAndRedirect() {
    const emojis = ['💸','💰','🏦','🤑','💳','💵','💲','💎','🪙']
    for (let i = 0; i < 20; i++) {
        const emoji = document.createElement('span');
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)]
        emoji.className = 'emoji-drop'
        emoji.style.left = Math.random() * 100 + 'vw'
        emoji.style.animationDelay = (Math.random() * 0.5) + 's'
        document.body.appendChild(emoji)
        setTimeout(() => {
            emoji.remove()
            window.location.href = navigator.userAgent == "PetuniaBankMobile" ? "https://github.com/CaptainBeluga/PetuniaBank/releases/tag/v1.1" : "https://petuniabank.up.railway.app/"
        }, 2000)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const redirectWebsiteBtn = document.querySelector("#redirectWebsiteBtn")
    redirectWebsiteBtn.textContent = navigator.userAgent == "PetuniaBankMobile" ? "Mobile App v1.1 DOWNLOAD" : "New Petunia Bank Website"

    redirectWebsiteBtn.addEventListener('click', dropsEmojisAndRedirect)
});