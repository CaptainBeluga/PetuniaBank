jest.mock('pg', () => {
  const mClient = {
    connect: jest.fn().mockResolvedValue(),
    query: jest.fn().mockResolvedValue({ rows: [] }),
    end: jest.fn(),
  };

  return {
    Client: jest.fn(() => mClient)
  };
});

const { Client } = require('pg');
const client = new Client();

const request = require("supertest")

function getApp(){ return require("../../app/server") }



//////////



let openidMock = {
  isAuthenticated: () => true,
  user: {
    "bank/roles": ["admin"],
    nickname: "admin",
    name: "admin@itismeucci.com",
    picture: "https://s.gravatar.com/avatar/8d73ad5993a5008eaa2bfe62698af5db?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fad.png",
    sub: "auth0|6846fa2e5ee75d13253aaafa"
  }
}

function editOpenIdMock(dataRows={isAuthenticated: true, role: "admin"}){
  openidMock.isAuthenticated = () => dataRows.isAuthenticated
  openidMock.user["bank/roles"] = [dataRows.role]
}


jest.mock("express-openid-connect", () => ({
  auth: () => (req, res, next) => {
    req.session = {csrf_token: "petunia-csrf"}
    req.oidc = openidMock
    next()
  },
  
  requiresAuth: () => (req, res, next) => { return openidMock.isAuthenticated() ? next() : res.redirect("https://google.com") }
  
}))



////////// UNIT TESTS ////////// 

describe("Page View Endpoints", () => {
  let app
  beforeAll(() => app = getApp() )

  beforeEach(() => editOpenIdMock() )
   
  

  test("Login Page - Not Auth - 200", async () => {
    editOpenIdMock({isAuthenticated: false, role:""})
    const res = await request(app).get("/")

    expect(res.status).toEqual(200)
  })


  test("Login Page - Already Auth - 302", async () => {
    const res = await request(app).get("/")
    
    expect(res.status).toEqual(302)
  })




  test("Home Page - Not Auth - 302", async () => {
    editOpenIdMock({isAuthenticated: false, role:""})
    const res = await request(app).get("/home")

    expect(res.status).toEqual(302)
  })


  test("Home Page - Already Auth - 200", async () => {
    const res = await request(app).get("/home")
    
    expect(res.status).toEqual(200)
  })



  test("Broker Page - User Access - 302", async () => {
      editOpenIdMock({isAuthenticated: true, role:"user"})

      const res = await request(app).get("/broker")
      expect(res.status).toEqual(302)
  })


  test("Broker Page - Broker Access - 200", async () => {
    editOpenIdMock({isAuthenticated: true, role:"broker"})
    
    const res = await request(app).get("/broker")
    expect(res.status).toEqual(200)
    
  })


  test("Broker Page - Admin Access - 200", async () => {
    const res = await request(app).get("/broker")
    expect(res.status).toEqual(200)
    
  })




  test("Admin Page - User Access - 302", async () => {
      editOpenIdMock({isAuthenticated: true, role:"user"})

      const res = await request(app).get("/admin")
      expect(res.status).toEqual(302)
  })


  test("Admin Page - Broker Access - 302", async () => {
    editOpenIdMock({isAuthenticated: true, role:"broker"})
    
    const res = await request(app).get("/admin")
    expect(res.status).toEqual(302)
    
  })


  test("Admin Page - Admin Access - 200", async () => {
    const res = await request(app).get("/admin")
    expect(res.status).toEqual(200)
    
  })

})


