const balanceElement = document.getElementById('balance')
const dailyWithdrawsElement = document.getElementById('dailyWithdraws')
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
const filterSelector = document.querySelector("#filterSelector")

const csrf_token = document.querySelector("#csrf_token").value


function updateInfo(){
    fetch("account/finance", {
        redirect: "manual"
    })
    .then(r => checkRequiresAuth(r))
    .then(r => {
        balanceElement.textContent = r["success"] ? `${r["balance"]} €` : "... €"
        dailyWithdrawsElement.textContent = r["success"] ? `${r["dailyWithdraws"]} €` : "... €"
        
        lastUpdateElement.textContent = r["lastUpdate"]
    })
}


//aggiorna cronologia pagamenti
function updatePaymentHistory(addFilters=false, filter="all"){
    fetch(`account/history?view=${filter}`, {
        redirect: "manual"
    })
    .then(r => checkRequiresAuth(r))
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

            if(addFilters){
                const filters = {
                    all : "All",
                    today : "Today",
                    lastWeek : "Last Week",
                    thisMonth : "This Month",
                    thisYear : "This Year",
                }

                Object.keys(filters).forEach(f => {
                    filterSelector.innerHTML+= `
                        <option ${f == "all" ? "selected" : ""} value=${f}>${filters[f]}</option>
                    `
                })

                filterSelector.addEventListener("change", e => updatePaymentHistory(false, e.target.value))
            }


            filterSelector.value = filter
        }

        else{
            historyError.classList.remove("d-none")
            historyTable.classList.add("d-none")
        }
    })
}

// gestione transazioni
function handleTransaction(type) {
    const data = {amount: parseFloat(amountInput.value), csrf_token: csrf_token}

    fetch(`account/${type}`, {
        redirect: "manual",

        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
        }).then(r => checkRequiresAuth(r))   
        .then(r => {

            if(r["success"]){
                document.getElementById('actionName').textContent = `${actions[type]} Riuscito!` 
                document.getElementById('actionAmount').textContent = formatCurrency(data.amount)

                createMoneyRain()
                overlay.style.display = 'flex'

                setTimeout(() => {
                    closeVideo()
                    
                    showAlert(`${actions[type]} di ${formatCurrency(data.amount)} effettuato con successo!`, "success")
                    
                    updateInfo()
                    updatePaymentHistory(false, "today")
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

    video.src = './video/video-background.mp4'

    updatePaymentHistory(true)

    depositBtn.addEventListener('click', () => handleTransaction('deposit'))
    withdrawBtn.addEventListener('click', () => handleTransaction('withdraw'))

})

