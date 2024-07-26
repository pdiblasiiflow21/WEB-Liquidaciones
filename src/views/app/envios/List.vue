<template>
    <div class="envios-container" v-if="canSeePage()">
        <list-view
            ref="listView"
            resource="detalleliquidacionpos"
            :filter=filtroGrillaOptions
            :onAfterLoad="onAfterLoad"
            :onBeforeSave="onBeforeSave"
            :onBeforeEdit="onBeforeEdit"
            :showActions="true"
            :showEdit="false"
            :showDelete="false"
            :searchSize="searchSize"              
            :searchBy="sada"
            :showCheck="true" 
            :checkFunction="checkAllFunction"
        >
            <template slot='title'>
                Envíos 
            </template>

            <template slot="action-btn">             
                <b-button variant="dark" size="sm"  @click="resetData"><img src="/assets/img/borrador.png" height ="20" width="20" /></b-button>
                <b-button variant="info" size="sm" :disabled="this.exportablesSelected.length <= 0 && !this.checkAllChecked" @click="ExportExcelConfirm" >Exportar a Excel</b-button>
                <b-button variant="primary" :disabled="this.enviosSelected.length<=0 && !this.checkAllChecked" @click="GenerarLiquidacionConfirm">Generar Liquidación</b-button>
            </template> 

        <template slot="filters"> 
                <b-colxx :xxs="3">
                <div class="filter   float-md-left mr-6 align-top"></div>
                <div class="filter-sm">
                    <select-deluxe resource="clientes" class="list-filter" :filter="filterClient" :selectItemLabel="({ razonSocialNombre }) => `${razonSocialNombre}`"  method="getAll"  valueField="id" placeholder="Seleccionar cliente" v-model="filtroGrillaOptions.clienteId" ></select-deluxe>
                </div>          
            </b-colxx>      

            <b-colxx :xxs="3">
              <div class="filter   float-md-left mr-6 align-top"></div>
               <div class="filter-sm">
                     <b-form-datepicker  class="filter-select" v-model="filtroGrillaOptions.fecha_desde" placeholder="Fecha Desde" style="border-radius: 25px;"></b-form-datepicker>     
               </div>          
            </b-colxx>
            <b-colxx :xxs="3">
              <div class="filter   float-md-left mr-6 align-top"></div>
              <div class="filter-sm">
                <b-form-datepicker  class="filter-select"  v-model="filtroGrillaOptions.fecha_hasta" placeholder="Fecha Hasta" style="border-radius: 25px;"></b-form-datepicker>     
              </div>
            </b-colxx>
            <b-colxx :xxs="3">
              <div class="filter   float-md-left mr-12 align-top"></div>
                <div class="filter-sm">
                  <b-form-select  variant="outline-info" class="filter-select"   v-model="filtroGrillaOptions.estado" style="border-radius: 25px;">
                    <option v-for="(selectOption, indexOpt) in filtroGrillaOptions.options"  :key="indexOpt" :value="selectOption.value">
                      {{ selectOption.text }}
                    </option>
                  </b-form-select>
               </div>         
            </b-colxx>
        </template> 

            <template slot='columns'>
                <column field="id" title="Id" width="15" />
                <column :field="(entity) => moment(entity.fecha).format('DD/MM/YYYY')"  title="Fecha" width="40" />   
                <column :field="(entity) => entity.cliente.razonSocialNombre"  title="Cliente" width="40" />                                         
                <column field="etiqueta" title="Etiqueta" width="50" />                                                
                <column :field="(entity) => entity.cantidad" title="Cantidad" width="100" />
                <column :field="(entity) => maskForCulNum(entity.valoritems)" title="Valor ítems" width="100" />                                                                                                                                            
                <column :field="(entity) => entity.peso" title="Peso" width="50" />                                            
                <column :field="(entity) => entity.volumen" title="Volumen" width="50" />                                            
                <column :field="(entity) => entity.ancho" title="Ancho" width="50" />                                            
                <column :field="(entity) => entity.largo" title="Largo" width="50" />                                            
                <column :field="(entity) => entity.alto" title="Alto" width="50" />                                                                                  
                <column :field="(entity) => maskForCulNum(entity.valorSinImpuesto)" title="Importe sin impuestos" width="100" />                                                
                <column :field="(entity) => getEstado(entity.estado)" title="Estado" width="50" />                                            
            </template>
            <template slot="action-column" slot-scope="props">
                <slot name="action-column" v-bind:entity="props.entity"></slot>
                <b-checkbox ref="checkLiquidar" class="mb-1" size="m" variant="outline-info" :disabled="props.entity.estado==1" @change="seleccionarEnvio(props.entity, props.entity.id)" v-model="props.entity.check">Liquidar</b-checkbox>
                <b-checkbox class="mb-1 mx-2" size="m" variant="outline-info" :disabled="props.entity.estado==0" @change="seleccionarExportable(props.entity, props.entity.id)" v-model="props.entity.exportar">Exportar</b-checkbox>
            </template>
        </list-view>

        <b-modal ref="confirmModal" title="GENERAR LIQUIDACIÓN">
                <input type="text" id="textdescripcion" ref="textdescripcion" class="form-control" pattern="[A-Za-z0-9]{8,20}"  placeholder="Ingrese la descripción de la liquidación" required>
                <template slot="modal-footer">
                    <b-button variant="primary" @click="GenerarLiquidacion($refs.textdescripcion.value)" class="mr-1">Aceptar</b-button>
                    <b-button variant="secondary" @click="$refs.confirmModal.hide()">Cancelar</b-button>
                </template>
        </b-modal>

        <b-modal ref="exportModal" title="EXPORTAR A EXCEL">
            <p class="text-center mb-0">{{this.getExportableMessage()}}</p>
                <template slot="modal-footer">
                    <b-button variant="primary" @click="ExportarSeleccionados() && $refs.exportModal.hide()" class="mr-1">Aceptar</b-button>
                    <b-button variant="secondary" @click="$refs.exportModal.hide()">Cancelar</b-button>
                </template>
        </b-modal>

        <loading ref="loader" />

    </div>
    <div v-else>
        <div class="welcome">
            <h2>No tiene permisos para ver esta pantalla</h2>
            <span class="home-logo"></span>
        </div>
    </div>
