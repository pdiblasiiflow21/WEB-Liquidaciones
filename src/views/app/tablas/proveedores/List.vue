<template>
    <div class="proveedores-container">
        <div class="grid"> 
            <list-view
                resource="proveedores"
                :onBeforeSave="onBeforeSave"
                :customValidations="customValidations"
                :showActions="true"
                :showEdit="true"
                :modalSize="modalSize"
                :showDelete="true"
                :onBeforeEdit="onBeforeEdit"
            >
                <template slot='title'>
                    Proveedores 
                </template>
                <template slot='columns'>
                    <column field="id" title="Id" width="40" />
                    <column field="nombre" title="Razon Social / Nombre Completo" width="100"/>   
            
                    <column field="cuit" title="CUIT" width="50"/> 
                    <column :field="(entity) => { return entity.direccion != null ? `${entity.direccion} ` : '' }" title="Dirección" width="200" />   
                    <column :field="(entity) => { return entity.email != null ? `${entity.email} ` : '' }" title="Email" width="80" />  
                    <column :field="(entity) => { return entity.celular != null ? `${entity.celular} ` : '' }" title="Nro Telefónico (Celular)" width="80" />    
                    <column :field="(entity) => { return entity.diasPago != null ? `${entity.diasPago} ` : '' }" title="Dias Pago" width="80" />                                         
                </template>
                <template slot='modal-form' slot-scope="props">               
                    <b-row>
                        <b-col>      
                            <b-form-group label="Razon Social / Nombre Completo">
                                <b-form-input  v-model="props.form.entity.nombre" placeholder="Razon Social / Nombre Completo" :state="$isValid(props.form.$v.form.entity.nombre)" />
                                <b-form-invalid-feedback>Ingrese Razon Social / Nombre Completo</b-form-invalid-feedback>
                            </b-form-group> 
                        </b-col>
                        <b-col>
                            <b-form-group label="Cuit">
                                <b-form-input  v-model="props.form.entity.cuit" placeholder="Cuit" :state="$isValid(props.form.$v.form.entity.cuit)" />
                                <b-form-invalid-feedback>Ingrese CUIT</b-form-invalid-feedback>
                            </b-form-group> 
                        </b-col>
                        <b-col>
                            <b-form-group label="Dirección">
                                 <b-form-input  v-model="props.form.entity.direccion" placeholder="Dirección" :state="$isValid(props.form.$v.form.entity.direccion)" />
                                <b-form-invalid-feedback>Ingrese Dirección</b-form-invalid-feedback>                        
                            </b-form-group> 
                        </b-col>
                        </b-row>
                    <b-row>
                        <b-col>      
                            <b-form-group label="Email">
                                <b-form-input  v-model="props.form.entity.email" placeholder="Email" :state="$isValid(props.form.$v.form.entity.email)" />
                                <b-form-invalid-feedback>Ingrese Email</b-form-invalid-feedback>                        
                            </b-form-group> 
                        </b-col>
                        <b-col>
                            <b-form-group label="Teléfono">
                                <b-form-input  v-model="props.form.entity.celular" placeholder="Teléfono" :state="$isValid(props.form.$v.form.entity.celular)" />
                                <b-form-invalid-feedback>Ingrese el teléfono</b-form-invalid-feedback>                        
                            </b-form-group> 
                        </b-col>
                        <b-col>
                            <b-form-group label="Dias Pago">
                                <b-form-input type="number" min="0" v-model="props.form.entity.diasPago" placeholder="Dias Pago" :state="$isValid(props.form.$v.form.entity.diasPago)" />
                                <b-form-invalid-feedback>Los días de pago deben ser mayor o igual a 0</b-form-invalid-feedback>
                            </b-form-group>      
                        </b-col>
                    </b-row>
                    <b-form>
                        <b-row>
                            <b-col>
                                <h3>Contactos</h3>
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col>
                                <b-form-group label="Nombre">
                                    <b-form-input  v-model="props.form.entity.contactonombre" placeholder="Nombre"  />
                                </b-form-group>
                            </b-col>
                            <b-col>
                                <b-form-group label="Apellido">
                                    <b-form-input  v-model="props.form.entity.contactoapellido" placeholder="Apellido"  />
                                </b-form-group>
                            </b-col>
                            <b-col>
                                <b-form-group label="Email">
                                    <b-form-input  v-model="props.form.entity.contactoemail" placeholder="Email"  />
                                </b-form-group>
                            </b-col>
                            <b-col>
                                <b-form-group label="Tel.">
                                    <b-form-input  v-model="props.form.entity.contactocelular" placeholder="Tel"  />
                                </b-form-group>   
                            </b-col>
                            <b-col>                              
                                <div class="button-container">
                                    <b-button @click="agregarItem(props.form.entity)" variant="outline-primary" size="lg" class="mb-1" >Agregar</b-button>        
                                </div>   
                            </b-col>
                        </b-row>
                    </b-form>
                    <b-row>
                        <b-col>
                            <table class="table table-striped">
                                <tbody>
                                     <tr class="header">
                                        <td>Nombre</td>
                                        <td>Apellido</td>
                                        <td>Email</td>
                                        <td>Teléfono</td>
                                        <td class="text-right">
                                            Acciones
                                        </td>
                                    </tr>
                                    <tr v-for="item in contactoproveedor.filter(x => !x.deleted)" :key="item.id">
                                        <td>{{ item.nombre }}</td>
                                        <td>{{ item.apellido }}</td>
                                        <td>{{ item.email }}</td>                                        
                                        <td>{{ item.celular }}</td>
                                        <td class="text-right">
                                            <a href="#" @click.prevent="deleteItem(item)" class="simple-icon-trash"></a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </b-col>
                    </b-row>                                            
                </template>
            </list-view>
        </div>   
        <loading ref="loader" />       
    </div>