describe("API Account Endpoints", () => {
  let app;
  beforeAll(() => app = getApp())

  beforeEach(() => editOpenIdMock())

  test("/account + /account/finance => Get Account Info / Get Finance Info | Success", async () => {
    client.query.mockImplementation(sql => {
      if(sql.includes("SELECT SUM(")) return Promise.resolve({rows: [{balance: 5000}]})

      if(sql.includes("SELECT sum(amount) AS dailyWithdraws")) return Promise.resolve({rows: [{dailywithdraws: 50}]})
    })

    const res = await request(app).get("/account")
    expect(res.body.success).toBe(true)
  })

  test("/account + /account/finance => Failed to Fetch", async () => {
    client.query.mockImplementation(() => {
        return Promise.resolve({rows:[]})
    })

    const res = await request(app).get("/account")
    expect(res.body.success).toBe(false)
  })

  test("/account + /account/finance => Not Auth - 302", async () => {
    editOpenIdMock({isAuthenticated: false, role: ""})

    const res = await request(app).get("/account")
    expect(res.status).toBe(302)
  })



  test("/account/deposit => Deposit Success", async () => {
    const res = await request(app).post("/account/deposit").send({amount: 500, csrf_token: "petunia-csrf"})
    expect(res.body.success).toBe(true)
  })

  
  test("/account/deposit => Deposit Failed (under min amount)", async () => {
    const res = await request(app).post("/account/deposit").send({amount: 199, csrf_token: "petunia-csrf"})
    expect(res.body.success).toBe(false)
    expect(res.body.error).toMatch(/inferiore/)
  })


  test("/account/deposit => Deposit Failed (over max amount)", async () => {
    const res = await request(app).post("/account/deposit").send({amount: 2001, csrf_token: "petunia-csrf"})
    expect(res.body.success).toBe(false)
    expect(res.body.error).toMatch(/superiore/)
  })


  test("/account/deposit => Deposit Failed (amount <= 0)", async () => {
    const res = await request(app).post("/account/deposit").send({amount: 0, csrf_token: "petunia-csrf"})
    expect(res.body.success).toBe(false)
    expect(res.body.error).toMatch(/non Valido/)
  })


  test("/account/deposit => Deposit Failed (CSRF Token Mismatch)", async () => {
    const res = await request(app).post("/account/deposit").send({amount: 500, csrf_token: "NOT-petunia-csrf"})
    expect(res.body.success).toBe(false)
    expect(res.body.error).toMatch(/CSRF/)
  })


  test("/account/deposit => Deèposit Failed (Not Auth)", async () => {
    editOpenIdMock({isAuthenticated: false, role:""})

    const res = await request(app).post("/account/deposit")
    expect(res.status).toBe(302)
  })






  test("/account/withdraw => Withdraw Success", async () => {
    client.query.mockImplementation(sql => {
      if(sql.includes("SELECT SUM(")) return Promise.resolve({rows: [{balance: 5000}]})

      if(sql.includes("SELECT sum(amount) AS dailyWithdraws")) return Promise.resolve({rows: [{dailywithdraws: 0}]})
    })

    const res = await request(app).post("/account/withdraw").send({amount: 500, csrf_token: "petunia-csrf"})
    expect(res.body.success).toBe(true)
  })


  test("/account/withdraw => Withdraw Failed (amount > balance)", async () => {
    client.query.mockImplementation(sql => {
      if(sql.includes("SELECT SUM(")) return Promise.resolve({rows: [{balance: 50}]})
    })

    const res = await request(app).post("/account/withdraw").send({amount: 100, csrf_token: "petunia-csrf"})
    expect(res.body.success).toBe(false)
    expect(res.body.error).toMatch(/insufficienti/)
  })


  test("/account/withdraw => Withdraw Failed (amount > maxDailyWithdraws)", async () => {
    client.query.mockImplementation(sql => {
      if(sql.includes("SELECT SUM(")) return Promise.resolve({rows: [{balance: 2000}]})

      if(sql.includes("SELECT sum(amount) AS dailyWithdraws")) return Promise.resolve({rows: [{dailywithdraws: 0}]})
    })

    const res = await request(app).post("/account/withdraw").send({amount: 1500, csrf_token: "petunia-csrf"})
    expect(res.body.success).toBe(false)
    expect(res.body.error).toMatch(/Limite/)
    expect(res.body.error).toMatch(/Raggiunto/)
  })


  test("/account/withdraw => Withdraw Failed ((balance + amount) > maxDailyWithdraws)", async () => {
    client.query.mockImplementation(sql => {
      if(sql.includes("SELECT SUM(")) return Promise.resolve({rows: [{balance: 2000}]})

      if(sql.includes("SELECT sum(amount) AS dailyWithdraws")) return Promise.resolve({rows: [{dailywithdraws: 800}]})
    })

    const res = await request(app).post("/account/withdraw").send({amount: 201, csrf_token: "petunia-csrf"})
    expect(res.body.success).toBe(false)
    expect(res.body.error).toMatch(/di Prelievo/)
    expect(res.body.error).toMatch(/Raggiunto/)
  })


  test("/account/withdraw => Withdraw Failed (amount <= 0)", async () => {

    const res = await request(app).post("/account/withdraw").send({amount: -10, csrf_token: "petunia-csrf"})
    expect(res.body.success).toBe(false)
    expect(res.body.error).toMatch(/non Valido/)
  })


  test("/account/withdraw => Withdraw Failed (CSRF Token Mismatch)", async () => {
    const res = await request(app).post("/account/withdraw").send({amount: 1, csrf_token: "NOT-petunia-csrf"})
    expect(res.body.success).toBe(false)
    expect(res.body.error).toMatch(/CSRF/)
  })


  test("/account/withdraw => Withdraw Failed (Not Auth)", async () => {
    editOpenIdMock({isAuthenticated: false, role:""})

    const res = await request(app).post("/account/withdraw")
    expect(res.status).toBe(302)
  })



  test("/account/history => Get Account History Success", async () => {
    client.query.mockImplementation(sql => {
      if(sql.includes("SELECT * from transactions")) return Promise.resolve({rows: [{transacton_id: 166, oauth_sub: "XXXXXXXXXXXXXXXXXXXXXXXX", amount: 200, actiontype: "deposit", actiondate: "10/06/2025"}]})
    })

    const res = await request(app).get("/account/history")
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.history)).toBe(true)
    expect(res.body.history[0]).toHaveProperty("amount")
  })


  test("/account/history => Get Account History Failed (Not Auth)", async () => {
    editOpenIdMock({isAuthenticated: false, role:""})

    const res = await request(app).get("/account/history")
    expect(res.status).toEqual(302)
  })
})



