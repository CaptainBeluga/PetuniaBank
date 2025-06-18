document.addEventListener("DOMContentLoaded", () => {
  const userTableDiv = document.getElementById("userTable")
  const searchBar = document.getElementById("searchBar")

  const pageSelector = document.querySelector("#pageSelector")
  
  function updateTable(fetchObj) {
    userTableDiv.innerHTML = `
      <div class="info-box">
        <div class="table-responsive">
          <table class="table table-striped table-dark table-hover mb-0">
            <thead>
              <tr>
                <th scope="col" class="d-none d-sm-table-cell">OAuth ID</th>
                <th scope="col">Nickname</th>
                <th scope="col">Role</th>
                <th scope="col">Balance €</th>
                <th scope="col">Prelievi Giornalieri € (${fetchObj["currentDate"]})</th>
              </tr>
            </thead>
            <tbody>
              ${fetchObj["usersInfo"].map(user => `
                <tr ${user.isYou ? 'class="fw-bold"' : ""}>
                  <td class="d-none d-sm-table-cell">${user.oauthID}</td>
                  <td>${user.nickname}</td>
                  <td ${tRole = user.role.split("-")}><span class="badge rounded-pill text-bg-${tRole[0]}">${tRole[1]}</span></td>
                  <td>${user.balance}</td>
                  <td>${user.dailyWithdraws}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `

  }


  function adminViewRequest(loadFilter=false, page=1){
    fetch(`admin/view?page=${page}`).then(r => r.json()) .then(r => {
      if(r["success"]){
        fetchObj = r

        updateTable(fetchObj)

        if(loadFilter){
          for(let i=0;i<r["totalPages"];i++){
            pageSelector.innerHTML+= `
              <option ${i+1==1 ? "selected" : ""} value=${i+1}>Page ${i+1}</option>
            `
          }

          pageSelector.classList.remove("d-none")

          pageSelector.addEventListener("change", e => adminViewRequest(false, e.target.value))
        }
      }
    })
  }
  
  let fetchObj = {}


  searchBar.addEventListener('input', () => {
    const searchValue = searchBar.value.toLowerCase()
    const filter = fetchObj["usersInfo"].filter(user => user.nickname.toLowerCase().replace(" ", "").includes(searchValue)) 
    updateTable({currentDate: fetchObj["currentDate"], usersInfo: filter})
  })



  adminViewRequest(true)



  
})