const settings = {
    DESA: {
        
       //apiUrl: "https://localhost:5000/",
       apiUrl: "https://qa-apiliquidaciones.iflow21.com/",
       
        clientId: "administracionWebApp",
        auth0: {
            domain: "iflowliquidaciones-qa.us.auth0.com",
            clientId: "sK4g6ePNYOJtKPHtOQqPztlAyuoCQpmX",
            audience: "https://iflowliquidaciones-qa",
            scope: "openid profile roles",
            redirectTo: "https://qa-liquidaciones.iflow21.com"
        }
    },
    TEST: {
        apiUrl: "https://localhost:5000/",
        //apiUrl: "https://qa-apiliquidaciones.iflow21.com/",
        clientId: "administracionWebApp",
        auth0: {
            domain: "iflowliquidaciones-qa.us.auth0.com",
            clientId: "sK4g6ePNYOJtKPHtOQqPztlAyuoCQpmX",
            audience: "https://iflowliquidaciones-qa",
            scope: "openid profile roles",
            //redirectTo: "https://localhost:5000/"
            redirectTo: "https://qa-liquidaciones.iflow21.com"
        }
    },
    PROD: {
        apiUrl: "https://apiliquidaciones01.iflow21.com/",
        clientId: "administracionWebApp",
        auth0: {
            domain: "iflowliquidaciones.us.auth0.com",
            clientId: "vaxHcZBOr3lP8zJCnKHXkUpf3ElEirsg",
            audience: "https://iflowliquidaciones",
            scope: "openid profile roles",
            redirectTo: "https://liquidaciones01.iflow21.com"
        }
    }
};

export default settings[process.env.NODE_ENV];