</template>

<script>
    const { required, minValue } = require('vuelidate/lib/validators')

    export default {
        data () {
            return {
                customValidations: {                    
                    nombre: { required },
                    direccion:{},
                    email:{required},
                    celular:{},
                    cuit:{},
                    diasPago:{ minValue: minValue(0) },
                    contactoproveedor: {},

                },
                contactoproveedor: [],                
                modalSize: 'xl',
            }
        },
        methods: {
            onBeforeSave (form) {
                let result = { hasErrors: false, messages: [] };
                //add validations here  
                result.hasErrors = result.messages.length > 0;
                   form.entity.contactoProveedor = [...this.contactoproveedor ];

                //apply custom logic here

                return Promise.resolve(result);
            },
            onBeforeEdit (form) {
                let result = { hasErrors: false, messages: [] };
                result.hasErrors = result.messages.length > 0;
                if (form.entity && form.entity.id > 0) {
                    this.contactoproveedor = form.entity.contactoProveedor ? [...form.entity.contactoProveedor ] : [];
                } else {
                    this.contactoproveedor = [];
                }
                
                return Promise.resolve(result); 
            },    
            agregarItem(p) {
                this.contactoproveedor.push({nombre: p.contactonombre, apellido: p.contactoapellido, email: p.contactoemail, celular: p.contactocelular });
                p.contactonombre = '';
                p.contactoapellido = '';
                p.contactoemail = '';
                p.contactocelular = '';
            },
             deleteItem(proveedor) {
                var removeIndex = this.contactoproveedor.map(function (proveedor) {
                    return proveedor;
                }).indexOf(proveedor);
      // remove object
                this.contactoproveedor[removeIndex].deleted = true;
            },
        }
    };
</script>


<style>
    .invalid-feedback.show {
        display: block
    }
    
    .button-container{
        padding-top: 10%;
    }

    table tbody tr.header {
        background-color: white !important;
        font-weight: 700;
        font-size: 14px;
    }

table tbody tr.header td{
        background-color: white;
    }
        
</style>