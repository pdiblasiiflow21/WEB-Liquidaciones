<template>
    <div class="company-container">
        <div class="grid">
            <list-view
                ref="listView"
                resource="companias"
                method="basicQuery"
                :showActions="true"
            >
                <!-- TITULO -->
                <template slot="title">Compañías</template>

                <!-- COLUMNAS -->
                <template slot="columns">
                    <!-- <column field="id" title="Id" width="40"/> -->
                    
                    <column
                        :field="(entity) => moment(entity.createDate).format('DD/MM/YYYY')"
                        title="Fecha de Registro"
                    />      
                    <column field="nombre" title="Nombre"/>              
                    <column field="descripcion" title="Descripcion"/>
                    <column :field="(entity) => { return entity.nombreUsuario != null ? `${entity.nombreUsuario}  ${entity.apellidoUsuario}` : '' }" title="Responsable"/>
                    <column :field="(entity) => { return entity.licenciaActiva != null ? entity.licenciaActiva.plan.nombre : '' }" title="Licencia"/>
                    <column :field="(entity) => entity.enabled? 'Si' : 'No'" title="Habilitado"/>
                    <!-- <column :field="(entity) => { return entity.usuario.email }" title="Email"/> -->
                    
                </template>
                <template slot="action-column" slot-scope="props">
                    <b-button
                        v-if="!props.entity.enabled"
                        class="mb-1"
                        size="xs"
                        variant="outline-success"
                        @click="changeStatusConfirm(props.entity)"
                    >Habilitar
                    </b-button>
                    <b-button
                        v-if="props.entity.enabled"
                        class="mb-1"
                        size="xs"
                        variant="outline-danger"
                        @click="changeStatusConfirm(props.entity)"
                    >Deshabilitar
                    </b-button>
                    <b-button
                        v-if="props.entity.licenciaActiva != null && props.entity.licenciaActiva.plan.codigo === '001' && Date.parse(props.entity.licenciaActiva.expiracion) < Date.now()"
                        class="mb-1 button-trial"
                        size="xs"
                        variant="outline-success"
                        @click="openTrialModal(props.entity)"
                    >Reactivar trial
                    </b-button>
                </template>                

            </list-view> 
            <b-modal ref="confirmModal" :title="titleChangeStatus">
                {{bodyChangeStatus}}
                <!-- <error-info :show="resultModal.hasErrors" :messages="resultModal.messages"></error-info> -->
                <template slot="modal-footer">
                    <b-button variant="primary" @click="changeStatus()" class="mr-1">Aceptar</b-button>
                    <b-button variant="secondary" @click="$refs.confirmModal.hide()">Cancel</b-button>
                </template>
            </b-modal>
            <b-modal ref="modalTrial" :title="titleChangeStatus">
                <div class="form-group has-top-label">
                <v-date-picker
                    mode="single"
                    v-model="newExpirationDate"
                    :input-props="{ placeholder: 'Hasta'}"
                    :min-date="new Date()"
                ></v-date-picker>
                </div>
                <template slot="modal-footer">
                    <b-button variant="primary" @click="extendTrial(newExpirationDate)" class="mr-1">Aceptar</b-button>
                    <b-button variant="secondary" @click="$refs.modalTrial.hide()">Cancelar</b-button>
                </template>
            </b-modal>
        </div>  
         <loading ref="loader" />  
    </div>
</template>

<script>
import moment from 'moment';
import service from './companias-service'

export default {

    //  Al hacer click en el botón, se abre un cuadro de diálogo que dice 
    //  "¿Confirma que desea deshabilitar a la compañía [CLIENTE]? 
    //  Esta acción no le permitirá el ingreso al portal al cliente ni a ninguno de sus usuarios."
    //  o bien "¿Confirma que desea habilitar a la compañía [CLIENTE]? Esta acción le permitirá el 
    //  ingreso al portal al cliente y a todos sus usuarios." con botón SI/NO.
    data(){
        return {
            moment: moment,
            titleChangeStatus: '',
            bodyChangeStatus: '',
            companiaSelect: null,
            newExpirationDate: null
        }
    },
    methods: {
        getState(state){
            return state? 'Si' : 'No';
        },
        changeStatusConfirm(entity){
            this.companiaSelect = entity;
            this.titleChangeStatus = `¿Confirma que desea ${entity.enabled?'deshabilitar':'habilitar'} al cliente ${entity.nombre}?`; 
            this.bodyChangeStatus = entity.enabled? 
                                    'Esta acción no le permitirá el ingreso al portal a la compañía ni a ninguno de sus usuarios.':
                                    'Esta acción le permitirá el ingreso al portal a la compañía y a todos sus usuarios.';
            this.$refs.confirmModal.show();
        },  
        async changeStatus(){    
            this.$refs.confirmModal.hide();   
            this.$refs.loader.show();     
            this.companiaSelect.enabled = !this.companiaSelect.enabled; 
            await service.update(this.companiaSelect);       
            this.$refs.loader.hide();      
            this.$refs.listView.search();
        },
        openTrialModal(entity){
            this.companiaSelect = entity;
            this.titleChangeStatus = `Indique la fecha a la que desea extender la licencia.`;
            this.bodyChangeStatus = `Hasta:`;
            this.$refs.modalTrial.show();
        },
        async extendTrial(newExpirationDate){
            this.companiaSelect.licenciaActiva.expiracion = newExpirationDate;
            await service.update(this.companiaSelect);
            this.$refs.modalTrial.hide();
            this.$refs.listView.search();
        },
    }
}
</script>

<style>
.company-container .top-right-button-container{
    display: none;
}
.button-trial{
    width: 105px;
}
</style>