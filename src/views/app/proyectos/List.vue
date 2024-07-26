<template>
  <div class="proyectos-container">
    <div class="grid">
      <list-view
        resource="proyectos"
        :onBeforeSave="onBeforeSave"
        :method="getFiltered"
        :customValidations="customValidations"
        :showActions="true"
        :showEdit="true"
        :showDelete="true"
        :modalSize="modalSize"
        :searchSize="searchSize"
        :filter="{id: filtroGrillaOptions.selected === 1 ? 1 : 2 }"
        :onBeforeEdit="onBeforeEdit"
        ref="list"
      >
      <template slot="action-btn">
           <b-button variant="primary" size="lg" class="top-right-button" @click="sincronizar">Sincronizar</b-button>
      </template>
        <template slot="title"> Proyectos </template>
        <template slot="filters"> 
          <b-colxx :xxs="6">
              <div class="filter   float-md-left mr-12 align-top"></div>
               <div class="filter-sm">
                  <b-form-select  variant="outline-info" class="filter-select"   v-model="filtroGrillaOptions.selected" v-on:change="refreshGridItem($event, value)" >
                    <option v-for="(selectOption, indexOpt) in filtroGrillaOptions.options"  :key="indexOpt" :value="selectOption.value">
                      {{ selectOption.text }}
                    </option>
                  </b-form-select>
               </div>          
            </b-colxx>
        </template>        
        <template slot="columns"> 
          <column field="id" title="Id" width="40" />
          <column
            :field="
              (entity) => {
                return entity.cliente != null ? `${entity.cliente.nombres} ${entity.cliente.apellidos ? entity.cliente.apellidos : ''}` : '';
              }
            "
            title="Cliente"
            width="120"
          />
           <column field="nombre" title="Proyecto" width="160" />
           <column :field="(entity) => maskForCulNum(entity.valorTotal)"  title="Valor" width="160" />
          <!-- <column
            :field="
              (entity) => {
                return entity.usuario != null ? `${entity.usuario.nombre} ` : '';
              }
            "
            title="Comercial"
            width="120"
          /> -->
           <column
            :field="
              (entity) => {
                return entity.estado != null ? `${entity.estado.descripcion} ` : '';
              }
            "
            title="Estado"
            width="80"
          />
            <column :field="(entity) => moment(entity.fechaDeAprobacion).format('DD/MM/YYYY')" title="F. de Aprobación" width="80"  />
          <!-- <column :field="(entity) => { return entity.direccion != null ? `${entity.direccion} ` : '' }" title="Dirección" width="200" />   
                    <column :field="(entity) => { return entity.email != null ? `${entity.email} ` : '' }" title="Email" width="80" />  
                    <column :field="(entity) => { return entity.celular != null ? `${entity.celular} ` : '' }" title="Nro Telefónico (Celular)" width="80" />    
                    <column :field="(entity) => { return entity.diasPago != null ? `${entity.diasPago} ` : '' }" title="Dias Pago" width="80" />                                          -->
        </template>
          <template slot="action-column" slot-scope="props">
             <b-button class="mb-1" size="xs" variant="outline-info" v-if="props.entity.estadoId !== 5"  @click="changeStatusConfirm(props.entity)" >Finalizar</b-button>
            <b-button class="mb-1" variant="outline-info" size="xs" @click="viewHistory(props.entity)">Ver Historial</b-button>                    
            <historial-proyectos  ref="historialProyectoModal" :parent="props.entity"></historial-proyectos>              
          </template>
        <template slot="modal-form" slot-scope="props">          
          <b-row>
            <b-col>
              <b-form-group label="Código">
                <b-form-input v-model="props.form.entity.id" placeholder="Código" :disabled="true" />
              </b-form-group>
            </b-col>
             <b-col>
              <b-form-group label="Código PipeDrive">
                <b-form-input v-model="props.form.entity.dealPipeDrive" placeholder="Código" :disabled="true" />
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group label="Estado *"> 
                <select-deluxe resource="estados" method="getAll" selectItemLabel="descripcion" placeholder="Seleccionar estado" v-model="props.form.entity.estado"  :state="$isValid(props.form.$v.form.entity.estado)"></select-deluxe>
                 <div class="invalid-feedback show" v-if="$isValid(props.form.$v.form.entity.estado) === false">Seleccionar estado</div>      
              </b-form-group>             
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-form-group label="Nombre de Proyecto *">
                <b-form-input v-model="props.form.entity.nombre" placeholder="Nombre de Proyecto" :state="$isValid(props.form.$v.form.entity.nombre)" />
                <b-form-invalid-feedback>Ingrese Nombre del Proyecto</b-form-invalid-feedback>
              </b-form-group>
            </b-col>            
             <b-col>
              <b-form-group label="Fecha de Aprobación"> 
                <b-form-datepicker v-model="props.form.entity.fechaDeAprobacion" placeholder="Fecha de Aprobación"></b-form-datepicker>     
              </b-form-group>             
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-form-group label="Cliente *"> 
                <select-deluxe resource="clientes" :selectItemLabel="({ nombres, apellidos }) => `${nombres ? nombres : ''} ${apellidos ? apellidos : ''}`" method="getAll" placeholder="Seleccionar cliente" v-model="props.form.entity.cliente"  :state="$isValid(props.form.$v.form.entity.cliente)"></select-deluxe>
                <div class="invalid-feedback show" v-if="$isValid(props.form.$v.form.entity.cliente) === false">Ingrese el cliente</div>                                 
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group label="Usuario *"> 
                <!-- <select-deluxe resource="usuarios" selectItemLabel="nombre" method="getAll" placeholder="Seleccionar usuario" v-model="props.form.entity.usuario"  :state="$isValid(props.form.$v.form.entity.usuario)"></select-deluxe> -->
                   <b-form-select v-model="props.form.entity.usuarioId"  size="sm" :disabled="isAdmin()" :state="$isValid(props.form.$v.form.entity.usuarioId)" @change="onChangeUser($event)">
                     <option v-for="(selectOption, indexOpt) in userOptions.options"  :key="indexOpt" :value="selectOption.userId">
                      {{ selectOption.userEmail }}
                    </option>
                   </b-form-select>
                <b-form-invalid-feedback>Ingrese el Usuario</b-form-invalid-feedback>
              </b-form-group>         
            </b-col>
          </b-row>
          <b-row>
            <b-col>
             <b-form-group label="Cuenta *"> 
                <select-deluxe resource="origenes"  :selectItemLabel="({ nombre }) => `${nombre}`"  method="getAll"  placeholder="Seleccionar cuenta" v-model="props.form.entity.origen" :state="$isValid(props.form.$v.form.entity.origen)"></select-deluxe>    
                 <div class="invalid-feedback show" v-if="$isValid(props.form.$v.form.entity.origen) === false">Ingrese la cuenta</div>      
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group label="Importe total (sin iva) *"> 
                  <b-form-input type="text" v-model="props.form.entity.valorTotal" :min="0" placeholder="Importe total (sin iva)"  v-mask="mask" :state="$isValid(props.form.$v.form.entity.valorTotal)" />
                  <b-form-invalid-feedback v-if="props.form.entity.valorTotal === '' || !props.form.entity.valorTotal">Ingrese un valor</b-form-invalid-feedback>
                  <b-form-invalid-feedback v-if="props.form.entity.valorTotal < 0">Ingrese un importe mayor a 0</b-form-invalid-feedback>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group label="Duración del proyecto (meses) *">
                <b-form-input type="number" v-model="props.form.entity.duracionEnMeses"  :min="0" placeholder="Duración del proyecto (meses)" :state="$isValid(props.form.$v.form.entity.duracionEnMeses)"/>  
                      <b-form-invalid-feedback v-if="props.form.entity.duracionEnMeses === '' || !props.form.entity.duracionEnMeses">Ingrese la duración del proyecto</b-form-invalid-feedback>
                  <b-form-invalid-feedback v-if="props.form.entity.duracionEnMeses < 0">Ingrese un importe mayor a 0</b-form-invalid-feedback>
              </b-form-group>
            </b-col>
             <b-col>
              <b-form-group label="Forma de Facturación *">
                  <b-form-select v-model="props.form.entity.formaFacturacionId" :options="formasFacturacion" placeholder="Forma de Facturación" :state="$isValid(props.form.$v.form.entity.formaFacturacionId)">                      
                  </b-form-select>
                  <b-form-invalid-feedback>Forma de Facturación</b-form-invalid-feedback>
              </b-form-group>
            </b-col>
          </b-row>
        <!--  <b-row>
           
             <b-col>
              <b-form-group label="Tipo de Comprobante">
                <b-form-input v-model="props.form.entity.tipoComprobante" placeholder="Tipo de Comprobante" :state="$isValid(props.form.$v.form.entity.tipoComprobante)" />
                <b-form-invalid-feedback>Ingrese Tipo de Comprobante</b-form-invalid-feedback>
              </b-form-group>
            </b-col>
          </b-row> -->
          <b-form-group v-if="props.form.entity && props.form.entity.id > 0">
            <b-row  style="margin-top: 15px;">
              <b-col>
                <h3>Hitos</h3>
              </b-col>
              <b-col>
                <div class="top-right-button-container">
                  <b-button variant="primary" size="xs" class="mb-1 top-right-button" v-if="canAddHito()" @click="setCreateHito(props.form.entity, 'Alta', props.form.entity.cliente)">Nuevo Hito</b-button>       
                </div>   
              </b-col>
            </b-row>
          </b-form-group>         
          <hitosComponent  ref="hitoModal" v-if="props.form.entity && props.form.entity.id > 0" :parentId="props.form.entity.id"></hitosComponent>
        </template>
      </list-view>
      <b-modal ref="confirmModal" title="FINALIZAR PROYECTO">
                ¿Confirma que desea Finalizar el proyecto {{bodyChangeStatus}} ? 
                <!-- <error-info :show="resultModal.hasErrors" :messages="resultModal.messages"></error-info> -->
                <template slot="modal-footer">
                    <b-button variant="primary" @click="changeStatus()" class="mr-1">Aceptar</b-button>
                    <b-button variant="secondary" @click="$refs.confirmModal.hide()">Cancelar</b-button>
                </template>
            </b-modal>
    </div>
    <loading ref="loader" />
    
  </div>
