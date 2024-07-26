  <template>
  <div class="welcome">
    <h2>Bienvenido PRUEBA PARA OMAR <strong>{{currentUser.displayname}}</strong> al sistema de Liquidaciones</h2>
    <span class="home-logo"></span>
   </div>
</template>

<script>

import {
    mapGetters
} from "vuex";

    export default {      
    computed: {
        ...mapGetters({
             currentUser: "currentUser",
        })
    },
};
</script>


<style>


.welcome {
   display: flex;
    flex-direction: column;
    justify-content: center;
    height: 80vh;
    width: 100%;
    text-align: center;
}

   .home-logo{
    height: 80%;
    background: url(/assets/img/logo-black.png) no-repeat;
    background-position: center center;
    background-size: 45%;
   }

</style>