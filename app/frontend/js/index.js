const lastUpdateElement = document.getElementById('last-update')
const amountInput = document.getElementById('amount')
const depositBtn = document.getElementById('deposit-btn')
const withdrawBtn = document.getElementById('withdraw-btn')
const alertContainer = document.getElementById('alert-container')

const overlay = document.getElementById('videoOverlay')
const actions = {"deposit" : "Deposito", "withdraw" : "Prelievo"}

const historyTable = document.querySelector("#history-table")
const tbodyHistoryTable = historyTable.querySelector("tbody")
const historyError = document.querySelector("#historyError")


const nickName = document.querySelector("#nickName")
const profilePicture = document.querySelector("#profilePicture")
const balanceElement = document.getElementById('balance')
const dailyWithdrawsElement = document.getElementById('dailyWithdraws')



const rowRules = document.querySelector("#rowRules")


function updateInfo(){
    fetch("http://localhost:3000/account", {
    credentials: "include",
    headers: getTokenHeader()


    }).then(r => r.json()).then(r => {
        if(r["success"]){
            nickName.textContent = r["nickname"]
            profilePicture.src = r["picture"]
            balanceElement.textContent = `${r["balance"]} €`
            dailyWithdrawsElement.textContent = `${r["dailyWithdraws"]} €`
        }
    })

    lastUpdateElement.textContent = new Date().toLocaleString('it-IT')
}


//aggiorna cronologia pagamenti
function updatePaymentHistory(){
    fetch("http://localhost:3000/account/history", {
    credentials: "include",
    headers : getTokenHeader()

    }).then(r => r.json())
    .then(r => {
        if(r["success"] && r["history"].length > 0){
            historyTable.classList.remove("d-none")
            historyError.classList.add("d-none")

            tbodyHistoryTable.innerHTML = ""

            r["history"].forEach(h => {
                tbodyHistoryTable.innerHTML+= `
                    <tr>
                        <td class="text-center opacity-75">#${h['transaction_id']}</td>
                        <td class="text-center opacity-75">${h['actiondate']}</td>
                        <td class="text-center opacity-75 fw-bold text-${h['actiontype'] == "deposit" ? "success" : "danger"}">${h['actiontype'] == "deposit" ? "+" : "-"} ${formatCurrency(h['amount'])}</td>
                    </tr>`
            })
        }

        else{
            historyError.classList.remove("d-none")
            historyTable.classList.add("d-none")
        }
    })
}

// gestione transazioni
function handleTransaction(type) {
    const data = {amount: parseFloat(amountInput.value)}

    fetch(`http://localhost:3000/account/${type}`, {
        
        method: 'POST',
        headers: {'Content-Type': 'application/json', "Authorization" : `Bearer ${getToken()}`},

        credentials: "include",

        body: JSON.stringify(data)
        
    }).then(r => r.json())   
    .then(r => {
        if(r["success"]){
            
            // deposito
            document.getElementById('actionName').textContent = `${actions[type]} Riuscito!` 
            document.getElementById('actionAmount').textContent = formatCurrency(data.amount)

            createMoneyRain()
            overlay.style.display = 'flex'

            setTimeout(() => {
                closeVideo()
                
                showAlert(`${actions[type]} di ${formatCurrency(data.amount)} effettuato con successo!`, "success")
                
                updateInfo()
                updatePaymentHistory()
            }, 2500)
        }

        else{
            showAlert(r["error"], 'danger')
        }

        amountInput.value = ''
    })
}

//formato valuta
function formatCurrency(amount) { return `${amount.toFixed(2).replace('.', ',')} €` }

// rain of money
function createMoneyRain() {
    const moneyRain = document.getElementById('moneyRain')
    moneyRain.innerHTML = '' 
    
    for (let i = 0; i < 15; i++) {
        const bill = document.createElement('div')
        bill.className = 'money-bill'
        bill.style.left = Math.random() * 100 + '%'
        bill.style.animationDelay = Math.random() * 2 + 's'
        bill.style.animationDuration = (Math.random() * 1 + 1.5) + 's'
        moneyRain.appendChild(bill)
    }
}

function closeVideo() {
    overlay.style.display = 'none'
}

//scompaiono i soldi
function createMoneyDisappear() {
    const moneyDisappear = document.getElementById('moneyDisappear')
    moneyDisappear.innerHTML = ''
    
    for (let i = 0; i < 15; i++) {
        const bill = document.createElement('div')
        bill.className = 'money-bill-withdraw'
        bill.style.left = Math.random() * 100 + '%'
        bill.style.top = Math.random() * 100 + '%'
        bill.style.animationDelay = Math.random() * 0.5 + 's'
        moneyDisappear.appendChild(bill)
    }
}


// alert vari
function showAlert(message, type) {
    const alertDiv = document.createElement('div')
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`
    alertDiv.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `

    alertContainer.innerHTML = ''
    alertContainer.appendChild(alertDiv)

    // rimozione degli alert
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove()
        }
    }, 2500)
}
//video background
document.addEventListener('DOMContentLoaded', function() {

    const video = document.getElementById('bgVideo')
    
    const playPromise = video.play()
    
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            video.muted = true
            video.play()
        })
    }
    //controllo vari dispositivi
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        video.src = './resources/videos/bank-bg-mobile.mp4'
    }

    fetch("http://localhost:3000/home/info", {
        credentials: "include",
        headers : getTokenHeader()
    }).then(r => {
        setToken(r.headers.get("Authorization"))
        return r.json()
    }).then(r => {

        //Buttons
        Object.keys(r["permissions"]).forEach(p => {
            document.querySelector(`#${p}`).className = `btn btn-outline-light ${!r["permissions"][p] ? "d-none" : ""}`
        })


        //Rules Row
        const config = Object.keys(r["bankConfig"])
        const len = Math.ceil(config.length/2)

        const columns = [config.slice(0, len), config.slice(len)]

        columns.forEach(column => {
            rowRules.innerHTML+= `
                <div class="col-md-6">
                    <ul>
                        ${column.map(k => `<li>${k}: ${r["bankConfig"][k] ?? ""}</li>`).join('')}
                    </ul>
                </div> 
            `
        })
    })

    updateInfo()
    updatePaymentHistory()

    depositBtn.addEventListener('click', () => handleTransaction('deposit'))
    withdrawBtn.addEventListener('click', () => handleTransaction('withdraw'))


})