</template>

<script>
import moment from 'moment';
import hitosComponent from '../hitos/List.vue';
const { required, minValue } = require("vuelidate/lib/validators");
import store from '../../../store'
import apiServices from "../../../api-services";
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import vuexStore from '../../../store';

const currencyMask = createNumberMask({
  prefix: '',
  allowDecimal: true,
  thousandsSeparatorSymbol: '.',
  decimalSymbol: ',',
  allowNegative: false,
});

export default {
  components: {
    hitosComponent,
    
  },
  data() {
    return {
        mask: currencyMask,
        moment: moment,
        customValidations: {
        codigo: {},        
        estado: { required },
        nombre: { required },
        cliente: { required },
        usuarioId: { required },
        origen:  { required },
        duracionEnMeses: { required },
        valorTotal: { required },
        formaFacturacionId: { required },
        // tipoComprobante: { required },
        fechaDeAprobacion: {},
      },      
      users: [],
      origenes: [],
      modalSize: 'xl',
      searchSize: '6',
      getFiltered: 'getFilteredStatus',
      filtroGrillaOptions: {
        selected: 1,
        options: [
          { value: 1, text: 'Activos'},
          { value: 2, text: 'Finalizados'}
        ]
      },      
      filterGrilla:  { id: 1 },
      value: { id: 1 },
      api: this.$api['proyectos'],   
      formasFacturacion: [
              { value: 1, text: 'Hito'},
              { value: 2, text: 'Mensual'},
              { value: 3, text: 'Único Pago'}
            ],            
      apiOrigen: this.$api['origenes'],
      token: store.state.auth.token,
      proyectyoSelected: null,
      bodyChangeStatus: '',      
      canAddVenta: false,
      canAddGasto: false,
      currentUser: vuexStore.state.user.currentUser,
      userOptions: {
        selected: 1,
        options: [
          { value: 1, text: 'Activos'},
          { value: 2, text: 'Finalizados'}
        ]
      },
       }
  },
  methods: {
    maskForCulNum(value) {
      value = value.toString();
      if (value.indexOf('.') <= -1) {
        value = value + '.00';
      } else {
        const regDecimal = /^\-?[0-9]+(?:\.[0-9]{2})?$/;
        if (!regDecimal.test(value)){
          value = value + '0';
        }
      }
      const replnum = value.replace('.', ',');
      const numbers = replnum.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return numbers;
    },
    isAdmin() {          
      for(let i = 0; i < this.currentUser.role.length; i++) {
        if (this.currentUser.role[i] == 'SuperAdmin' || this.currentUser.role[i] == 'Admin'){
          return false;
        }
      }
      return true;
    },
    onBeforeEdit(form) {
      const user = this.users.find(x => x.userEmail === this.currentUser.email);
      this.userOptions.options = [ ...this.users ];
      if (form.entity.valorTotal) {
        form.entity.valorTotal = this.maskForCulNum(form.entity.valorTotal);
      }
      
      if (user) {
        this.userOptions.selected = user.userId;
        form.entity.usuarioId = user.userId;
      }      
    },
    onBeforeSave(form) {
      let result = { hasErrors: false, messages: [] };
      //add validations here
      result.hasErrors = result.messages.length > 0;
      if (form.entity.valorTotal) {
        form.entity.valorTotal = form.entity.valorTotal.toString().replaceAll('.','').replace(',', '.');
      }      
      return Promise.resolve(result);
    },
    canAddHito() {   
      var objx =  JSON.parse(atob(this.token.split('.')[1])) ;
      this.canAddVenta = objx.permissions.indexOf("write:hitosVentas") > -1;
      this.canAddGasto = objx.permissions.indexOf("write:hitosPagos") > -1;
      return  this.canAddVenta || this.canAddGasto;
    },
    setCreateHito (p, t, c) {
       this.$refs.loader.show();
       this.$refs.hitoModal.show(p, t + ' | ' + p.nombre, c, this.canAddVenta, this.canAddGasto);  
       this.$refs.loader.hide(300);      
    },
     viewHistory (entity) {
       this.$refs.loader.show();
       this.$refs.historialProyectoModal.show(entity);  
       this.$refs.loader.hide(300);      
    },
    changeStatusConfirm(entity){
        this.proyectyoSelected = entity;
        this.bodyChangeStatus = entity.nombre;
        this.$refs.confirmModal.show();
    },  
    getUsers: function () {
      return apiServices.get("asignacion/users");
    },
    getOrigenes: function () {
      return this.apiOrigen.getAll();
    },
    async changeStatus(){    
        this.$refs.confirmModal.hide();   
        this.$refs.loader.show();     
        this.proyectyoSelected.estado.id = 5;
        await this.api.update({ id: this.proyectyoSelected.id} , this.proyectyoSelected);       
        this.$refs.loader.hide();      
        this.$refs.list.search();
    },
    refreshGridItem: function(id) {
        this.$refs.list.search();
      },
    sincronizar: function(id) {
      return apiServices.proyecto().then(function (response) {
          this.$refs.list.search();
      })
    }
  }, 
   mounted: function () {
    var _this = this;

    this.getUsers()
      .then(function (response) {
        _this.$data.users = response.data; // #1
      })
      .catch(function (error) {
        _this.showError(error);
      });

      this.getOrigenes()
        .then(function (response) {
                  _this.$data.origenes = response.data.data; // #1
      })
      .catch(function (error) {
        _this.showError(error);
      });
  },  
};
</script>


<style>
.invalid-feedback.show {
  display: block;
}

    .filter {
        width: 100%;
        display: flex;
    }

    .filter .filter-sm{
        width: 100%;
        display: flex;
    }
  
.filter-select {
      border-radius: 23px;
    margin: 10px 0;
    height: 28px;
    background: none;
    outline: initial !important;
    border: 1px solid #8f8f8f;
    border-radius: 15px;
    padding: 0.25rem 0.75rem 0.25rem 0.75rem;
    font-size: 0.76rem;
    line-height: 1.3;
    color: #212121;
}

    .filter i {
        font-size: 20px;
        color: #666;
        cursor: pointer;
        margin: 4px;
        border-radius: 3px;
        position: relative;
        top: -1px;
    }

    .filter i:hover {        
        color: #333;        
        background-color: #eee;
    }

    .custom-select {
      font-size: 13px;
    }

</style>