describe("API Admin Endpoints", () => {
  let app;

  beforeAll(() => app = getApp())

  beforeEach(() => editOpenIdMock())


  test("/admin/view => Admin Users View Success", async () => {
    client.query.mockImplementation(sql => {
      if(sql.includes("select count(*) as totalusers from users")) return Promise.resolve({rows: [{totalusers: 21}]})

      if(sql.includes("SELECT * from users ORDER BY CASE")) return Promise.resolve({rows: [{oauth_sub: "1XXXXXXXXXXXXXXXXXXXXXXX", nickname: "mock", role: "user"}]})

      if(sql.includes("SELECT SUM(")) return Promise.resolve({rows: [{balance: 5000}]})

      if(sql.includes("SELECT sum(amount) AS dailyWithdraws")) return Promise.resolve({rows: [{dailywithdraws: 50}]})

    })

    const res = await request(app).get("/admin/view")
    expect(res.body.success).toBe(true)

    expect(res.body.totalPages).toEqual(Math.ceil(21/10)) //3 pages for 21 elements

    expect(Array.isArray(res.body.usersInfo)).toBe(true)
    expect(res.body.usersInfo[0]).toHaveProperty("oauthID")
  })

  test("/admin/view => Admin Users View Failed (not ADMIN Role)", async () => {
    editOpenIdMock({isAuthenticated: true, role: "broker"})

    const res = await request(app).get("/admin/view")
    expect(res.status).toBe(302)
  })


  test("/admin/view => Admin Users View Failed (Not Auth)", async () => {
    editOpenIdMock({isAuthenticated: false})

    const res = await request(app).get("/admin/view")
    expect(res.status).toBe(302)
  })
})


describe("API Broker Endpoints", () => {
  let app;

  beforeAll(() => app = getApp())

  beforeEach(() => editOpenIdMock())


  test("/broker/market => Market Trend View Success (with wrong parameters)", async () => {
    const res = await request(app).get("/broker/market").send({market: -50, yearsCount: -50})
    expect(res.body.success).toBe(true)
    expect(res.body).toHaveProperty("graphData")
  })

  test("/broker/market => Market Trend View Failed (Not Broker)", async () => {
    editOpenIdMock({isAuthenticated: true, role: "user"})

    const res = await request(app).get("/broker/market").send({market: 0, yearsCount: 5})
    expect(res.status).toBe(302)
  })

  test("/broker/market => Market Trend View Failed (Not Auth)", async () => {
    editOpenIdMock({isAuthenticated: false, role: ""})

    const res = await request(app).get("/broker/market").send({market: 0, yearsCount: 5})
    expect(res.status).toBe(302)
  })
})


