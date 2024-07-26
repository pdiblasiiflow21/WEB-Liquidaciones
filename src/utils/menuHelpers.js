
import menuItems from '../constants/menu'
import Vue from 'vue';
import Vuex from 'vuex';
import dataSX from '../auth/index'
import store from '../store'
 
// => 'config'
 
 
 

Vue.use(Vuex);

function getPermissionfromJwt(token) {
    try {
      var objx =  JSON.parse(atob(token.split('.')[1])) ;
      return objx.permissions ;
      
    } catch (error) {
      return undefined
    }
  }
  

 

function getReads(permissions) {
    
     var result = [];
    permissions.map((p) => {
        if (p.substring(0, 4) == "read") {
            result.push(p.substring(5, p.length));
        }

    })
  return result;
}


function getWrites(permissions) {
    var result = [];
    permissions.map((p) => {
        if (p.substring(0, 5) == "write") {
            result.push(p.substring(6, p.length));
        }
    })
  return result;
}
  
 


function removefromMenu(array1, permissions) {
    var a = [];

    array1.map((x) => {
        if (Array.isArray(x["subs"])) {
            x["subs"].map((y) => {
                if (existe(y.id, permissions)) {

                } else {

                    x["subs"] = x["subs"].filter(data => data.id != y.id);

                }
                    a.push(y["id"]);
            });
        } else {
            if (existe(x.id, permissions)) {

            } else {

                array1 = array1.filter(data => data.id != x.id);

            }
            a.push(x["id"]);
        }
    });
    function existe(cadena, array) {
        var result = false;
        array.map((x) => {

            if (x == cadena) {

                result = true;
            }

        });
        return result;
    }

    function existe(cadena, array) {
        var result = false;
        array.map((x) => {    
            if (x == cadena) {    
                result = true;
            }    
        });
        return result;
    }
   
    // var permissions = ["conceptos", "monedas"]
    var a = [];
    
    array1.map((x) => {
        if (Array.isArray(x["subs"])) {
            x["subs"].map((y) => {
                if (existe(y.id, permissions)) {
                        
                } else {
                    x["subs"] = x["subs"].filter(data => data.id != y.id);
                }               
            });
        } else {
            if (existe(x.id, permissions)) {

            } else {

                array1 = array1.filter(data => data.id != x.id);

            }
             
        }

    });
    var indexes = [];
    array1.forEach((element, index) => {
        if (element['subs'] && element['subs'].length == 0) {
            indexes.push(index);
        }
    });

    if (indexes && indexes.length > 0) {
        indexes.forEach(item => {
            array1.splice(item, 1);
        })
    }
     return array1;

}



function updateMenu( token){
    var array1 =  menuItems;    
     
    var token =  store.state.auth.token;
     const permissions = getPermissionfromJwt(token);
     const writeData = getReads(permissions);
     return  removefromMenu(array1,writeData);
     
}

export default updateMenu(  );