</template>

<script>

    import moment from 'moment';
    import { validationMixin } from 'vuelidate'    
    const { required, sameAs } = require("vuelidate/lib/validators");  
    import apiServices from "../../../api-services";
    import store from '../../../store'
    import createNumberMask from 'text-mask-addons/dist/createNumberMask';
    const currencyMask = createNumberMask({
      prefix: '',
      allowDecimal: true,
      thousandsSeparatorSymbol: '.',
      decimalSymbol: ',',
      allowNegative: false,
    });

    export default {
        mixins: [validationMixin],
        data () {
            return {
                numberMask: currencyMask,
                searchSize: '0',
                disabledtxt: true,
                disabledexportExcel: true,
                filtroGrillaOptions: {
                    clienteId: null,
                    fecha_desde: null,
                    fecha_hasta: null,
                    selected: null,
                    estado: null,
                    options: [
                        { value: null, text: 'Estados Facturación (Todos)'},
                        { value: 2, text: 'Pendiente'},
                        { value: 1, text: 'Liquidada'}
                    ]
                },
                filterClient: {
                    tipoCliente: 2
                },
                users: [],
                moment: moment,
                modalSize: 'xl',
                cannotSetBillData: true,
                token: store.state.auth.token,
                estados: {
                      selected: 1,
                      opciones: [
                    { value: 2, text: 'Pendiente'},
                    { value: 1, text: 'Liquidada'}
                ]
                },
                generaliquidacionrequest: {
                    descripcion: '',
                    ids_envios: []
                },
                titleChangeStatus: '',
                bodyChangeStatus: '',       
                enviosSelected: [],
                exportablesSelected: [],
                txtDescripcionLiquidacion: '',
                api: this.$api['detalleliquidacionpos'],   
                sada: 'Buscar por Etiqueta',
                uncheckedIds: [] ,
                uncheckedIdsToExport: [] ,
                checkAllChecked: false,
            }
        },
        validations: {
            form: {
                entity: {
                },        
            }
        },
        methods: {          
            checkAllFunction() {
                this.checkAllChecked = !this.checkAllChecked
                if (this.checkAllChecked) {
                    for (var i = 0; i < this.$refs.listView.$refs.dataGrid.rows.length; i++) {
                        var entity = this.$refs.listView.$refs.dataGrid.rows[i];
                        this.enviosSelected.push(entity.id);
                        this.exportablesSelected.push(entity.id);
                        entity.exportar = true;
                        entity.check = true;
                   }
                } else {
                    this.$refs.listView.$refs.dataGrid.rows.map(x => {x.check = false, x.exportar = false})
                    this.exportablesSelected = []
                    this.enviosSelected = []
                    this.uncheckedIds = [];
                    this.uncheckedIdsToExport = [];
                }           
            },
            canSeePage(){                          
                if (this.token) {
                    var objx =  JSON.parse(atob(this.token.split('.')[1])) ;
                    return objx.permissions.indexOf("read:envios") > -1 ;
                }        
            },
            generaliquidacion(generaliquidacionrequest) {
                 return this.api.generaliquidacion(generaliquidacionrequest);
            },
            beDisabled(estado) {
                return estado === 2;
            },            
            getUser(id) {
                const user = this.users.find(x => x.userId ===id);    
                if (user) {
                    return user.nombre;
                }
                else
                {
                    return '';
                }
                
            },
            getUsers: function () {
                return apiServices.get("asignacion/users");
            },
            maskForCulNum(value) {
                if (value) {
                    value = value.toString();
                    if (value.indexOf('.') <= -1) {
                      value = value + '.00';
                    } else {
                      const regDecimal = /^\-?[0-9]+(?:\.[0-9]{2})?$/;
                      if (!regDecimal.test(value)){
                        value = value + '0';
                      }
                    }
                }
              const replnum = value.replace('.', ',');
              const numbers = replnum.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
              return numbers;
            },      
            checkFormPermissions() {
                var objx =  JSON.parse(atob(this.token.split('.')[1])) ;
                this.cannotSetBillData = objx.permissions.indexOf("write:datosLiquidaciones") > -1;
            },
            async exportFile(){
                this.$refs.loader.show();
                let response = await this.api.exportFile({desde: this.filtroGrillaOptions.fechaDesde, hasta: this.filtroGrillaOptions.fechaHasta, estado: this.filtroGrillaOptions.selected})
                if(response){
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'reporte-envios.csv');
                    document.body.appendChild(link);
                    link.click();
                }
                this.$refs.loader.hide();

            },
            refreshGridItem () {
                let cfiler = this.filtroGrillaOptions;
                this.enviosSelected = []
                this.$refs.listView.search();
            },
            onAfterLoad() {
                if (this.checkAllChecked) {
                    for (var i = 0; i < this.$refs.listView.$refs.dataGrid.rows.length; i++) {
                        var entity = this.$refs.listView.$refs.dataGrid.rows[i];         
                        if (!this.uncheckedIds.includes(entity.id))
                        {
                            this.enviosSelected.push(entity.id);
                            entity.check = true;
                        }
                        if (!this.uncheckedIdsToExport.includes(entity.id))
                        {
                            this.exportablesSelected.push(entity.id);
                            entity.exportar = true;
                        }
                   }
                } else {
                    this.disabledexportExcel = this.$refs.listView.$refs.dataGrid.rows.length <= 0;
                    for (var i = 0; i < this.enviosSelected.length; i++) {
                        var found = this.$refs.listView.$refs.dataGrid.rows.find(x => x.id === this.enviosSelected[i]);
                        if (found) {
                            found.check = true;
                        }
                   }
                   for (var i = 0; i < this.exportablesSelected.length; i++) {
                        var foundExportar = this.$refs.listView.$refs.dataGrid.rows.find(x => x.id === this.exportablesSelected[i]);
                        if (foundExportar) {
                            foundExportar.exportar = true;
                        }
                   }
                }
            },
            onBeforeLoad() {
                let cfiler = this.$refs.listView;
            },
            seleccionarEnvio(entity, id){
                const found = this.enviosSelected.find(element => element == id);
                if (found == null)
                {
                    this.enviosSelected.push(id);
                    entity.check = true;                    
                    if (this.checkAllChecked) {
                        this.removeFromUnchecked(entity.id)
                    }
                }
                else 
                {
                    this.enviosSelected.forEach(function(envio, index, object) {
                    if(envio == id){
                        object.splice(index, 1);
                    }
                    });
                    entity.check = false;                    
                    if (this.checkAllChecked) {              
                        this.addToUnchecked(entity.id)
                    }
                }   
            },
            getExportableMessage()
            {               
                return  this.checkAllChecked ? 'Se exportará el detalle de todos los envíos seleccionados.' :  'Se exportará el detalle de' + (this.exportablesSelected.length?.toString() +
                        (this.exportablesSelected.length > 1 ? ' envíos' : ' envío'));
            },
            seleccionarExportable(entity, id){
                const found = this.exportablesSelected.find(element => element == id);
                if (found == null)
                {
                    this.exportablesSelected.push(id); 
                    entity.exportar = true;
                    if (this.checkAllChecked) {
                        this.removeFromUncheckedExport(entity.id)
                    }
                }
                else 
                {
                    this.exportablesSelected.forEach(function(ordenpago, index, object) {
                    if(ordenpago == id){
                        object.splice(index, 1);
                    }
                    });
                    entity.exportar = false;
                    if (this.checkAllChecked) {              
                        this.addToUncheckedExport(entity.id)
                    }
                }
            },  
            addToUnchecked(id) {
            this.uncheckedIds.push(id)
            },
            removeFromUnchecked(id) {
                var indexPos = this.uncheckedIds.indexOf(id)
                if (indexPos > -1) {
                    this.uncheckedIds.splice(indexPos, 1)
                }    
            },
            addToUncheckedExport(id) {
            this.uncheckedIdsToExport.push(id)
            },
            removeFromUncheckedExport(id) {
                var indexPos = this.uncheckedIdsToExport.indexOf(id)
                if (indexPos > -1) {
                    this.uncheckedIdsToExport.splice(indexPos, 1)
                }    
            },
            getEstado: function (id) {
                return this.estados.opciones.find(x => x.value === id).text;
            },
            resetData() {
                this.resetFilters();
            },
            resetFilters() {
                this.filtroGrillaOptions.clienteId = null;
                this.filtroGrillaOptions.fecha_desde = null;
                this.filtroGrillaOptions.fecha_hasta = null;
                this.filtroGrillaOptions.estado = null;
                this.$refs.listView.resetTextAndSearch();
            },
            GenerarLiquidacionConfirm(){
                 this.titleChangeStatus = 'GENERAR';
                 this.bodyChangeStatus = '¿Confirma que desea GENERAR la Liquidacion?';
                 this.$refs.confirmModal.show();
            },
            ExportExcelConfirm(){
                 this.$refs.exportModal.show();
            },
            async GenerarLiquidacion(textdescripcion){
                this.$refs.loader.show();
                if (this.checkAllChecked) {
                    await this.api.generaallliquidaciones({
                        descripcion: textdescripcion,
                        uncheckedIds: this.uncheckedIds,
                        fechaDesde: this.filtroGrillaOptions.fecha_desde,
                        fechaHasta: this.filtroGrillaOptions.fecha_hasta ,
                        clienteId: this.filtroGrillaOptions.clienteId,
                        search: this.$refs.listView.multiColumnSearchText
                    })
                    .then((response) => {
                        try {
                            this.$refs.confirmModal.hide();

                            if(response.ok) {
                                this.refreshGridItem();
                            }
                            this.$refs.loader.hide();
                        }
                        catch (err) {
                            this.$refs.loader.hide();
                        }
                    })
                } else {
                this.txtDescripcionLiquidacion = textdescripcion;
                this.generaliquidacionrequest.descripcion = textdescripcion;
                this.generaliquidacionrequest.ids_envios = this.enviosSelected;          
                let response = await this.generaliquidacion(this.generaliquidacionrequest);
                this.$refs.confirmModal.hide();

                if(response.ok) {
                    this.refreshGridItem();
                }
                this.$refs.loader.hide();
            }
                
            },
            async ExportarSeleccionados(){
                this.$refs.loader.show()
                if (this.checkAllChecked) {
                    await this.api.exportAllToExcel({
                        uncheckedIds: this.uncheckedIdsToExport,
                        fechaDesde: this.filtroGrillaOptions.fecha_desde,
                        fechaHasta: this.filtroGrillaOptions.fecha_hasta ,
                        clienteId: this.filtroGrillaOptions.clienteId,
                        estado: this.filtroGrillaOptions.estado,
                        search: this.$refs.listView.multiColumnSearchText
                    })
                    .then((response) => {
                        try {
                            const url = window.URL.createObjectURL(new Blob([response.data]));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', 'Envios.xlsx');
                            document.body.appendChild(link);
                            link.click();
                            this.$refs.loader.hide()
                        }
                        catch (err) {
                            this.$refs.loader.hide();
                        }
                    })
                } else {
                    let response = await this.api.generaExcel(this.exportablesSelected)
                   if(response){
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'Envios.xlsx');
                        document.body.appendChild(link);
                        link.click();
                        this.$refs.loader.hide()
                   }
                }
            },
            onBeforeEdit (form) {
                let result = { hasErrors: false, messages: [] };
                result.hasErrors = result.messages.length > 0;
                return Promise.resolve(result); 
            },    
            onBeforeSave (form) {
                let result = { hasErrors: false, messages: [] };
                result.hasErrors = result.messages.length > 0;
                return Promise.resolve(result); 
            },
            onBeforeClose(form) {
                this.resetData();
                this.$refs.listView.search();
                return Promise.resolve(true); 
            },            
                
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
  },  
};
</script>


<style>
    .invalid-feedback.show {
        display: block
    }

    
    .button-container{
        padding-top: 4.9%;
    }

      table tbody tr.header {
        background-color: white !important;
        font-weight: 700;
        font-size: 14px;
    }

table tbody tr.header td{
        background-color: white;
    }

    
.custom-select {
      font-size: 13px;
    }
    
.envios-container .top-right-button-container .new-button {
  display: none;
}
    
.form-control view{
    border-radius: 6px;
}


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