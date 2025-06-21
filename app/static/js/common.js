function checkRequiresAuth(r){
    if(r.status == 200){
        return r.json()
    }

    //302
    // window.location.href = "http://localhost:3000/login"
    window.location.href = "https://petuniabank.onrender.com/login"
    return {success: false}

}