function dropEmojisAndLogin() {
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
            window.location.href = "/login"
        }, 2000)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('auth0LoginBtn').addEventListener('click', dropEmojisAndLogin)
});